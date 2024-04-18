import express, { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares";
import reasonController from "../controllers/reasonController";
import { verify } from "jsonwebtoken";

const reasonRouter: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: API endpoints for managing reports
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReasonModel:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: number
 *           description: The ID of the reason.
 *         name:
 *           type: string
 *           description: The name of the reason.
 */

/**
 * @swagger
 * /api/reason:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Create a new reason
 *     description: Create a new reason.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: name of the reason
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReasonModel'
 *     responses:
 *       '201':
 *         description: The created report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReasonModel'
 *       '500':
 *         description: Internal Server Error
 */
reasonRouter.post("/", verifyJWT, reasonController.createReason);

/**
 * @swagger
 * /api/reason/getAll:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Gets all reasons
 *     description: Gets all reasons.
 *     responses:
 *       '201':
 *         description: The created report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReasonModel'
 *       '500':
 *         description: Internal Server Error
 */
reasonRouter.get("/getAll", [verifyJWT, verifyRole(3)], reasonController.getAllReason);

export default reasonRouter;
