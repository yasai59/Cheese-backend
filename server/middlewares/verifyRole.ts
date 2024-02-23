import type { Request, Response, NextFunction } from "express";
import type UserModel from "../models/User.model";

export const verifyRole = (role_id: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserModel;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role_id !== role_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
};
