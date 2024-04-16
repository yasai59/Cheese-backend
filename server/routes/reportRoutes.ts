import express, { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares";
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
reportRouter.post("/:restaurantId", [verifyJWT], reportController.createReport);

/**
 * @swagger
 * /api/report/getReports/{restaurantId}:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Get all reports from a restaurant (admin only)
 *     description: Get all reports from a restaurant (admin only)
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: The reports from the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportModel'
 *       '500':
 *         description: Internal Server Error
 */
reportRouter.get("/getReports/:restaurantId", [verifyJWT, verifyRole(3)], reportController.findRestaurantReports);

/**
 * @swagger
 * /api/report/getAll:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Get all reports  (admin only)
 *     description: Get all reports (admin only)
 *     responses:
 *       '201':
 *         description: All reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportModel'
 *       '500':
 *         description: Internal Server Error
 */
reportRouter.get("/getAll", [verifyJWT, verifyRole(3)], reportController.findAllReports);



export default reportRouter;
