import express, { Router } from "express";
import type { Request, Response } from "express";
import DishRepository from "../database/Dish.repository";
import type DishModel from "../models/Dish.model";
import { verifyJWT } from "../middlewares/verifyJWT";
import { verifyProperty } from "../middlewares/verifyProperty";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

const dishRepository = new DishRepository();
const dishRouter: Router = express.Router();

/**
 * @swagger
 * /api/dish/{restaurantId}:
 *   get:
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
  [verifyJWT, verifyProperty],
  async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    try {
      const dishes = await dishRepository.findRestaurantDishes(restaurantId);
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/dish/{restaurantId}:
 *   post:
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
  async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const dish = req.body as DishModel;
    try {
      const dishSaved = await dishRepository.addDish(restaurantId, dish);
      res.status(201).json(dishSaved);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/dish/{dishId}:
 *   put:
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
dishRouter.put(
  "/:dishId",
  [verifyJWT, verifyProperty],
  async (req: Request, res: Response) => {
    const dish = req.body.dish as DishModel;
    try {
      const dishUpdated = await dishRepository.updateDish(dish);
      res.status(200).json(dishUpdated);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/dish/{dishId}:
 *   delete:
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
dishRouter.delete(
  "/:dishId",
  [verifyJWT, verifyProperty],
  async (req: Request, res: Response) => {
    const dish_id = Number(req.params.dish_id);
    try {
      await dishRepository.deleteDish(dish_id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /api/dish/photo/{photo}:
 *   get:
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
dishRouter.get("/photo/:photo", async (req: Request, res: Response) => {
  const photo = req.params.photo;
  try {
    res.sendFile(path.join(dir, "../../uploads/dish_photos/", photo));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default dishRouter;
