import type { Request, Response } from "express";
import DishRepository from "../database/Dish.repository";
import type DishModel from "../models/Dish.model";
import path from "path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const dishRepository = new DishRepository();

class DishController {
  async getRestaurantDishes(req: Request, res: Response) {
    const restaurantId = Number(req.params.restaurantId);
    try {
      const dishes = await dishRepository.findRestaurantDishes(restaurantId);
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async createDish(req: Request, res: Response) {
    const restaurantId = Number(req.params.restaurantId);
    const dish = req.body as DishModel;
    try {
      const dishSaved = await dishRepository.addDish(restaurantId, dish);
      res.status(201).json(dishSaved);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateDish(req: Request, res: Response) {
    const dish = req.body as DishModel;
    try {
      const dishUpdated = await dishRepository.updateDish(dish);
      res.status(200).json(dishUpdated);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteDish(req: Request, res: Response) {
    const dishId = Number(req.params.dishId);
    try {
      await dishRepository.deleteDish(dishId);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getDishPhoto(req: Request, res: Response) {
    const photo = req.params.photo;
    try {
      res.sendFile(path.join(dir, "../../uploads/dish_photos/", photo));
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new DishController();
