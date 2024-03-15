import express, { Router } from "express";
import type { Request, Response } from "express";
import DishRepository from "../database/Dish.repository";
import type DishModel from "../models/Dish.model";
import { verifyJWT } from "../middlewares/verifyJWT";
import { verifyProperty } from "../middlewares/verifyProperty";
import multer from "multer";
import path from "path";
import { check } from "express-validator"
import { v4 as uuidv4 } from 'uuid';


const dir = path.dirname(new URL(import.meta.url).pathname);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(dir, "../../uploads/dish_photos/"));
    },
    filename: (req, file, cb) => {
        const name = req.user?.name + "_" + uuidv4() + Date.now + "." + path.extname(file.originalname);
        cb(null, name);
    },
});

const upload = multer({ storage });

const dishRepository = new DishRepository();
const dishRouter: Router = express.Router();

// GET /dishes/:restaurant_id
dishRouter.get("/:restaurant_id",
[
    verifyJWT,
    verifyProperty,
],
   async (req: Request, res: Response) => {
    const restaurant_id = Number(req.params.restaurant_id);
    try {
        const dishes = await dishRepository.findRestaurantDishes(restaurant_id);
        res.status(200).json(dishes);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /dishes/:restaurant_id
dishRouter.post("/:restaurant_id",
[
    verifyJWT,
    verifyProperty,
    upload.single("photo")
],
     async (req: Request, res: Response) => {
    const dish = req.body.dish as DishModel;
    try {
        const dishSaved = await dishRepository.addDish(dish);
        res.status(201).json(dishSaved);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT /dishes/:dish_id
dishRouter.put("/:dish_id",
[
    verifyJWT,
    verifyProperty,
],
   async (req: Request, res: Response) => {
    const dish = req.body.dish as DishModel;
    try {
        const dishUpdated = await dishRepository.updateDish(dish);
        res.status(200).json(dishUpdated);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE /dishes/:dish_id
dishRouter.delete("/:dish_id", verifyJWT, verifyProperty, async (req: Request, res: Response) => {
    const dish_id = Number(req.params.dish_id);
    try {
        await dishRepository.deleteDish(dish_id);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


export default dishRouter;