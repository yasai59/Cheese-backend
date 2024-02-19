import connection from "./connection";
import type RestrictionModel from "../models/Restriction.model";
import type { RowDataPacket } from "mysql2";

interface IRestrictionRepository {
    findUserRestrictions(userId: number): Promise<RestrictionModel[]>;
    addRestrictionsToUser(userId: number, restrictions: number[]): Promise<RestrictionModel[]>;
}

export default class RestrictionRepository implements IRestrictionRepository {
    public async findUserRestrictions(userId: number): Promise<RestrictionModel[]> {
        const query = "SELECT r.name FROM restriction r JOIN user_restriction ur ON r.id = ur.restriction_id WHERE ur.user_id = ?";
        try {
            const result = await connection.promise().query(query, [userId]);
            const restrictions: RowDataPacket[] = result[0] as RowDataPacket[];
            return restrictions as RestrictionModel[];
        } catch (error) {
            throw new Error("Error finding user restrictions");
        }
    }

    public async addRestrictionsToUser(userId: number, restrictions: number[]): Promise<RestrictionModel[]> {
        const query = "INSERT INTO user_restriction (user_id, restriction_id) VALUES (?, ?)";
        try {
            for (let i = 0; i < restrictions.length; i++) {
                await connection.promise().query(query, [userId, restrictions[i]]);
            }
            return await this.findUserRestrictions(userId);
        } catch (error) {
            throw new Error("Error adding restrictions to user");
        }
    }
}