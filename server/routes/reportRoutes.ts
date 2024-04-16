import express, { Router } from "express";
import { verifyJWT, verifyProperty } from "../middlewares";
import reportController from "../controllers/reportController";

const reportRouter: Router = express.Router();

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
 *     ReportModel:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - restaurant_id
 *         - report_date
 *       properties:
 *         id:
 *           type: number
 *           description: The ID of the report.
 *         user_id:
 *           type: number
 *           description: The ID of the user to which the report belongs.
 *         restaurant_id:
 *           type: string
 *           description: The ID of the restaurant to which the report belongs.
 *         report_date:
 *           type: date
 *           description: The date when the report was created.
 */

/**
 * @swagger
 * /api/report/{restaurantId}:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Create a new report
 *     description: Create a new report for the specified restaurant.
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportModel'
 *     responses:
 *       '201':
 *         description: The created report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportModel'
 *       '500':
 *         description: Internal Server Error
 */
reportRouter.post("/:restaurantId", [verifyJWT, verifyProperty], reportController.createReport);


export default reportRouter;
