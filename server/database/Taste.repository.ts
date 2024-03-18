import connection from "./connection";
import type TasteModel from "../models/Taste.model";
import type { RowDataPacket } from "mysql2";

interface ITasteRepository {
  findUserTastes(userId: number): Promise<TasteModel[]>;
  addTastesToUser(userId: number, tastes: number[]): Promise<TasteModel[]>;
  findAll(): Promise<TasteModel[]>;
  findDishTastes(dishId: number): Promise<TasteModel[]>;
  addTastesToDish(dishId: number, tastes: number[]): Promise<TasteModel[]>;
}

export default class TasteRepository implements ITasteRepository {
  public async findUserTastes(userId: number): Promise<TasteModel[]> {
    const query =
      "SELECT t.name, t.id FROM taste t JOIN user_taste ut ON t.id = ut.taste_id WHERE ut.user_id = ?";
    try {
      const result = await connection.promise().query(query, [userId]);
      const tastes: RowDataPacket[] = result[0] as RowDataPacket[];
      return tastes as TasteModel[];
    } catch (error) {
      throw new Error("Error finding user tastes");
    }
  }

  public async addTastesToUser(
    userId: number,
    tastes: number[]
  ): Promise<TasteModel[]> {
    const query = "INSERT INTO user_taste (user_id, taste_id) VALUES (?, ?)";
    try {
      connection
        .promise()
        .query("DELETE FROM user_taste WHERE user_id = ?", [userId]);

      for (const taste of tastes) {
        await connection.promise().query(query, [userId, taste]);
      }
      return await this.findUserTastes(userId);
    } catch (error) {
      console.log(error);
      throw new Error("Error adding tastes to user");
    }
  }

  public async findAll(): Promise<TasteModel[]> {
    const query = "SELECT * FROM taste";
    try {
      const result = await connection.promise().query(query);
      const tastes: RowDataPacket[] = result[0] as RowDataPacket[];
      return tastes as TasteModel[];
    } catch (error) {
      throw new Error("Error finding all tastes");
    }
  }

  public async findDishTastes(dishId: number): Promise<TasteModel[]> {
    const query =
      "SELECT t.name, t.id FROM taste t JOIN dish_taste dt ON t.id = dt.taste_id WHERE dt.dish_id = ?";
    try {
      const result = await connection.promise().query(query, [dishId]);
      const tastes: RowDataPacket[] = result[0] as RowDataPacket[];
      return tastes as TasteModel[];
    } catch (error) {
      throw new Error("Error finding dish tastes");
    }
  }

  public async addTastesToDish(dishId: number, tastes: number[]): Promise<TasteModel[]> {
    const query = "INSERT INTO dish_taste (dish_id, taste_id) VALUES (?, ?)";
    try {
      connection
        .promise()
        .query("DELETE FROM dish_taste WHERE dish_id = ?", [dishId]);

      for (const taste of tastes) {
        await connection.promise().query(query, [dishId, taste]);
      }
      return await this.findDishTastes(dishId);
    } catch (error) {
      console.log(error);
      throw new Error("Error adding tastes to dish");
    }  
  }

}
