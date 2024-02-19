import type { RowDataPacket } from "mysql2";

export default interface User extends RowDataPacket {
  id?: number;
  username: string;
  email: string;
  password?: string;
  active?: boolean;
  role_id?: number;
  creation_date?: Date;
  lot_number?: number;
  photo?: string;
  google?: 1 | 0;
  verified?: 1 | 0;
  verification_code?: number;
  action?: string;
}
