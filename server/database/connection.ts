import mysql from "mysql2";
import dbConfig from "./db.config";

let connection;

const handleDisconnect = () => {
  connection = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASS,
    database: dbConfig.NAME,
  });

  connection.on("error", (err) => {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

export default connection;
