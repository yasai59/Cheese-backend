import connection from "./connection";
import type RestrictionModel from "../models/Restriction.model";
import type { RowDataPacket } from "mysql2";

interface IRestrictionRepository {
  findUserRestrictions(userId: number): Promise<RestrictionModel[]>;
  addRestrictionsToUser(
    userId: number,
    restrictions: number[]
  ): Promise<RestrictionModel[]>;
  findAll(): Promise<RestrictionModel[]>;
  addRestrictionsToDish(
    dishId: number,
    restrictions: number[]
  ): Promise<RestrictionModel[]>;
  findDishRestrictions(dishId: number): Promise<RestrictionModel[]>;
}

export default class RestrictionRepository implements IRestrictionRepository {
  public async findUserRestrictions(
    userId: number
  ): Promise<RestrictionModel[]> {
    const query =
      "SELECT r.name, r.id FROM restriction r JOIN user_restriction ur ON r.id = ur.restriction_id WHERE ur.user_id = ?";
    try {
      const result = await connection.promise().query(query, [userId]);
      const restrictions: RowDataPacket[] = result[0] as RowDataPacket[];
      return restrictions as RestrictionModel[];
    } catch (error) {
      console.log(error);
      throw new Error("Error finding user restrictions");
    }
  }

  public async addRestrictionsToUser(
    userId: number,
    restrictions: number[]
  ): Promise<RestrictionModel[]> {
    const query =
      "INSERT INTO user_restriction (user_id, restriction_id) VALUES (?, ?)";
    try {
      await connection
        .promise()
        .query("DELETE FROM user_restriction WHERE user_id = ?", [userId]);
      for (const restriction of restrictions) {
        await connection.promise().query(query, [userId, restriction]);
      }
      return await this.findUserRestrictions(userId);
    } catch (error) {
      throw new Error("Error adding restrictions to user");
    }
  }

  public async findAll(): Promise<RestrictionModel[]> {
    const query = "SELECT * FROM restriction";
    try {
      const result = await connection.promise().query(query);
      const restrictions: RowDataPacket[] = result[0] as RowDataPacket[];
      return restrictions as RestrictionModel[];
    } catch (error) {
      throw new Error("Error finding all restrictions");
    }
  }

  public async findDishRestrictions(
    dishId: number
  ): Promise<RestrictionModel[]> {
    const query =
      "SELECT r.name, r.id FROM restriction r JOIN dish_restriction dr ON r.id = dr.restriction_id WHERE dr.dish_id = ?";
    try {
      const result = await connection.promise().query(query, [dishId]);
      const restrictions: RowDataPacket[] = result[0] as RowDataPacket[];
      return restrictions as RestrictionModel[];
    } catch (error) {
      throw new Error("Error finding dish restrictions");
    }
  }

  public async addRestrictionsToDish(
    dishId: number,
    restrictions: number[]
  ): Promise<RestrictionModel[]> {
    const query =
      "INSERT INTO dish_restriction (dish_id, restriction_id) VALUES (?, ?)";
    try {
      await connection
        .promise()
        .query("DELETE FROM dish_restriction WHERE dish_id = ?", [dishId]);
      for (const restriction of restrictions) {
        await connection.promise().query(query, [dishId, restriction]);
      }
      return await this.findDishRestrictions(dishId);
    } catch (error) {
      throw new Error("Error adding restrictions to dish");
    }
  }
}
