import connection from "./connection";
import type RestaurantModel from "../models/Restaurant.model";
import type { RowDataPacket } from "mysql2";

interface IRestaurantRepository {
    save(restaurant: RestaurantModel): Promise<RestaurantModel>;
    findByOwner(ownerId: number): Promise<RestaurantModel[]>;
    findFavoriteRestaurants(userId: number): Promise<RestaurantModel[]>;
    addFavoriteRestaurant(userId: number, restaurantId: number): Promise<void>;
    findLikedRestaurants(userId: number): Promise<RestaurantModel[]>;
    addLikedRestaurant(userId: number, restaurantId: number): Promise<void>;
}

export default class RestaurantRepository implements IRestaurantRepository {
    public async save(restaurant: RestaurantModel): Promise<RestaurantModel> {
        const query = "INSERT INTO restaurant (name, owner_id, address, phone) VALUES (?, ?, ?, ?)";
        try {
            const result = await connection.promise().query(query, [restaurant.name, restaurant.owner_id, restaurant.address, restaurant.phone]);
            const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
            const restaurantSaved = restaurants[0] as RestaurantModel;
            return restaurantSaved;
        } catch (error) {
            throw new Error("Error saving restaurant");
        } 
    }

    public async findByOwner(ownerId: number): Promise<RestaurantModel[]> {
        const query = "SELECT * FROM restaurant WHERE owner_id = ?";
        try {
            const result = await connection.promise().query(query, [ownerId]);
            const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
            return restaurants as RestaurantModel[];
        } catch (error) {
            throw new Error("Error finding restaurants by owner");
        }    
    }

    public async findFavoriteRestaurants(userId: number): Promise<RestaurantModel[]> {
        const query = "SELECT * FROM restaurant WHERE id IN (SELECT restaurant_id FROM favorite_restaurant WHERE user_id = ?)";
        try {
            const result = await connection.promise().query(query, [userId]);
            const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
            return restaurants as RestaurantModel[];
        } catch (error) {
            throw new Error("Error finding favorite restaurants by user");
        }
    }

    public async addFavoriteRestaurant(userId: number, restaurantId: number): Promise<void> {
        const query = "INSERT INTO favorite_restaurant (user_id, restaurant_id) VALUES (?, ?)";
        try {
            await connection.promise().query(query, [userId, restaurantId]);
        } catch (error) {
            throw new Error("Error adding favorite restaurant");
        }
    }

    public async findLikedRestaurants(userId: number): Promise<RestaurantModel[]> {
        const query = "SELECT * FROM restaurant WHERE id IN (SELECT restaurant_id FROM liked_restaurant WHERE user_id = ?)";
        try {
            const result = await connection.promise().query(query, [userId]);
            const restaurants: RowDataPacket[] = result[0] as RowDataPacket[];
            return restaurants as RestaurantModel[];
        } catch (error) {
            throw new Error("Error finding liked restaurants by user");
        }
    }

    public async addLikedRestaurant(userId: number, restaurantId: number): Promise<void> {
        const query = "INSERT INTO liked_restaurant (user_id, restaurant_id) VALUES (?, ?)";
        try {
            await connection.promise().query(query, [userId, restaurantId]);
        } catch (error) {
            throw new Error("Error adding liked restaurant");
        }
    }
}