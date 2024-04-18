import connection from "./connection";
import type ReportModel  from "../models/Report.model";
import type { RowDataPacket } from "mysql2";

interface IReportRepository {
    createReport(report: ReportModel): Promise<ReportModel>;
    findRestaurantReports(restaurantId: number): Promise<ReportModel[]>;
    findAllReports(): Promise<ReportModel[]>;
    assignReasonsToReport(reasonIds: number[], reportId: number): Promise<void>;
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
        const query = 
            `SELECT 
            report.id, 
            report.report_date, 
            report.description, 
            IF(COUNT(reason.id) > 0, JSON_ARRAYAGG(reason.name), NULL) as reason_name, 
            JSON_OBJECT('id', user.id, 'username', user.username, 'email', user.email) as user,
            JSON_OBJECT('id', restaurant.id, 'name', restaurant.name, 'address', restaurant.address, 'phone', restaurant.phone) as restaurant
        FROM 
            report
        LEFT JOIN 
            report_reason ON report.id = report_reason.report_id
        LEFT JOIN 
            reason ON report_reason.reason_id = reason.id
        LEFT JOIN 
            user ON report.user_id = user.id
        LEFT JOIN 
            restaurant ON report.restaurant_id = restaurant.id
        GROUP BY report.id;
        `;
        try {
            const result = await connection.promise().query(query);
            const res: RowDataPacket[] = result[0] as RowDataPacket[];
            const reports = res as ReportModel[];

            reports.forEach(report => {
                report.user = JSON.parse(report.user);
                report.restaurant = JSON.parse(report.restaurant);
                report.reason_name = JSON.parse(report.reason_name);
            });
            return reports;
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching reports");
        }
    }

    public async assignReasonsToReport(reasonIds: number[], reportId: number): Promise<void> {
        const query =
            "INSERT INTO report_reason (report_id, reason_id) VALUES (?, ?)";
        try {
            for (const reasonId of reasonIds) {
                await connection
                    .promise()
                    .query(query, [
                        reportId,
                        reasonId,
                    ]);
            }
        } catch (error) {
            console.log(error);
            throw new Error("Error assigning reasons to report");
        }
    }
    
}