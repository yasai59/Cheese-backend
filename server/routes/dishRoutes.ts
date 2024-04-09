import express, { Router } from "express";
import { verifyJWT, verifyProperty } from "../middlewares";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dishController from "../controllers/dishController";

const dir = path.dirname(new URL(import.meta.url).pathname);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(dir, "../../uploads/dish_photos/"));
  },
  filename: (req, file, cb) => {
    const name =
      req.user?.name +
      "_" +
      uuidv4() +
      Date.now() +
      "." +
      path.extname(file.originalname);
    cb(null, name);
  },
});
const upload = multer({ storage });

const dishRouter: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dishes
 *   description: API endpoints for managing dishes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DishModel:
 *       type: object
 *       required:
 *         - id
 *         - restaurant_id
 *         - name
 *         - price
 *         - photo
 *         - description
 *       properties:
 *         id:
 *           type: number
 *           description: The ID of the dish.
 *         restaurant_id:
 *           type: number
 *           description: The ID of the restaurant to which the dish belongs.
 *         name:
 *           type: string
 *           description: The name of the dish.
 *         price:
 *           type: number
 *           description: The price of the dish.
 *         photo:
 *           type: string
 *           description: The filename of the photo of the dish.
 *         description:
 *           type: string
 *           description: A description of the dish.
 */

/**
 * @swagger
 * /api/dish/{restaurantId}:
 *   get:
 *     tags:
 *       - Dishes
 *     summary: Get dishes by restaurant ID
 *     description: Retrieve all dishes for a given restaurant ID.
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of dishes for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DishModel'
 *       '500':
 *         description: Internal Server Error
 */
dishRouter.get(
  "/:restaurantId",
  [verifyJWT],
  dishController.getRestaurantDishes
);

/**
 * @swagger
 * /api/dish/{restaurantId}:
 *   post:
 *     tags:
 *       - Dishes
 *     summary: Create a new dish
 *     description: Create a new dish for the specified restaurant.
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
 *             $ref: '#/components/schemas/DishModel'
 *     responses:
 *       '201':
 *         description: The created dish
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishModel'
 *       '500':
 *         description: Internal Server Error
 */
dishRouter.post(
  "/:restaurantId",
  [verifyJWT, verifyProperty, upload.single("photo")],
  dishController.createDish
);

/**
 * @swagger
 * /api/dish/{dishId}:
 *   put:
 *     tags:
 *       - Dishes
 *     summary: Update a dish
 *     description: Update an existing dish.
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         description: ID of the dish to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishModel'
 *     responses:
 *       '200':
 *         description: The updated dish
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishModel'
 *       '500':
 *         description: Internal Server Error
 */
dishRouter.put("/:dishId", [verifyJWT], dishController.updateDish);

/**
 * @swagger
 * /api/dish/{dishId}:
 *   delete:
 *     tags:
 *       - Dishes
 *     summary: Delete a dish
 *     description: Delete a dish by its ID.
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         description: ID of the dish to delete
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Dish deleted successfully
 *       '500':
 *         description: Internal Server Error
 */
dishRouter.delete("/:dishId", [verifyJWT], dishController.deleteDish);

/**
 * @swagger
 * /api/dish/photo/{photo}:
 *   get:
 *     tags:
 *       - Dishes
 *     summary: Get dish photo
 *     description: Get the photo of a dish by its filename.
 *     parameters:
 *       - in: path
 *         name: photo
 *         required: true
 *         description: Filename of the dish photo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The dish photo
 *       '500':
 *         description: Internal Server Error
 */
dishRouter.get("/photo/:photo", dishController.getDishPhoto);

export default dishRouter;
