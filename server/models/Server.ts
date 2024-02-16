import express from "express";
import cors from "cors";
import { Server as Socket } from "socket.io";
import http from "http";
import userRouter from "../routes/userRoutes";
import tasteRouter from "../routes/tasteRoutes";

export class Server {
  private app: express.Application;
  private apiPath: string = "/api";
  private io: Socket;
  private httpServer: http.Server;

  constructor() {
    // initialize express app
    this.app = express();
    this.httpServer = http.createServer(this.app);

    // call the midlewares and routes
    this.middlewares();
    this.routes();

    // initialize socket.io
    this.io = new Socket(this.httpServer);
    this.sockets();
  }

  // midlewares
  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  private routes(): void {
    this.app.use(this.apiPath + "/user", userRouter);
    this.app.use(this.apiPath + "/taste", tasteRouter);
  }

  private sockets(): void {
    this.io.on("connection", (socket) => {
      console.log("Client connected");
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  // listen function to start the server
  public listen(port: number = Number(process.env.PORT)): void {
    if (!port || port < 0 || port > 65535 || isNaN(port)) {
      throw new Error("Invalid port number");
    }
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}🚀`);
    });
  }
}
