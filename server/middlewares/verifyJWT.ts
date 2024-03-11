import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserRepository from "../database/User.repository";
import type UserModel from "../models/User.model";

const userRepository = new UserRepository();

interface Decoded {
  email: string;
}

// extend req object to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["x-token"] as string;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as Decoded;
    const user = await userRepository.findByEmail(decoded.email);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
