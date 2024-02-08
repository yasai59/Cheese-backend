import express, { Router } from "express";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import MailSender from "../mail/MailSender";
import UserRepository from "../database/User.repository";
import type UserModel from "../models/User.model";

const userRepository = new UserRepository();

const mailSender = MailSender.getInstance();

const userRouter: Router = express.Router();
// GET /api/user/verify
userRouter.get("/verify", async (req: Request, res: Response) => {
  // get the verification code
  const verificationCode = req.query.code as string;
  const email = atob(verificationCode);
  let user: UserModel;
  // find the user
  try {
    user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
  } catch (error) {
    return res.status(400).send("<h1>Verification link not valid</h1>");
  }
  // verify the user
  await userRepository.verify(user);
  res.send("<h1>User verified successfully</h1>");
});

// POST /api/user
userRouter.post("/", async (req: Request, res: Response) => {
  // check the user
  if (!req.body.user) {
    return res.status(400).json({
      message: "the user is required",
    });
  }

  // check the password
  if (!req.body.user.password) {
    return res.status(400).json({
      message: "the password is required",
    });
  }
  // extract the user and save to the database
  let { user }: { user: UserModel } = req.body;
  user.role_id = user.role_id === 1 ? 1 : 2;
  user.password = bcrypt.hashSync(user.password ?? "", 10);
  let dbUser: UserModel;
  try {
    dbUser = await userRepository.save(user);
  } catch (e) {
    return res.status(500).json({
      message: "Error creating the user",
    });
  }

  const verificationCode = btoa(dbUser.email);

  // send the email
  // TODO: change the link to the production link
  mailSender.sendMail(
    user.email,
    "Welcome to the app",
    `
    <h1>Welcome to cheese</h1> 
    <br> 
    <a href="http://localhost:3000/api/user/verify?code=${verificationCode}">Click here to verify your account</a>
    `
  );
  res.json({
    message: "User created successfully",
  });
});

export default userRouter;
