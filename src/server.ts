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
import * as https from "https";
import * as fs from "fs";

export class Server {
  private httpServer: HTTPServer;
  private httpsServer: https.Server;
  private app: Application;
  private io: SocketIOServer;
  private pusher: Pusher;

  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5000;
  private readonly DEFAULT_HTTPS_PORT = 443;

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

    if (process.env.ENABLE_HTTP !== "true") {
      // Certificate
      const privateKey = fs.readFileSync(
        "/etc/letsencrypt/live/chat.quaranteams.tk/privkey.pem",
        "utf8"
      );
      const certificate = fs.readFileSync(
        "/etc/letsencrypt/live/chat.quaranteams.tk/cert.pem",
        "utf8"
      );
      const ca = fs.readFileSync(
        "/etc/letsencrypt/live/chat.quaranteams.tk/chain.pem",
        "utf8"
      );

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
      };

      this.httpsServer = https.createServer(credentials, this.app);
    } else {
      this.httpServer = createServer(this.app);
      this.io = socketIO(this.httpServer);
    }

    this.configureApp();
    this.configureRoutes();
    this.handleSocketConnection();
  }

  private configureApp(): void {
    this.app.use(cors());
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
      this.pusher.trigger(payload.roomId, "message", payload);
      res.json(payload);
    });

    this.app.post("/like", (req, res) => {
      const payload = req.body;
      console.log(payload);
      raccoon.liked(payload.userId, payload.term).then(
        () => {
          res.json(payload);
        },
        (error) => {
          res.json({});
        }
      );
    });

    this.app.get("/similarusers", (req, res) => {
      raccoon.mostSimilarUsers(req.query.id).then(
        (results) => {
          res.json(results);
        },
        (error) => {
          res.json([]);
        }
      );
    });
  }

  private handleSocketConnection(): void {
    this.io.on("connection", (socket) => {
      console.log(socket.handshake.query.email);
      console.log(socket.handshake.query.password);

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

  public listenHttps(callback: (port: number) => void): void {
    this.httpsServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_HTTPS_PORT);
    });
  }
}
