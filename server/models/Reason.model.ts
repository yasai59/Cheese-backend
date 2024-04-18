import type { RowDataPacket } from "mysql2";

export default interface ReasonModel extends RowDataPacket {
    id: number;
    name: string;
}