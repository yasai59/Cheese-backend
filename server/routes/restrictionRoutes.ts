import express, { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT";
import restrictionController from "../controllers/restrictionController";

const restrictionRouter: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restriction
 *   description: Restriction management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RestrictionModel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the restriction.
 *         name:
 *           type: string
 *           description: The name of the restriction.
 *       required:
 *         - name
 */

/**
 * @swagger
 * /api/restriction:
 *   get:
 *     tags:
 *       - Restriction
 *     summary: Get user restrictions
 *     description: Retrieve all restrictions associated with the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of user restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restrictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictionModel'
 *       '500':
 *         description: Internal Server Error
 */
restrictionRouter.get(
  "/",
  [verifyJWT],
  restrictionController.getUserRestrictions
);

/**
 * @swagger
 * /api/restriction/all:
 *   get:
 *     tags:
 *       - Restriction
 *     summary: Get all restrictions
 *     description: Retrieve all restrictions available in the application.
 *     responses:
 *       '200':
 *         description: A list of all restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restrictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictionModel'
 *       '500':
 *         description: Internal Server Error
 */
restrictionRouter.get("/all", [], restrictionController.getAllRestrictions);

/**
 * @swagger
 * /api/restriction:
 *   post:
 *     tags:
 *       - Restriction
 *     summary: Add restrictions to user
 *     description: Add multiple restrictions to the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the restriction
 *     responses:
 *       '200':
 *         description: Restrictions added to user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userRestrictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictionModel'
 *       '500':
 *         description: Internal Server Error
 */
restrictionRouter.post(
  "/",
  [verifyJWT],
  restrictionController.addRestrictionsToUser
);

/**
 * @swagger
 * /api/restriction/dish/{dishId}:
 *   get:
 *     tags:
 *       - Restriction
 *     summary: Get dish restrictions
 *     description: Retrieve all restrictions associated with a specific dish.
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         description: ID of the dish
 *         schema:
 *           type: integer
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of dish restrictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restrictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictionModel'
 *       '500':
 *         description: Internal Server Error
 */
restrictionRouter.get(
  "/dish/:dishId",
  [verifyJWT],
  restrictionController.getDishRestrictions
);

/**
 * @swagger
 * /api/restriction/dish/{dishId}:
 *   post:
 *     tags:
 *       - Restriction
 *     summary: Add restrictions to dish
 *     description: Add multiple restrictions to a specific dish.
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         description: ID of the dish
 *         schema:
 *           type: integer
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the restriction
 *     responses:
 *       '200':
 *         description: Restrictions added to dish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 dishRestrictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictionModel'
 *       '500':
 *         description: Internal Server Error
 */
restrictionRouter.post(
  "/dish/:dishId",
  [verifyJWT],
  restrictionController.addRestrictionsToDish
);

/**
 * @swagger
 * /api/restriction/create:
 *   get:
 *     summary: Creates restriction
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
restrictionRouter.post("/create", [verifyJWT], restrictionController.createRestriction);

export default restrictionRouter;
