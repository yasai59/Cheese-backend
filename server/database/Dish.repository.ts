import connection from "./connection";
import type DishModel from "../models/Dish.model";
import type { RowDataPacket } from "mysql2";

interface IDishRepository {
    addDish(dish: DishModel): Promise<DishModel>;
    updateDish(dish: DishModel): Promise<DishModel>;
    deleteDish(dishId: number): Promise<void>;
    findRestaurantDishes(restaurantId: number): Promise<DishModel[]>;
}

export default class DishRepository implements IDishRepository {
    public async addDish(dish: DishModel): Promise<DishModel> {
        const query = "INSERT INTO dish (restaurant_id, name, price, photo, description) VALUES (?, ?, ?, ?, ?)";
        try {
            const result = await connection.promise().query(query, [dish.restaurant_id, dish.name, dish.price, dish.photo, dish.description]);
            const dishes: RowDataPacket[] = result[0] as RowDataPacket[];
            const dishSaved = dishes[0] as DishModel;
            return dishSaved;
        } catch (error) {
            console.log(error);
            throw new Error("Error saving dish");
        }
    }

    public async updateDish(dish: DishModel): Promise<DishModel> {
        const query = "UPDATE dish SET name = ?, price = ?, photo = ?, description = ? WHERE id = ?";
        try {
            await connection.promise().query(query, [dish.name, dish.price, dish.photo, dish.description, dish.id]);
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

    public async findRestaurantDishes(restaurantId: number): Promise<DishModel[]> {
        const query = "SELECT * FROM dish WHERE restaurant_id = ?";
        try {
            const result = await connection.promise().query(query, [restaurantId]);
            const dishes: RowDataPacket[] = result[0] as RowDataPacket[];
            if (dishes.length === 0) {
                throw new Error("No dishes found");
            }
            return dishes as DishModel[];
        } catch (error) {
            console.log(error);
            throw new Error("Error finding restaurant dishes");
        }
    }
}