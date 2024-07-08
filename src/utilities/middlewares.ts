import express, {Request, Response, NextFunction} from 'express'
require('dotenv').config();
import jwt from 'jsonwebtoken'


const jwt_secret = process.env.JWT_SECRET || 'sfs'

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // If there is no token, return Unauthorized

  jwt.verify(token, jwt_secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as UserPayload;
    next();
  });
};


interface UserPayload {
    userId: string,
    firstName: string
}

export interface AuthenticatedRequest extends Request{
    user?: UserPayload
}