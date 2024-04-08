import express, { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT";
import tasteController from "../controllers/tasteController";

const tasteRouter: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tastes
 *   description: API endpoints for managing tastes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TasteModel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: The unique identifier for the taste.
 *         name:
 *           type: string
 *           description: The name of the taste.
 *       required:
 *         - name
 */

/**
 * @swagger
 * /api/taste/:
 *   get:
 *     summary: Get all tastes of the current user
 *     tags: [Tastes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message confirming the operation.
 *                 tastes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TasteModel'
 *       500:
 *         description: Internal Server Error
 */
tasteRouter.get("/", [verifyJWT], tasteController.getUserTastes);

/**
 * @swagger
 * /api/taste/all:
 *   get:
 *     summary: Get all tastes
 *     tags: [Tastes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message confirming the operation.
 *                 tastes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TasteModel'
 *       500:
 *         description: Internal Server Error
 */
tasteRouter.get("/all", [verifyJWT], tasteController.getAllTastes);

/**
 * @swagger
 * /api/taste:
 *   post:
 *     summary: Add tastes to the current user
 *     tags: [Tastes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tastes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message confirming the operation.
 *                 userTastes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TasteModel'
 *       500:
 *         description: Internal Server Error
 */
tasteRouter.post("/", [verifyJWT], tasteController.addTastesToUser);

export default tasteRouter;
