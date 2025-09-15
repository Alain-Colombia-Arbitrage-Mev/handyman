import { UserRole } from './index';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: DecodedIdToken & {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};