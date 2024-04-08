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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserModel:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: The user's ID (auto-generated)
 *           example: 1
 *         username:
 *           type: string
 *           description: The user's username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: The user's password (optional)
 *           example: "mySecurePassword123"
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
 *           description: Indicates if the user is linked to a Google account (0 or 1)
 *           example: 1
 *         verified:
 *           type: integer
 *           description: Indicates if the user's email is verified (0 or 1)
 *           example: 1
 *         verification_code:
 *           type: number
 *           description: The verification code associated with the user's email
 *           example: 123456
 *         action:
 *           type: string
 *           description: Additional action related to the user
 *           example: "reset_password"
 */

// GET /api/user/verify
/**
 * @swagger
 * /api/user/verify:
 *   get:
 *     summary: Verify User
 *     description: Verify a user using a verification code.
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: code
 *         description: The verification code for the user's email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User verified successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>User verified successfully</h1>"
 *       '400':
 *         description: Verification link not valid
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Verification link not valid</h1>"
 *       '500':
 *         description: Error verifying the user
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Error verifying the user</h1>"
 */
userRouter.get("/verify", userController.verifyUser);

// GET /api/user/myUser
/**
 * @swagger
 * /api/user/myUser:
 *   get:
 *     summary: Get User
 *     description: Get user information excluding password.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserModel"
 */
userRouter.get("/myUser", [verifyJWT], userController.myUser);

// POST /api/user
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create User
 *     description: Create a new user with username, email, and password.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "mySecurePassword123"
 *     responses:
 *       '200':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: "#/components/schemas/UserModel"
 *       '500':
 *         description: Error creating the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating the user"
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
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login User
 *     description: Login with username and password.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "mySecurePassword123"
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: "#/components/schemas/UserModel"
 *       '401':
 *         description: Unauthorized - Incorrect username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect username or password"
 *       '500':
 *         description: Error logging in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error logging in"
 */
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
/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update User
 *     description: Update user information.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserModel"
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserModel"
 *       '500':
 *         description: Error updating the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating the user"
 */
userRouter.put("/", [verifyJWT], userController.updateUser);

// POST /api/user/photo -> change photo
/**
 * @swagger
 * /api/user/photo:
 *   post:
 *     summary: Change User Photo
 *     description: Change the user's profile photo.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: User photo changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserModel"
 *       '500':
 *         description: Error changing the user's photo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error changing the user's photo"
 */
userRouter.post(
  "/photo",
  [verifyJWT, upload.single("photo")],
  userController.changePhoto
);

/**
 * @swagger
 * /api/user/photo:
 *   get:
 *     summary: Get User Photo
 *     description: Get the user's profile photo.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: The user's photo
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       '500':
 *         description: Error getting the user's photo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting the user's photo"
 */
userRouter.get("/photo", [verifyJWT], userController.getMyPhoto);

// POST /api/user/forgot-password
/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Send a reset password email to the user.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       '200':
 *         description: Reset password email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reset password email sent successfully"
 *       '404':
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email not found"
 *       '500':
 *         description: Error sending reset password email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error sending reset password email"
 */
userRouter.post("/forgot-password", userController.forgotPassword);

// GET /api/user/reset-password
/**
 * @swagger
 * /api/user/reset-password:
 *   get:
 *     summary: Reset Password
 *     description: Reset the user's password using a reset token.
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: token
 *         description: The reset token sent to the user's email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Reset password page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Reset your password</h1><form>...</form>"
 *       '500':
 *         description: Error resetting the password
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Error resetting the password</h1>"
 */
userRouter.get("/reset-password", userController.resetPassword);

// POST /api/user/change-password
/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change Password
 *     description: Change the user's password.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "myOldSecurePassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "myNewSecurePassword456"
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       '401':
 *         description: Unauthorized - Incorrect old password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect old password"
 *       '500':
 *         description: Error changing the password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error changing the password"
 */
userRouter.post("/change-password", [verifyJWT], userController.changePassword);

// DELETE /api/user
/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete User
 *     description: Delete the user's account.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: User deleted successfully
 *       '500':
 *         description: Error deleting the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting the user"
 */
userRouter.delete("/", [verifyJWT], userController.deleteUser);

// POST /api/user/google
/**
 * @swagger
 * /api/user/google:
 *   post:
 *     summary: Google Login
 *     description: Login or register a user with Google OAuth.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - photo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               photo:
 *                 type: string
 *                 example: "https://example.com/user/photo.jpg"
 *     responses:
 *       '200':
 *         description: User logged in with Google successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: "#/components/schemas/UserModel"
 *       '401':
 *         description: Unauthorized - Google login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Google login failed"
 *       '500':
 *         description: Error with Google login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error with Google login"
 */
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
