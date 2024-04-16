import connection from "./connection";
import type ReportModel  from "../models/Report.model";
import type { RowDataPacket } from "mysql2";

interface IReportRepository {
    createReport(report: ReportModel): Promise<ReportModel>;
    // findUserReports(userId: number): Promise<ReportModel[]>;
    // findRestaurantReports(restaurantId: number): Promise<ReportModel[]>;
}

export default class ReportRepository implements IReportRepository {
    public async createReport(report: ReportModel): Promise<ReportModel> {
        const query = "INSERT INTO report (user_id, restaurant_id, report_date, description) VALUES (?, ?, ?, ?)";
        try {
            const result = await connection.promise().query(query, [report.user_id, report.restaurant_id, report.report_date, report.description]);
            const reports: RowDataPacket[] = result[0] as RowDataPacket[];
            const reportSaved = reports[0] as ReportModel;
            return reportSaved;
        } catch (error) {
            console.log(error);
            throw new Error("Error saving report");
        }
    }
}