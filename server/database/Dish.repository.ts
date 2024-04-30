import connection from "./connection";
import type DishModel from "../models/Dish.model";
import type { RowDataPacket } from "mysql2";

interface IDishRepository {
  addDish(restaurantId: number, dish: DishModel): Promise<DishModel>;
  updateDish(dish: DishModel): Promise<DishModel>;
  deleteDish(dishId: number): Promise<void>;
  findRestaurantDishes(restaurantId: number): Promise<DishModel[]>;
}

export default class DishRepository implements IDishRepository {
  public async addDish(
    restaurantId: number,
    dish: DishModel
  ): Promise<DishModel> {
    const query =
      "INSERT INTO dish (restaurant_id, name, price, photo, description) VALUES (?, ?, ?, ?, ?)";
    try {
      const result = await connection
        .promise()
        .query(query, [
          restaurantId,
          dish.name,
          dish.price,
          dish.photo,
          dish.description,
        ]);

      const dishSaved = {
        ...dish,
        id: (result[0] as RowDataPacket).insertId,
      };

      return dishSaved;
    } catch (error) {
      console.log(error);
      throw new Error("Error saving dish");
    }
  }

  public async updateDish(dish: DishModel): Promise<DishModel> {
    let query =
      "UPDATE dish SET name = ?, price = ?, description = ? WHERE id = ?";

    if (dish.photo) {
      query =
        "UPDATE dish SET name = ?, price = ?, photo = ?, description = ? WHERE id = ?";
    }
    try {
      if (dish.photo) {
        await connection
          .promise()
          .query(query, [
            dish.name,
            dish.price,
            dish.photo,
            dish.description,
            dish.id,
          ]);
      } else {
        await connection
          .promise()
          .query(query, [dish.name, dish.price, dish.description, dish.id]);
      }
      return dish;
    } catch (error) {
      console.log(error);
      throw new Error("Error updating dish");
    }
  }

  public async deleteDish(dishId: number): Promise<void> {
    const query = "DELETE FROM dish WHERE id = ?";
    try {
      await connection.promise().query(query, [dishId]);
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting dish");
    }
  }

  public async findRestaurantDishes(
    restaurantId: number
  ): Promise<DishModel[]> {
    const query = `SELECT 
    dish.id AS dish_id,
    dish.name AS dish_name,
    dish.photo AS dish_photo,
    dish.description AS dish_description,
    dish.price AS dish_price,
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
    try {
      const result = await connection.promise().query(query, [restaurantId]);
      const dishes: RowDataPacket[] = result[0] as RowDataPacket[];

      dishes.forEach((dish) => {
        dish.tastes = JSON.parse(dish.tastes);
        dish.restrictions = JSON.parse(dish.restrictions);
      });

      return dishes as DishModel[];
    } catch (error) {
      console.log(error);
      throw new Error("Error finding restaurant dishes");
    }
  }
}
