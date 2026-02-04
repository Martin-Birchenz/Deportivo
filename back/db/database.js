import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql2.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const getConnection = async () => {
  return await connection;
};

export { getConnection };
