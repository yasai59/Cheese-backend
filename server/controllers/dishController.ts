import type { Request, Response } from "express";
import DishRepository from "../database/Dish.repository";
import type DishModel from "../models/Dish.model";
import path from "path";
import TasteRepository from "../database/Taste.repository";
import RestrictionRepository from "../database/Restriction.repository";

const tasteRepository = new TasteRepository();
const restrictionRepository = new RestrictionRepository();

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

  async createDish(req: any, res: Response) {
    const restaurantId = Number(req.params.restaurantId);
    let dish = req.body as DishModel;

    dish.tastes = JSON.parse(dish.tastes);
    dish.restrictions = JSON.parse(dish.restrictions);

    try {
      const dishSaved = await dishRepository.addDish(restaurantId, {
        ...dish,
        photo: req.photoName,
      });

      tasteRepository.addTastesToDish(
        dishSaved.id,
        dish.tastes.map((t: any) => t.id)
      );

      restrictionRepository.addRestrictionsToDish(
        dishSaved.id,
        dish.restrictions.map((r: any) => r.id)
      );

      res.status(201).json(dishSaved);
    } catch (error) {
      console.log("a", error);
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
