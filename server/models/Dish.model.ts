import type { RowDataPacket } from "mysql2";

export default interface DishModel extends RowDataPacket {
    id: number;
    restaurant_id: number;
    name: string;
    price: number;
    photo: string;
    description: string;
}