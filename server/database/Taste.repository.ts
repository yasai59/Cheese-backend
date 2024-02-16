import connection from "./connection";
import type TasteModel from "../models/Taste.model";
import type { RowDataPacket } from "mysql2";

interface ITasteRepository {
    findUserTastes(userId: number): Promise<TasteModel[]>;                
    addTastesToUser(userId: number, tastes: number[]): Promise<TasteModel[]>;
}

export default class TasteRepository implements ITasteRepository {
    public async findUserTastes(userId: number): Promise<TasteModel[]> {
        const query = "SELECT t.name FROM taste t JOIN user_taste ut ON t.id = ut.taste_id WHERE ut.user_id = ?";
        try {
            const result = await connection.promise().query(query, [userId]);
            const tastes: RowDataPacket[] = result[0] as RowDataPacket[];
            return tastes as TasteModel[];
        } catch (error) {
            throw new Error("Error finding user tastes");
        }
    }

    public async addTastesToUser(userId: number, tastes: number[]): Promise<TasteModel[]> {
        const query = "INSERT INTO user_taste (user_id, taste_id) VALUES (?, ?)";
        try {
            for (let i = 0; i < tastes.length; i++) {
                await connection.promise().query(query, [userId, tastes[i]]);
            }
            return await this.findUserTastes(userId);
        } catch (error) {
            throw new Error("Error adding tastes to user");
        }
    }
}