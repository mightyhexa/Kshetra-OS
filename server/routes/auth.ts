import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PERSONAS } from '../../shared/roles';
import { UserRole } from '../../shared/types';
import { signToken, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { repository } from '../repo';
import { createLedgerBlock } from '../services/ledgerService';

export const authRouter = Router();

// Validation Schemas
const LoginSchema = z.object({
  role: z.enum(['citizen', 'officer', 'policy_admin'])
});

const OtpRequestSchema = z.object({
  aadhaarNumber: z.string().min(12, '12-digit Aadhaar number required').max(16)
});

const OtpVerifySchema = z.object({
  aadhaarNumber: z.string().min(12).max(16),
  otp: z.string().length(6, '6-digit OTP required')
});

const SsoSchema = z.object({
  officerBadgeId: z.string().min(3),
  role: z.enum(['officer', 'policy_admin']).default('officer')
});

// 1-Click Role Login (Simulated authentication)
authRouter.post('/login', validateBody(LoginSchema), async (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  const user = PERSONAS[role];

  const token = signToken(user);

  // Append login event to ledger
  const blocks = await repository.getLedgerBlocks();
  const prevHash = blocks.length > 0 ? blocks[blocks.length - 1].currentHash : '';
  if (prevHash) {
    const block = createLedgerBlock(
      blocks.length,
      'ROLE_SWITCH',
      user.role,
      user.fullName,
      user.id,
      `User authenticated under ${user.role.toUpperCase()} privileges via simulated 1-click login.`,
      undefined,
      { method: '1-click-persona', role: user.role },
      prevHash
    );
    await repository.appendLedgerBlock(block);
  }

  res.json({
    success: true,
    token,
    user
  });
});

// OTP Request (Demo OTP 123456)
authRouter.post(
  '/otp/request',
  rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Too many OTP requests. Please wait a minute.' }),
  validateBody(OtpRequestSchema),
  (req: Request, res: Response) => {
    const { aadhaarNumber } = req.body;
    res.json({
      success: true,
      message: 'Simulated OTP generated successfully for Aadhaar authentication.',
      demoOtp: '123456',
      maskedAadhaar: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`
    });
  }
);

// OTP Verify (Rate-limited, max 5 attempts per minute)
authRouter.post(
  '/otp/verify',
  rateLimit({ windowMs: 60 * 1000, max: 5, message: 'Too many OTP attempts. Rate limit exceeded.' }),
  validateBody(OtpVerifySchema),
  async (req: Request, res: Response) => {
    const { otp } = req.body;

    if (otp !== '123456') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Incorrect OTP. For this prototype demo, use OTP 123456.' }
      });
      return;
    }

    const user = PERSONAS.citizen;
    const token = signToken(user);

    res.json({
      success: true,
      token,
      user
    });
  }
);

// Simulated SSO
authRouter.post('/sso', validateBody(SsoSchema), (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  const user = PERSONAS[role] || PERSONAS.officer;
  const token = signToken(user);

  res.json({
    success: true,
    token,
    user
  });
});

// Current User Profile
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});
