import type { RowDataPacket } from "mysql2";

export default interface RestrictionModel extends RowDataPacket {
  id: number;
  name: string;
}
