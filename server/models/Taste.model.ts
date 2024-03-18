import type { RowDataPacket } from "mysql2";

export default interface Taste extends RowDataPacket {
  id?: number;
  name: string;
}
