import connection from "./connection";
import type ReportModel  from "../models/Report.model";
import type { RowDataPacket } from "mysql2";

interface IReportRepository {
    createReport(report: ReportModel): Promise<ReportModel>;
    findRestaurantReports(restaurantId: number): Promise<ReportModel[]>;
    findAllReports(): Promise<ReportModel[]>;
}

export default class ReportRepository implements IReportRepository {
    public async createReport(report: ReportModel): Promise<ReportModel> {
        const query =
            "INSERT INTO report (user_id, restaurant_id, description) VALUES (?, ?, ?)";
        try {
            const result: any = await connection
                .promise()
                .query(query, [
                    report.user_id,
                    report.restaurant_id,
                    report.description,
                ]);
            const id = result[0].insertId;
            const querySaves = "SELECT * FROM report WHERE id = ?";
            const resultSaved = await connection.promise().query(querySaves, [id]);
            const res: RowDataPacket[] = resultSaved[0] as RowDataPacket[];
            const reportSaved = res[0] as ReportModel;
    
            return reportSaved;
        } catch (error) {
            console.log(error);
            throw new Error("Error saving report");
        }
    }

    public async findRestaurantReports(restaurantId: number): Promise<ReportModel[]> {
        const query = "SELECT * FROM report WHERE restaurant_id = ?";
        try {
            const result = await connection.promise().query(query, [restaurantId]);
            const res: RowDataPacket[] = result[0] as RowDataPacket[];
            const reports = res as ReportModel[];
            return reports;
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching reports");
        }
    }

    public async findAllReports(): Promise<ReportModel[]> {
        const query = "SELECT * FROM report";
        try {
            const result = await connection.promise().query(query);
            const res: RowDataPacket[] = result[0] as RowDataPacket[];
            const reports = res as ReportModel[];
            return reports;
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching reports");
        }
    }
}