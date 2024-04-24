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
    const query = "SELECT * FROM restaurant";
    try {
      const result = await connection.promise().query(query);
      const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
      const carousels: any = [];
      const owners: any = [];
      for (let restaurant of restaurants) {
        if (carousels[restaurant.id]) { 
          restaurant.carousel = carousels[restaurant.id];
          continue;
        }
        const queryCarousel = "SELECT * FROM carousel WHERE restaurant_id = ?";
        const resultCarousel = await connection
          .promise()
          .query(queryCarousel, [restaurant.id]);
        const carousel: RowDataPacket[] = resultCarousel[0] as RowDataPacket[];
        restaurant.carousel = carousel.map((photo) => photo.photo);
        carousels[restaurant.id] = restaurant.carousel;
        const querySuscription = "SELECT * FROM suscription WHERE restaurant_id = ?";
        const resultSuscription = await connection
          .promise()
          .query(querySuscription, [restaurant.id]);
        const suscriptions: RowDataPacket[] = resultSuscription[0] as RowDataPacket[];
        if (suscriptions.length > 0) {
          const suscription = suscriptions[0];
          const currentDate = new Date();
          const expirationDate = new Date(suscription.end_date);
          if (currentDate <= expirationDate) {
            restaurant.active_suscription = true;
          } else {
            restaurant.active_suscription = false;
          }
        } else {
          restaurant.active_suscription = false;
        }
        if (owners[restaurant.owner_id]) {
          restaurant.owner = owners[restaurant.owner_id];
          continue;
        }
        const queryUser = "SELECT * FROM user WHERE id = ?";
        const resultUser = await connection
          .promise()
          .query(queryUser, [restaurant.owner_id]);
        const users: RowDataPacket[] = resultUser[0] as RowDataPacket[];
        delete users[0].password;
        restaurant.owner = users[0] as User;
        owners[restaurant.owner_id] = restaurant.owner;

        const dishesQuery = `
                SELECT 
                    dish.*, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', taste.id,
                            'name', taste.name
                        )
                    ) AS tastes,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', restriction.id,
                            'name', restriction.name
                        )
                    ) AS restrictions
                FROM 
                    dish
                LEFT JOIN 
                    dish_taste ON dish.id = dish_taste.dish_id
                LEFT JOIN 
                    taste ON dish_taste.taste_id = taste.id
                LEFT JOIN 
                    dish_restriction ON dish.id = dish_restriction.dish_id
                LEFT JOIN 
                    restriction ON dish_restriction.restriction_id = restriction.id
                WHERE 
                    dish.restaurant_id = ?
                GROUP BY 
                    dish.id;
            `;
        const dishesResult = await connection.promise().query(dishesQuery, [restaurant.id]);
        const dishesData: RowDataPacket[] = dishesResult[0] as RowDataPacket[];
        dishesData.forEach((dish) => {
          dish.tastes = JSON.parse(dish.tastes);
          dish.restrictions = JSON.parse(dish.restrictions);
        })
        dishesData ? restaurant.dishes = dishesData as DishModel[] : restaurant.dishes = [];
        restaurant.dishes;
      }
      return restaurants as RestaurantModel[];
    } catch (error) {
      console.log(error);
      throw new Error("Error finding restaurants");
    }
  }
}
