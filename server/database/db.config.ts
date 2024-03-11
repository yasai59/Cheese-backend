export default {
  HOST: process.env.DB_HOST ?? "localhost",
  USER: process.env.DB_USER ?? "root",
  PASS: process.env.DB_PASS ?? "",
  NAME: process.env.DB_NAME ?? "cheese",
};
