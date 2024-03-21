import connection from "./connection";
import type RestaurantModel from "../models/Restaurant.model";
import type { RowDataPacket } from "mysql2";
import type User from "../models/User.model";

interface IRestaurantRepository {
  save(restaurant: RestaurantModel, user: User): Promise<RestaurantModel>;
  delete(restaurantId: number): Promise<void>;
  findByOwner(user: User): Promise<RestaurantModel[]>;
  findFavoriteRestaurants(user: User): Promise<RestaurantModel[]>;
  addFavoriteRestaurant(user: User, restaurantId: number): Promise<void>;
  findLikedRestaurants(user: User): Promise<RestaurantModel[]>;
  addLikedRestaurant(user: User, restaurantId: number): Promise<void>;
  addPhotoToCarousel(restaurantId: number, photos: string[]): Promise<void>;
  update(restaurant: RestaurantModel): Promise<RestaurantModel>;
  updatePhotoCarousel(restaurantId: number, photos: string[]): Promise<void>;
  findById(restaurantId: number): Promise<RestaurantModel>;
}

export default class RestaurantRepository implements IRestaurantRepository {
  public async save(
    restaurant: RestaurantModel,
    user: User
  ): Promise<RestaurantModel> {
    const query =
      "INSERT INTO restaurant (name, owner_id, address, phone, photo) VALUES (?, ?, ?, ?, ?)";
    try {
      const result = await connection
        .promise()
        .query(query, [
          restaurant.name,
          user.id,
          restaurant.address,
          restaurant.phone,
          restaurant.photo,
        ]);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      const restaurantSaved = restaurants[0] as RestaurantModel;
      return restaurantSaved;
    } catch (error) {
      console.log(error);
      throw new Error("Error saving restaurant");
    }
  }

  public async delete(restaurantId: number): Promise<void> {
    const query = "DELETE FROM restaurant WHERE id = ?";
    try {
      await connection.promise().query(query, [restaurantId]);
    } catch (error) {
      throw new Error("Error deleting restaurant");
    }
  }

  public async findByOwner(user: User): Promise<RestaurantModel[]> {
    const query = "SELECT * FROM restaurant WHERE owner_id = ?";
    try {
      const result = await connection.promise().query(query, [user.id]);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      return restaurants as RestaurantModel[];
    } catch (error) {
      console.log(error);
      throw new Error("Error finding restaurants by owner");
    }
  }

  public async findFavoriteRestaurants(user: User): Promise<RestaurantModel[]> {
    const query =
      "SELECT * FROM restaurant WHERE id IN (SELECT restaurant_id FROM favorite_restaurant WHERE user_id = ?)";
    try {
      const result = await connection.promise().query(query, [user.id]);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      return restaurants as RestaurantModel[];
    } catch (error) {
      throw new Error("Error finding favorite restaurants by user");
    }
  }

  public async addFavoriteRestaurant(
    user: User,
    restaurantId: number
  ): Promise<void> {
    const query =
      "INSERT INTO favorite_restaurant (user_id, restaurant_id) VALUES (?, ?)";
    try {
      await connection.promise().query(query, [user.id, restaurantId]);
    } catch (error) {
      throw new Error("Error adding favorite restaurant");
    }
  }

  public async findLikedRestaurants(user: User): Promise<RestaurantModel[]> {
    const query =
      "SELECT * FROM restaurant WHERE id IN (SELECT restaurant_id FROM liked_restaurant WHERE user_id = ?)";
    try {
      const result = await connection.promise().query(query, [user.id]);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      return restaurants as RestaurantModel[];
    } catch (error) {
      throw new Error("Error finding liked restaurants by user");
    }
  }

  public async addLikedRestaurant(
    user: User,
    restaurantId: number
  ): Promise<void> {
    const query =
      "INSERT INTO liked_restaurant (user_id, restaurant_id) VALUES (?, ?)";
    try {
      await connection.promise().query(query, [user.id, restaurantId]);
    } catch (error) {
      throw new Error("Error adding liked restaurant");
    }
  }

  public async addPhotoToCarousel(
    restaurantId: number,
    photos: string[]
  ): Promise<void> {
    const query = "INSERT INTO carousel (restaurant_id, photo) VALUES (?, ?)";

    const restaurantResultId = await connection
      .promise()
      .query("SELECT * FROM restaurant WHERE id = ?", [restaurantId]);
    const restaurant: RowDataPacket[] =
      restaurantResultId[0] as RowDataPacket[];
    if (restaurant.length === 0) {
      throw new Error("Restaurant not found");
    }

    try {
      for (const photo of photos) {
        await connection.promise().query(query, [restaurantId, photo]);
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error adding photo to carousel");
    }
  }

  public async update(restaurant: RestaurantModel): Promise<RestaurantModel> {
    const query =
      "UPDATE restaurant SET name = ?, address = ?, link_glovo = ?, link_just_eat = ?, link_uber_eats = ?, phone = ?, photo = ?, description = ?  WHERE id = ?";
    try {
      await connection
        .promise()
        .query(query, [
          restaurant.name,
          restaurant.address,
          restaurant.link_glovo,
          restaurant.link_just_eat,
          restaurant.link_uber_eats,
          restaurant.phone,
          restaurant.photo,
          restaurant.description,
          restaurant.id,
        ]);
      return restaurant;
    } catch (error) {
      throw new Error("Error updating restaurant");
    }
  }

  public async updatePhotoCarousel(
    restaurantId: number,
    photos: string[]
  ): Promise<void> {
    const query = "DELETE FROM carousel WHERE restaurant_id = ?";
    try {
      await connection.promise().query(query, [restaurantId]);
      await this.addPhotoToCarousel(restaurantId, photos);
    } catch (error) {
      throw new Error("Error updating photo carousel");
    }
  }

  public async findById(restaurantId: number): Promise<RestaurantModel> {
    const query = "SELECT * FROM restaurant WHERE id = ?";
    try {
      const result = await connection.promise().query(query, [restaurantId]);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      if (restaurants.length === 0) {
        throw new Error("Restaurant not found");
      }
      return restaurants[0] as RestaurantModel;
    } catch (error) {
      throw new Error("Error finding restaurant by id");
    }
  }
}
