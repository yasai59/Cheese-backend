import type { RowDataPacket } from "mysql2";

export default interface ReportModel extends RowDataPacket {
    id: number;
    user_id: number;
    restaurant_id: number;
    report_date: Date;
    description?: string;
}

