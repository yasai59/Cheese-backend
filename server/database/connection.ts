import mysql from "mysql2";
import dbConfig from "./db.config";

const pool = mysql.createPool(dbConfig);

const connection = pool;

export default connection;
