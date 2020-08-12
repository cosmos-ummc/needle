import { Application } from "express";
import * as express from "express";
import { Server as SocketIOServer } from "socket.io";
import * as socketIO from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import * as path from "path";
import * as Pusher from "pusher";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as raccoon from "raccoon";

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;
  private pusher: Pusher;

  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.pusher = new Pusher({
      appId: "1044913",
      cluster: "ap1",
      encrypted: true,
      key: "ec07749c8ce28d32448a",
      secret: "25382e1520d7be2efca8",
    });

    this.httpServer = createServer(this.app);
    this.io = socketIO(this.httpServer, {
      // handlePreflightRequest: (req, res) => {
      //   const headers = {
      //     "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
      //     // @ts-ignore
      //     "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      //     "Access-Control-Allow-Credentials": true
      //   };
      //   // @ts-ignore
      //   res.writeHead(200, headers);
      //   // @ts-ignore
      //   res.end();
      // }
    });

    this.configureApp();
    this.configureRoutes();
    this.handleSocketConnection();
  }

  private configureApp(): void {
    // this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  private configureRoutes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile("index.html");
    });

    this.app.post("/message", (req, res) => {
      const payload = req.body;
      console.log(payload);
      this.pusher.trigger("general", "message", payload);
      res.json(payload);
    });

    this.app.post("/like", (req, res) => {
      const payload = req.body;
      console.log(payload);
      raccoon.liked(payload.patientId, payload.term).then(
        () => {
          res.json(payload);
        },
        (error) => {
          res.json({});
        }
      );
    });

    this.app.get("/similarusers", (req, res) => {
      console.log(req.query);
      raccoon.mostSimilarUsers(req.query.id).then(
        (results) => {
          console.log(results);
          res.json(results);
        },
        (error) => {
          console.log(error);
          res.json([]);
        }
      );
    });
  }

  private handleSocketConnection(): void {
    this.io.on("connection", (socket) => {
      const existingSocket = this.activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id],
        });
      }

      socket.on("call-user", (data: any) => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id,
        });
      });

      socket.on("make-answer", (data) => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer,
        });
      });

      socket.on("reject-call", (data) => {
        socket.to(data.from).emit("call-rejected", {
          socket: socket.id,
        });
      });

      socket.on("disconnect", () => {
        this.activeSockets = this.activeSockets.filter(
          (existingSocket) => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id,
        });
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
