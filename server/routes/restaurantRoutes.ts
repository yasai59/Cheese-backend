import express, { Router } from "express";
import type { Request, Response } from "express";
import { check } from "express-validator";
import { validarCampos } from "../helpers/verifyFields";

import RestaurantRepository from "../database/Restaurant.repository";
import type RestaurantModel from "../models/Restaurant.model";

const restaurantRepository = new RestaurantRepository();

const restaurantRouter: Router = express.Router();

// POST api/restaurant
restaurantRouter.post(
"/", 
[
    check("name", "Name is required").not().isEmpty(),
    validarCampos
]
,async (req: Request, res: Response) => {
    const restaurant: RestaurantModel = req.body;
    try {
        const restaurantSaved = await restaurantRepository.save(restaurant);
        res.status(201).json({
            message: "Restaurant created successfully",
            restaurantSaved
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating the restaurant" });
    }
});


// GET api/restaurant/:ownerId
restaurantRouter.get("/:ownerId", async (req: Request, res: Response) => {
    const ownerId: number = parseInt(req.params.ownerId);
    try {
        const restaurants = await restaurantRepository.findByOwner(ownerId);
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: "Error finding restaurants by owner" });
    }
});


// GET api/restaurant/:userId/favorite-restaurants
restaurantRouter.get("/:userId/favorite-restaurants", async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.userId);
    try {
        const favoriteRestaurants = await restaurantRepository.findFavoriteRestaurants(userId);
        res.status(200).json(favoriteRestaurants);
    } catch (error) {
        res.status(500).json({ message: "Error finding favorite restaurants by user" });
    }
})

// POST api/restaurant/:userId/favorite-restaurant/:restaurantId
restaurantRouter.post("/:userId/favorite-restaurant/:restaurantId", async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.userId);
    const restaurantId: number = parseInt(req.params.restaurantId);
    try {
        await restaurantRepository.addFavoriteRestaurant(userId, restaurantId);
        res.status(200).json({ message: "Favorite restaurant added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding favorite restaurant" });
    }
});


// GET api/restaurant/:userId/liked-restaurants
restaurantRouter.get("/:userId/liked-restaurants", async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.userId);
    try {
        const likedRestaurants = await restaurantRepository.findLikedRestaurants(userId);
        if (likedRestaurants.length === 0) {
            res.status(404).json({ message: "No liked restaurants found" });
        }
        res.status(200).json(likedRestaurants);
    } catch (error) {
        res.status(500).json({ message: "Error finding liked restaurants by user" });
    }
});

// POST api/restaurant/:userId/liked-restaurant/:restaurantId
restaurantRouter.post("/:userId/liked-restaurant/:restaurantId", async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.userId);
    const restaurantId: number = parseInt(req.params.restaurantId);
    try {
        await restaurantRepository.addLikedRestaurant(userId, restaurantId);
        res.status(200).json({ message: "Liked restaurant added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding liked restaurant" });
    }
});

export default restaurantRouter;