import express, { Router } from "express";
import multer from "multer";
import path from "path";
import { check } from "express-validator";

import UserRepository from "../database/User.repository";
import type UserModel from "../models/User.model";
import { verifyJWT } from "../middlewares/verifyJWT";
import { validarCampos } from "../helpers/verifyFields";
import userController from "../controllers/userController";

const dir = path.dirname(new URL(import.meta.url).pathname);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(dir, "../../uploads/user_photos/"));
  },
  filename: function (req, file, cb) {
    const user = req.user as UserModel;

    const newFilename = `${user.id}.png`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage });

const userRouter: Router = express.Router();

// GET /api/user/verify
userRouter.get("/verify", userController.verifyUser);
// GET /api/user/myUser
userRouter.get("/myUser", [verifyJWT], userController.myUser);

// POST /api/user
userRouter.post(
  "/",
  [
    check("username", "the user is required").notEmpty(),
    check("password", "the password is required").notEmpty(),
    check("email", "the email is required").isEmail(),
    validarCampos,
  ],
  userController.postUser
);

// POST /api/user/login
userRouter.post(
  "/login",
  [
    check("username", "username is required").notEmpty(),
    check("password", "password is required").notEmpty(),
    validarCampos,
  ],
  userController.login
);

// PUT /api/user
userRouter.put("/", [verifyJWT], userController.updateUser);
// POST /api/user/photo -> change photo
userRouter.post(
  "/photo",
  [verifyJWT, upload.single("photo")],
  userController.changePhoto
);

userRouter.get("/photo", [verifyJWT], userController.getMyPhoto);

// POST /api/user/forgot-password
userRouter.post("/forgot-password", userController.forgotPassword);

// TODO: change the reset password to a form
// GET /api/user/reset-password
userRouter.get("/reset-password", userController.resetPassword);

userRouter.post("/change-password", [verifyJWT], userController.changePassword);

userRouter.delete("/", [verifyJWT], userController.deleteUser);

// POST /api/user/google
userRouter.post(
  "/google",
  [
    check("email", "the email is required"),
    check("name", "the name is required"),
    check("photo", "the photo is required"),
    validarCampos,
  ],
  userController.googleLogin
);
export default userRouter;
