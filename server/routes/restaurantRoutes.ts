import express, { Router } from "express";
import type { Request, Response } from "express";
import { check } from "express-validator";
import { validarCampos } from "../helpers/verifyFields";
import RestaurantRepository from "../database/Restaurant.repository";
import type RestaurantModel from "../models/Restaurant.model";
import type User from "../models/User.model";
import { verifyJWT } from "../middlewares/verifyJWT";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import connection from "../database/connection";
import fs from "fs";

interface PhotoRequest extends Request {
    photoName?: string | Array<string>;
}

const restaurantRepository = new RestaurantRepository();

const restaurantRouter: Router = express.Router();

const dir = path.dirname(new URL(import.meta.url).pathname);

const storageCarousel = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(dir, "../../uploads/restaurant_photos/carousel/"));
    },
    filename: (req: PhotoRequest, file, cb) => {
        const name = req.user?.name + "_" + uuidv4() + Date.now + "." + path.extname(file.originalname);
        if (!req.photoName) {
            req.photoName = [];
        }
        (req.photoName as Array<string>).push(name);
        cb(null, name);
    }
});

const storageProfilePicture = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(dir, "../../uploads/restaurant_photos/profile_pictures/"));
    },
    filename: (req: PhotoRequest, file, cb) => {
        const name = req.user?.username + "_" + uuidv4() + "." + path.extname(file.originalname);
        req.photoName = name;
        cb(null, name);
    }
});

const uploadCarousel = multer({ storage: storageCarousel });
const uploadProfilePicture = multer({ storage: storageProfilePicture });

// POST /api/restaurant/photo/carousel
restaurantRouter.post(
    '/photo/carousel',
    [
        verifyJWT,
        uploadCarousel.array("photo", 12)
    ],
    async (req: PhotoRequest, res: Response) => {
        try {
            const photos = req.photoName as Array<string>;
            if (!photos) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const restaurant = req.body as RestaurantModel;
            if (!restaurant.id) {
                return res.status(400).json({ message: "Restaurant id is required" });
            }

            const restaurantCarousel = await restaurantRepository.addPhotoToCarousel(restaurant.id, photos);
            return res.json({ message: "Photos uploaded successfully", restaurantCarousel });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error uploading photos" });
        }
    }
)

// UPDATE api/restaurant/photo/carousel/:restaurantId
restaurantRouter.put(
    "/photo/carousel/:restaurantId",
    [
        verifyJWT,
        uploadCarousel.array("photo", 12)
    ],
    async (req: PhotoRequest, res: Response) => {
        const restaurantId: number = parseInt(req.params.restaurantId);
        const photos = req.photoName as Array<string>;
        if (!restaurantId) {
            res.status(500).json({ message: "Restaurant id is required" });
            return;
        }
        if (!photos) {
            res.status(500).json({ message: "No photos to update" });
            return;
        }
        try {
            await restaurantRepository.updatePhotoCarousel(restaurantId, photos);
            res.status(200).json({ message: "Restaurant carousel updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error updating the restaurant carousel" });
        }
    });


// GET /api/restaurant/photo/profile-picture
restaurantRouter.get(
    "/photo/profile-picture",
    [
        verifyJWT
    ],
    async (req: Request, res: Response) => {
        let restaurant = req.body;
        if (!restaurant) {
            return res.sendFile(
                path.join(dir, "../../uploads/restaurant_photos/profile_pictures/default.jpg")
            );
        }
        try {
            if (!fs.existsSync(path.join(dir, "../../uploads/restaurant_photos/profile_pictures/"))) {
                return res.sendFile(
                    path.join(dir, "../../uploads/restaurant_photos/profile_pictures/default.jpg")
                );
            }
            res.sendFile(path.join(dir, "../../uploads/restaurant_photos/profile_pictures/" + restaurant.photo));
            return res.status(201).json({ message: "Profile picture uploaded successfully", photo: restaurant.photo });
        } catch (error) {
            res.status(500).json({ message: "Error uploading profile picture" });
        }
    });

// POST /api/restaurant/photo/profile-picture
restaurantRouter.post(
    "/photo/profile-picture",
    [
        verifyJWT,
        uploadProfilePicture.single("photo")
    ],
    async (req: PhotoRequest, res: Response) => {
        try {
            const photo = req.photoName;
            let restaurant = req.body as RestaurantModel;
            if (!photo) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            if (!restaurant.id) {
                return res.status(400).json({ message: "Restaurant id is required" });
            }

            const query = "UPDATE restaurant SET photo = ? WHERE id = ?";
            connection.query(query, [photo, restaurant?.id], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error saving photo in database" });
                }
                return res.status(201).json({ message: "Profile picture uploaded successfully" });
            });
        } catch (error) {
            res.status(500).json({ message: "Error uploading profile picture" });
        }
    });

// POST api/restaurant
restaurantRouter.post(
    "/",
    [
        verifyJWT,
        // check("name", "Name is required").not().isEmpty(),
        validarCampos
    ], async (req: Request, res: Response) => {
        const restaurant: RestaurantModel = req.body;
        const user: User | undefined = req.user;
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        try {
            const restaurantSaved = await restaurantRepository.save(restaurant, user);
            console.log(restaurantSaved);
            res.status(201).json({
                message: "Restaurant created successfully",
                restaurantSaved
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error creating the restaurant" });
        }
    });


// GET api/restaurant
restaurantRouter.get(
    "/",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        const user: User = req.user as User;
        try {
            const restaurants = await restaurantRepository.findByOwner(user);
            res.status(200).json(restaurants);
        } catch (error) {
            res.status(500).json({ message: "Error finding restaurants by owner" });
        }
    });

// UPDATE api/restaurant/:restaurantId
restaurantRouter.put(
    "/:restaurantId",
    [
        verifyJWT,
        validarCampos
    ],
    async (req: Request, res: Response) => {
        const restaurant: RestaurantModel = req.body;
        if (!restaurant.id) {
            res.status(500).json({ message: "Restaurant id is required" });
            return;
        }
        try {
            const restaurantUpdated = await restaurantRepository.update(restaurant);
            res.status(200).json({ message: "Restaurant updated successfully", restaurantUpdated });
        } catch (error) {
            res.status(500).json({ message: "Error updating the restaurant" });
        }
    });

// DELETE api/restaurant/:restaurantId
restaurantRouter.delete(
    "/:restaurantId",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        const restaurantId: number = parseInt(req.params.restaurantId);
        if (!restaurantId) {
            res.status(500).json({ message: "Restaurant id is required" });
            return;
        }
        try {
            await restaurantRepository.delete(restaurantId);
            res.status(200).json({ message: "Restaurant deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting the restaurant" });
        }
    });

// GET api/restaurant/favorite-restaurants
restaurantRouter.get(
    "/favorite-restaurants",
    [
        verifyJWT,
    ]
    , async (req: Request, res: Response) => {
        const user: User | undefined = req.user;
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        try {
            const favoriteRestaurants = await restaurantRepository.findFavoriteRestaurants(user);
            if (favoriteRestaurants.length === 0) {
                res.status(404).json({ message: "No favorite restaurants found" });
            }
            res.status(200).json(favoriteRestaurants);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error finding favorite restaurants by user" });
        }
    })

// POST api/restaurant/favorite-restaurant/:restaurantId
restaurantRouter.post(
    "/favorite-restaurant/:restaurantId",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        const user: User | undefined = req.user;
        const restaurantId: number = parseInt(req.params.restaurantId);
        if (!restaurantId) {
            res.status(500).json({ message: "Restaurant id is required" });
            return;
        }
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        try {
            await restaurantRepository.addFavoriteRestaurant(user, restaurantId);
            res.status(200).json({ message: "Favorite restaurant added successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error adding favorite restaurant" });
        }
    });


// GET api/restaurant/liked-restaurants
restaurantRouter.get(
    "/liked-restaurants",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        let user: User | undefined = req.user;
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        try {
            let likedRestaurants = await restaurantRepository.findLikedRestaurants(user);
            if (likedRestaurants.length === 0) {
                res.status(404).json({ message: "No liked restaurants found" });
            }
            res.status(200).json(likedRestaurants);
        } catch (error) {
            res.status(500).json({ message: "Error finding liked restaurants by user" });
        }
    });

// POST api/restaurant/liked-restaurant/:restaurantId
restaurantRouter.post(
    "/liked-restaurant/:restaurantId",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        const user: User | undefined = req.user;
        const restaurantId: number = parseInt(req.params.restaurantId);
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        if (!restaurantId) {
            res.status(500).json({ message: "Restaurant id is required" });
            return;
        }
        try {
            await restaurantRepository.addLikedRestaurant(user, restaurantId);
            res.status(200).json({ message: "Liked restaurant added successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error adding liked restaurant" });
        }
    });

// GET api/restaurant/:owner_id
restaurantRouter.get("/:owner_id",
    [
        verifyJWT,
    ],
    async (req: Request, res: Response) => {
        const user: User | undefined = req.user;
        if (!user) {
            res.status(500).json({ message: "User not found" });
            return;
        }
        const owner_id = user.user_id;
        try {
            const restaurants = await restaurantRepository.findByOwner(owner_id);
            res.status(200).json(restaurants);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error finding restaurants by owner" });
        }
    });


export default restaurantRouter;