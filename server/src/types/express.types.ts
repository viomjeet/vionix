import { Request } from 'express';
import { JWTPayload } from './auth.types.js';

export interface AuthenticatedRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[] | undefined>
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JWTPayload;
}
