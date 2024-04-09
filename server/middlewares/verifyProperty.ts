import type { Request, Response, NextFunction } from "express";
import type RestaurantModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import RestaurantRepository from "../database/Restaurant.repository";

const restaurantRepository = new RestaurantRepository();

export const verifyProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let restaurantId = Number(req.params.restaurantId);
  if (isNaN(restaurantId) || !restaurantId) {
    restaurantId = req.body.id;
  }

  const user = req.user as UserModel;
  if (user.role_id === 3) {
    return next();
  }
  if (!restaurantId) {
    return res.status(404).json({ message: "Unauthorized, no id" });
  }

  try {
    const userRestaurants = await restaurantRepository.findByOwner(user);
    const restaurant = userRestaurants.find(
      (r: RestaurantModel) => r.id === restaurantId
    );
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Unauthorized, no restaurant found" });
    }
    req.body.restaurant = restaurant;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
