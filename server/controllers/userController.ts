import UserRepository from "../database/User.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

import MailSender from "../mail/MailSender";
import type UserModel from "../models/User.model";
import type { Request, Response } from "express";
import axios from "axios";
import { verifyGoogle } from "../helpers/verifyGoogle";

const userRepository = new UserRepository();
const mailSender = MailSender.getInstance();

const dir = path.dirname(new URL(import.meta.url).pathname);

class UserController {
  async verifyUser(req: Request, res: Response) {
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
  }

  async myUser(req: Request, res: Response) {
    const user = req.user as UserModel;
    delete user.password;
    res.json({
      message: "User found",
      user,
    });
  }

  async postUser(req: Request, res: Response) {
    // extract the user and save to the database
    let user: UserModel = req.body;
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
  }

  async login(req: Request, res: Response) {
    const username: string = req.body.username;
    const password: string = req.body.password;

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
  }

  async updateUser(req: Request, res: Response) {
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
    } catch (error: any) {
      if (error.message === "duplicate entry") {
        return res.status(400).json({
          message: "duplicate entry for the email or the username",
        });
      }
      return res.status(500).json({
        message: "Error updating the user",
      });
    }
  }

  async changePhoto(req: Request, res: Response) {
    let user = req.user as UserModel;
    delete user.password;
    user.photo = `${user.id}.png`;

    try {
      const userDb = await userRepository.update(user);
      if (!userDb) throw new Error("Error updating the user");
      return res.json({
        message: "Photo updated successfully",
        user: userDb,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating the photo",
      });
    }
  }

  async getMyPhoto(req: Request, res: Response) {
    let user = req.user as UserModel;
    if (!user || !user.photo) {
      return res.sendFile(
        path.join(dir, `../../uploads/user_photos/default.jpg`)
      );
    }
    // look if image exists
    if (
      !fs.existsSync(path.join(dir, `../../uploads/user_photos/${user.photo}`))
    ) {
      return res.sendFile(
        path.join(dir, `../../uploads/user_photos/default.jpg`)
      );
    }
    res.sendFile(path.join(dir, `../../uploads/user_photos/${user.photo}`));
  }

  async forgotPassword(req: Request, res: Response) {
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
  }

  async resetPassword(req: Request, res: Response) {
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
  }

  async changePassword(req: Request, res: Response) {
    const reqUser = req.user as UserModel;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "the old password and the new password are required",
      });
    }
    let user: UserModel;
    try {
      user = await userRepository.findByEmail(reqUser.email);
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

    if (!bcrypt.compareSync(oldPassword, user.password as string)) {
      return res.status(400).json({
        message: "Old password is invalid",
      });
    }

    user.password = newPassword;

    try {
      const userDb = await userRepository.update(user);
      if (!userDb) throw new Error("Error updating the user");
      return res.json({
        message: "Password updated successfully",
        user: userDb,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating the password",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const reqUser = req.user as UserModel;
    try {
      await userRepository.delete(reqUser.id as number);
      return res.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting the user",
      });
    }
  }

  async googleLogin(req: Request, res: Response) {
    // check if the user exists
    const { email, name, photo, userId, idToken, web = false } = req.body;

    console.log({ email, name, photo, userId, idToken, web });

    // verify google token
    if (!web) {
      try {
        const user = await verifyGoogle(idToken);
        if (user !== userId) {
          return res.status(400).json({
            message: "Invalid token",
          });
        }
      } catch (e) {
        return res.status(400).json({
          message: "Invalid token",
        });
      }
    } else {
      const userResp = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${idToken}`
      );

      if (userId !== userResp.data.id) {
        return res.status(400).json({
          message: "Invalid token",
        });
      }
    }

    let user: UserModel | undefined = undefined;
    try {
      user = await userRepository.findByEmail(email);
    } catch (error) {}
    if (user != undefined) {
      // create the token
      const token: string = jwt.sign(
        {
          email: user.email,
        },
        process.env.JWT_SECRET as string
      );

      delete user.password;

      return res.json({
        message: "User logged in successfully",
        token,
        user,
      });
    }

    // check if the user exist with the same username, if so, add a number to the username
    let username = name;
    let i = 1;
    while (true) {
      try {
        const user = await userRepository.findByUsername(username);
        if (user) {
          username = `${name}${i}`;
          i++;
        } else {
          break;
        }
      } catch (error) {
        return res.status(500).json({
          message: "Error finding the user",
        });
      }
    }

    // create the user
    const newUser = {
      email,
      username: name,
      role_id: 1,
    };
    userRepository.saveGoogle(newUser as UserModel);
  }
}

const userController = new UserController();
export default userController;
