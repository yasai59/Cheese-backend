import connection from "./connection";
import type RestaurantModel from "../models/Restaurant.model";
import type DishModel from "../models/Dish.model";
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
  getCarouselPhotos(restaurantId: number): Promise<string[]>;
  findAll(): Promise<RestaurantModel[]>;
}

export default class RestaurantRepository implements IRestaurantRepository {
  public async save(
    restaurant: RestaurantModel,
    user: User
  ): Promise<RestaurantModel> {
    const query =
      "INSERT INTO restaurant (name, owner_id, address, phone, photo) VALUES (?, ?, ?, ?, ?)";
    try {
      const result: any = await connection
        .promise()
        .query(query, [
          restaurant.name,
          user.id,
          restaurant.address,
          restaurant.phone,
          restaurant.photo,
        ]);
      const id = result[0].insertId;
      const querySaves = "SELECT * FROM restaurant WHERE id = ?";
      const resultSaved = await connection.promise().query(querySaves, [id]);
      const res: RowDataPacket[] = resultSaved[0] as RowDataPacket[];
      const restaurantSaved = res[0] as RestaurantModel;

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
      const promises = photos.map((photo) =>
        connection.promise().query(query, [restaurantId, photo])
      );
      await Promise.all(promises);
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

  public async getCarouselPhotos(restaurantId: number): Promise<string[]> {
    const query = "SELECT * FROM carousel WHERE restaurant_id = ?";
    try {
      const result = await connection.promise().query(query, [restaurantId]);
      const photos: RowDataPacket[] = result[0] as RowDataPacket[];
      return photos.map((photo) => photo.photo);
    } catch (error) {
      throw new Error("Error getting carousel photos");
    }
  }

  public async findAll(): Promise<RestaurantModel[]> {
    const query = `
        SELECT 
            r.*,
            (
                SELECT GROUP_CONCAT(photo) 
                FROM carousel 
                WHERE restaurant_id = r.id
            ) AS carousel_photos,
            (
                SELECT IF(s.restaurant_id IS NOT NULL AND s.end_date >= NOW(), true, false) 
                FROM suscription s 
                WHERE s.restaurant_id = r.id
            ) AS active_subscription,
            (
                SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', d.id,
                                'name', d.name,
                                'tastes', (
                                    SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'id', t.id,
                                                    'name', t.name
                                                )
                                            ) 
                                    FROM taste t 
                                    INNER JOIN dish_taste dt ON t.id = dt.taste_id 
                                    WHERE dt.dish_id = d.id
                                ),
                                'restrictions', (
                                    SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'id', res.id,
                                                    'name', res.name
                                                )
                                            ) 
                                    FROM restriction res 
                                    INNER JOIN dish_restriction dr ON res.id = dr.restriction_id 
                                    WHERE dr.dish_id = d.id
                                )
                            )
                        ) 
                FROM dish d 
                WHERE d.restaurant_id = r.id
            ) AS dishes
        FROM 
            restaurant r;
    `;

    try {
        const result = await connection.promise().query(query);
        const restaurants: any[] = result[0] as any[];
        
        return restaurants.map((restaurant) => {
            restaurant.carousel_photos = restaurant.carousel_photos ? restaurant.carousel_photos.split(',') : [];
            restaurant.active_subscription = !!restaurant.active_subscription;
            restaurant.dishes = restaurant.dishes ? JSON.parse(restaurant.dishes) : [];
            return restaurant as RestaurantModel;
        });
    } catch (error) {
        console.log(error);
        throw new Error("Error finding restaurants");
    }
}


}
