import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const extractUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { userId: decoded.userId };
  } catch {
    console.error('userId 조회 실패');
  }
  next();
};
