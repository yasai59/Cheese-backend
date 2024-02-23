import express, { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

import MailSender from "../mail/MailSender";
import UserRepository from "../database/User.repository";
import type UserModel from "../models/User.model";
import { verifyJWT } from "../middlewares/verifyJWT";

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
  try {
    await userRepository.verify(user);
  } catch (error) {
    return res.status(500).send("<h1>Error verifying the user</h1>");
  }
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
    dbUser.email,
    "Welcome to the app",
    `
    <h1>Welcome to cheese</h1> 
    <br> 
    <a href="https://apicheese.yasai59.com/api/user/verify?code=${verificationCode}">Click here to verify your account</a>
    `
  );
  // create the token
  const token: string = jwt.sign(
    {
      email: dbUser.email,
    },
    process.env.JWT_SECRET as string
  );

  delete dbUser.password;

  res.json({
    message: "User created successfully",
    token,
    user: dbUser,
  });
});

// POST /api/user/login
userRouter.post("/login", async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const password: string = req.body.password;

  // check if the user is an email
  if (!username) {
    return res.status(400).json({
      message: "the user is required",
    });
  }
  if (!password) {
    return res.status(400).json({
      message: "the password is required",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const isEmail = emailRegex.test(username);

  let dbUser: UserModel;
  if (isEmail) {
    try {
      dbUser = await userRepository.findByEmail(username);
    } catch (error) {
      return res.status(400).json({
        message: "Username or password are invalid",
      });
    }
  } else {
    try {
      dbUser = await userRepository.findByUsername(username);
    } catch (error) {
      return res.status(400).json({
        message: "Username or password are invalid",
      });
    }
  }

  if (!dbUser) {
    return res.status(400).json({
      message: "Username or password are invalid",
    });
  }

  if (!bcrypt.compareSync(password, dbUser.password ?? "")) {
    return res.status(400).json({
      message: "Username or password are invalid",
    });
  }

  delete dbUser.password;

  const token: string = jwt.sign(
    {
      email: dbUser.email,
    },
    process.env.JWT_SECRET as string
  );

  res.json({
    message: "User logged in successfully",
    token,
    user: dbUser,
  });
});

// PUT /api/user
userRouter.put("/", [verifyJWT], async (req: Request, res: Response) => {
  const reqUser = req.user as UserModel;
  let user: UserModel = req.body;
  user.id = reqUser.id;

  user.role_id = user.role_id === 1 ? 1 : 2;

  try {
    const userDb = await userRepository.update(user);
    if (!userDb) throw new Error("Error updating the user");
    return res.json({
      message: "User updated successfully",
      userDb,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating the user",
    });
  }
});

// POST /api/user/forgot-password
userRouter.post("/forgot-password", async (req: Request, res: Response) => {
  const email: string = req.body.email;
  if (!email) {
    return res.status(400).json({
      message: "the email is required",
    });
  }

  let user: UserModel;
  try {
    user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error finding the user",
    });
  }

  let verificationCode = Math.floor(Math.random() * 1000000);
  // save the verification code
  try {
    await userRepository.saveAction(user, verificationCode, "RESET_PASSWORD");
  } catch (error) {
    return res.status(500).json({
      message: "Error saving the verification code",
    });
  }

  // send the email
  mailSender.sendMail(
    user.email,
    "Reset your password",
    `
    <h1>Reset your password</h1> 
    <br> 
    <a href="https://apicheese.yasai59.com/api/user/reset-password?code=${verificationCode}&email=${user.email}">Click here to reset your password</a>
    `
  );

  res.json({
    message: "Email sent successfully",
  });
});
// TODO: change the reset password to a form
// GET /api/user/reset-password
userRouter.get("/reset-password", async (req: Request, res: Response) => {
  const verificationCode = req.query.code as string;
  const email = req.query.email as string;

  if (!verificationCode) {
    return res.status(400).json({
      message: "the verification code is required",
    });
  }

  let user: UserModel;
  try {
    user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error finding the user",
    });
  }

  if (user.verification_code !== Number(verificationCode)) {
    return res.status(400).json({
      message: "Invalid verification code",
    });
  }

  user.password = "1234";

  try {
    await userRepository.update(user);
    await userRepository.saveAction(user, null, null);
  } catch (error) {
    return res.status(500).json({
      message: "Error updating the password",
    });
  }

  res.send(
    "<h1>Password reset successfully to 1234 (this is temporal, we'll make a proper form)</h1>"
  );
});

export default userRouter;
