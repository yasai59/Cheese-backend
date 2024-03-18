import type { RowDataPacket} from "mysql2";

export default interface RestrictionModel extends RowDataPacket {
    id?: number;
    owner_id?: number;
    name: string;
    address?: string;
    creation_date?: Date;
    link_glovo?: string;
    link_just_eat?: string;
    link_uber_eats?: string;    
    phone?: string;
    photo?: string;
    description?: string;
}