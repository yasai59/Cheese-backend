import connection from "./connection";
import type ReasonModel  from "../models/Reason.model";
import type { RowDataPacket } from "mysql2";

interface IReasonRepository {
    createReason(reason: ReasonModel): Promise<ReasonModel>;
    getAllReasons(): Promise<ReasonModel[]>
}

export default class ReasonRepository implements IReasonRepository {
    public async createReason(reason: ReasonModel): Promise<ReasonModel> {
        const query =
            "INSERT INTO reason (name) VALUES (?)";
        try {
            const result: any = await connection
                .promise()
                .query(query, [
                    reason.name,
                ]);
            const id = result[0].insertId;
            const querySaves = "SELECT * FROM reason WHERE id = ?";
            const resultSaved = await connection.promise().query(querySaves, [id]);
            const res: RowDataPacket[] = resultSaved[0] as RowDataPacket[];
            const reasonSaved = res[0] as ReasonModel;
            return reasonSaved;
        } catch (error) {
            console.log(error);
            throw new Error("Error saving reason");
        }
    }

    public async getAllReasons(): Promise<ReasonModel[]> {
        const query = "SELECT * FROM reason";
        try {
            const result = await connection.promise().query(query);
            const res: RowDataPacket[] = result[0] as RowDataPacket[];
            return res as ReasonModel[];
        } catch (error) {
            throw new Error("Error fetching reasons");
        }
    }
}