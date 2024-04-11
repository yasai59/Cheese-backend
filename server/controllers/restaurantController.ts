import type { Request, Response } from "express";
import DishRepository from "../database/Dish.repository";
import fs from "fs";
import path from "path";
import type RestaurantModel from "../models/Restaurant.model";
import type User from "../models/User.model";
import RestaurantRepository from "../database/Restaurant.repository";

interface PhotoRequest extends Request {
  photoName?: string | Array<string>;
  pfp?: string;
}
const restaurantRepository = new RestaurantRepository();
const dishRepository = new DishRepository();

class RestaurantController {
  async uploadCarouselPhotos(req: PhotoRequest, res: Response) {
    try {
      const photos = req.photoName as Array<string>;
      if (!photos) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const restaurant = req.body as RestaurantModel;
      if (!restaurant.id) {
        return res.status(400).json({ message: "Restaurant id is required" });
      }

      const restaurantCarousel = await restaurantRepository.addPhotoToCarousel(
        restaurant.id,
        photos
      );
      return res.json({
        message: "Photos uploaded successfully",
        restaurantCarousel,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error uploading photos" });
    }
  }

  async updateCarouselPhotos(req: PhotoRequest, res: Response) {
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
      res
        .status(200)
        .json({ message: "Restaurant carousel updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating the restaurant carousel" });
    }
  }

  async uploadProfilePicture(req: PhotoRequest, res: Response) {
    try {
      const photo = req.photoName;
      let restaurant = req.body as RestaurantModel;
      if (!photo) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!restaurant.id) {
        return res.status(400).json({ message: "Restaurant id is required" });
      }

      const oldRes = await restaurantRepository.findById(restaurant.id);
      if (oldRes.photo) {
        try {
          fs.unlinkSync(
            path.join(
              __dirname,
              "../../uploads/restaurant_photos/profile_pictures/" + oldRes.photo
            )
          );
        } catch (e) {
          console.log(e);
        }
      }

      oldRes.photo = photo as string;
      const dbRes = await restaurantRepository.update(oldRes);

      const dishes = await dishRepository.findRestaurantDishes(
        dbRes.id as number
      );

      dbRes.dishes = dishes;

      return res.status(201).json({
        message: "Profile picture uploaded successfully",
        restaurant: dbRes,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }

  async createRestaurant(req: PhotoRequest, res: Response) {
    let restaurant: RestaurantModel = req.body;
    const user: User | undefined = req.user;
    if (!user) {
      res.status(500).json({ message: "User not found" });
      return;
    }
    try {
      restaurant.photo = req.pfp as string;
      const restaurantSaved = await restaurantRepository.save(restaurant, user);
      const photos = req.photoName as Array<string>;

      if (photos) {
        await restaurantRepository.addPhotoToCarousel(
          restaurantSaved.id as number,
          photos
        );
      }
      res.status(201).json({
        message: "Restaurant created successfully",
        restaurantSaved,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating the restaurant" });
    }
  }

  async getRestaurants(req: Request, res: Response) {
    let restaurants: RestaurantModel[] = [];
    try {
      restaurants = await restaurantRepository.findAll();
    } catch (error) {
      res.status(500).json({ message: "Error finding all restaurants" });
    }
    res.json({
      message: "All restaurants found",
      restaurants,
    })
  }

  async getProfilePhoto(req: Request, res: Response) {
    const name = req.params.name;

    if (!name) {
      res.status(400).json({ message: "Photo name is required" });
      return;
    }
    try {
      res.sendFile(
        path.join(
          __dirname,
          "../../uploads/restaurant_photos/profile_pictures/" + name
        )
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error finding the photo" });
    }
  }

  async getCarouselPhoto(req: Request, res: Response) {
    const name = req.params.name;

    if (!name) {
      res.status(400).json({ message: "Photo name is required" });
      return;
    }
    try {
      res.sendFile(
        path.join(__dirname, "../../uploads/restaurant_photos/carousel/" + name)
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error finding the photo" });
    }
  }

  async updateRestaurant(req: Request, res: Response) {
    const restaurant: RestaurantModel = req.body;
    if (!restaurant.id) {
      res.status(400).json({ message: "Restaurant id is required" });
      return;
    }
    try {
      const restaurantUpdated = await restaurantRepository.update(restaurant);
      res.status(200).json({
        message: "Restaurant updated successfully",
        restaurantUpdated,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating the restaurant" });
    }
  }

  async deleteRestaurant(req: Request, res: Response) {
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
  }

  async getFavoriteRestaurants(req: Request, res: Response) {
    const user: User | undefined = req.user;
    if (!user) {
      res.status(500).json({ message: "User not found" });
      return;
    }
    try {
      const favoriteRestaurants =
        await restaurantRepository.findFavoriteRestaurants(user);
      if (favoriteRestaurants.length === 0) {
        res.status(404).json({ message: "No favorite restaurants found" });
      }
      res.status(200).json(favoriteRestaurants);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error finding favorite restaurants by user" });
    }
  }

  async addFavoriteRestaurant(req: Request, res: Response) {
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
      res
        .status(200)
        .json({ message: "Favorite restaurant added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error adding favorite restaurant" });
    }
  }

  async getLikedRestaurants(req: Request, res: Response) {
    let user: User | undefined = req.user;
    if (!user) {
      res.status(500).json({ message: "User not found" });
      return;
    }
    try {
      let likedRestaurants = await restaurantRepository.findLikedRestaurants(
        user
      );
      if (likedRestaurants.length === 0) {
        res.status(404).json({ message: "No liked restaurants found" });
      }
      res.status(200).json(likedRestaurants);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error finding liked restaurants by user" });
    }
  }

  async addLikedRestaurant(req: Request, res: Response) {
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
  }

  async getRestaurantsByOwner(req: Request, res: Response) {
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
  }

  async getRestaurantById(req: Request, res: Response) {
    const restaurantId: number = parseInt(req.params.restaurantId);
    if (!restaurantId) {
      res.status(400).json({ message: "Restaurant id is required" });
      return;
    }
    try {
      const restaurant = await restaurantRepository.findById(restaurantId);
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Error finding the restaurant" });
    }
  }

  async getCarouselPhotosById(req: Request, res: Response) {
    const restaurantId: number = parseInt(req.params.restaurantId);
    if (!restaurantId) {
      res.status(400).json({ message: "Restaurant id is required" });
      return;
    }
    try {
      const photos = await restaurantRepository.getCarouselPhotos(restaurantId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Error finding the photos" });
    }
  }
}

const restaurantController = new RestaurantController();
export default restaurantController;
