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

// GET /dish/:restaurantId
dishRouter.get("/:restaurantId",
[
    verifyJWT,
    verifyProperty,
],
   async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    try {
        const dishes = await dishRepository.findRestaurantDishes(restaurantId);
        res.status(200).json(dishes);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /dish/:restaurantId
dishRouter.post("/:restaurantId",
[
    verifyJWT,
    verifyProperty,
    upload.single("photo")
],
    async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);

    console.log(restaurantId);


    const dish = req.body as DishModel;
    try {
        const dishSaved = await dishRepository.addDish(restaurantId, dish);
        res.status(201).json(dishSaved);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT /dish/:dishId
dishRouter.put("/:dishId",
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

// DELETE /dish/:dishId
dishRouter.delete("/:dishId", 
    [verifyJWT,
    verifyProperty],
    async (req: Request, res: Response) => {
    const dish_id = Number(req.params.dish_id);
    try {
        await dishRepository.deleteDish(dish_id);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


export default dishRouter;