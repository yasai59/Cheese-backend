import mysql from "mysql2";
import dbConfig from "./db.config";

let connection: mysql.Connection;

const handleDisconnect = () => {
  connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASS,
    database: dbConfig.NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.log("Error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on("error", (err) => {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
      console.log("Connection lost, reconnecting... 👍");
    } else {
      throw err;
    }
  });
};

handleDisconnect();

export default connection;
