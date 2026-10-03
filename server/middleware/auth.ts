import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../../shared/types';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  role: UserRole;
  designation?: string;
  jurisdictionDistrict?: string;
  jurisdictionState?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      designation: user.designation,
      jurisdictionDistrict: user.jurisdictionDistrict,
      jurisdictionState: user.jurisdictionState
    },
    config.jwtSecret,
    { expiresIn: '2h' }
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Valid Bearer JWT token must be provided.'
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Session has expired or token is invalid. Please re-authenticate.'
      }
    });
  }
}
