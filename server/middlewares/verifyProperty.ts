import type { Request, Response, NextFunction } from "express";
import type RestaurantModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import RestaurantRepository from "../database/Restaurant.repository";

const restaurantRepository = new RestaurantRepository();

export const verifyProperty = async (req: Request, res: Response, next: NextFunction) => {
    const restaurant_id = Number(req.params.restaurant_id);
    const user = req.user as UserModel;

    if (!restaurant_id) {
        return res.status(404).json({ message: "Unauthorized" });
    }

    try {
        const userRestaurants = await restaurantRepository.findByOwner(user);
        const restaurant = userRestaurants.find((r: RestaurantModel) => r.id === restaurant_id);
        if (!restaurant) {
            return res.status(404).json({ message: "Unauthorized" });
        }
        req.body.restaurant = restaurant;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
