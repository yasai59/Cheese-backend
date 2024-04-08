import express, { Router } from "express";
import multer from "multer";
import path from "path";
import { check } from "express-validator";

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
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Verify User API
 *   description: API to verify a user using a verification code
 *   version: 1.0.0
 * paths:
 *   /verifyUser:
 *     get:
 *       summary: Verify User
 *       description: Verify a user using a verification code.
 *       parameters:
 *         - in: query
 *           name: code
 *           description: The verification code for the user's email
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: User verified successfully
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 example: "<h1>User verified successfully</h1>"
 *         '400':
 *           description: Verification link not valid
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 example: "<h1>Verification link not valid</h1>"
 *         '500':
 *           description: Error verifying the user
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 example: "<h1>Error verifying the user</h1>"
 *
 */
userRouter.get("/verify", userController.verifyUser);
// GET /api/user/myUser
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Get User API
 *   description: API to get a user's information
 *   version: 1.0.0
 * paths:
 *   /getUser:
 *     get:
 *       summary: Get User
 *       description: Get user information excluding password.
 *       responses:
 *         '200':
 *           description: User found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User found"
 *                   user:
 *                     $ref: "#/components/schemas/UserModel"
 * components:
 *   schemas:
 *     UserModel:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The user's ID
 *           example: 1
 *         username:
 *           type: string
 *           description: The user's username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           description: The user's email
 *           example: "john.doe@example.com"
 *         active:
 *           type: boolean
 *           description: Indicates if the user is active
 *           example: true
 *         role_id:
 *           type: number
 *           description: The user's role ID
 *           example: 2
 *         creation_date:
 *           type: string
 *           format: date-time
 *           description: The date when the user was created
 *           example: "2024-04-08T12:00:00Z"
 *         lot_number:
 *           type: number
 *           description: The user's lot number
 *           example: 1234
 *         photo:
 *           type: string
 *           description: URL to the user's photo
 *           example: "https://example.com/user/photo.jpg"
 *         google:
 *           type: integer
 *           description: Indicates if the user is linked to a Google account
 *           example: 1
 *         verified:
 *           type: integer
 *           description: Indicates if the user's email is verified
 *           example: 1
 *         verification_code:
 *           type: number
 *           description: The verification code associated with the user's email
 *           example: 123456
 *         action:
 *           type: string
 *           description: Additional action related to the user
 *           example: "reset_password"
 *
 */
userRouter.get("/myUser", [verifyJWT], userController.myUser);

// POST /api/user
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Create User API
 *   description: API to create a new user
 *   version: 1.0.0
 * paths:
 *   /postUser:
 *     post:
 *       summary: Create User
 *       description: Create a new user with username, email, and password.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - username
 *                 - email
 *                 - password
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "mySecurePassword123"
 *       responses:
 *         '200':
 *           description: User created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User created successfully"
 *                   token:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         description: The user's ID (auto-generated)
 *                       username:
 *                         type: string
 *                         example: "john_doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *       '500':
 *           description: Error creating the user
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Error creating the user"
 */

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
