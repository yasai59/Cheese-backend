import express from "express";
import cors from "cors";

export class Server {
  private app: express.Application;

  constructor() {
    this.app = express();

    this.middlewares();
  }

  // midlewares
  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  private routes(): void {
    // this.app.use("/api", routes);
  }

  // listen function to start the server
  public listen(port: number = Number(process.env.PORT)): void {
    if (!port || port < 0 || port > 65535 || isNaN(port)) {
      throw new Error("Invalid port number");
    }
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
