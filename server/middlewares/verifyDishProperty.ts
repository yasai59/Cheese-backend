import type { Request, Response, NextFunction } from "express";
import type RestaurantModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import RestaurantRepository from "../database/Restaurant.repository";
import DishRepository from "../database/Dish.repository";

const restaurantRepository = new RestaurantRepository();

export const verifyDishProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let dishId = Number(req.params.dishId);
  const user = req.user as UserModel;

  if (user.role_id === 3) {
    return next();
  }
  if (!dishId) {
    return res.status(400).json({ message: "Unauthorized, no id" });
  }

  try {
    const userRestaurants = await restaurantRepository.findByOwner(user);

    for (let restaurant of userRestaurants) {
      const dishes = restaurant.dishes;
      if (dishes) {
        for (let dish of dishes) {
          if (dish.id === dishId) {
            return next();
          }
        }
      }
    }

    return res
      .status(404)
      .json({ message: "Unauthorized, no restaurant found" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
