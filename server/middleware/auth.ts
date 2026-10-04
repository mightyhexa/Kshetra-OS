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
  aadhaarMasked?: string;
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
      jurisdictionState: user.jurisdictionState,
      aadhaarMasked: user.aadhaarMasked
    },
    config.jwtSecret,
    { expiresIn: '2h' }
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  } else if (req.query.access_token && typeof req.query.access_token === 'string') {
    token = req.query.access_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Valid Bearer JWT token or query parameter token must be provided.'
      }
    });
    return;
  }

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

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        }
      });
      return;
    }
    next();
  };
}
