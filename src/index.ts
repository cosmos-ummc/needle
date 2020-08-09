import { Server } from "./server";

require("dotenv").config();

const server = new Server();

if (process.env.ENABLE_HTTP !== "true") {
  server.listenHttps((port) => {
    console.log(`Server is listening on https://localhost:${port}`);
  });
} else {
  server.listen((port) => {
    console.log(`Server is listening on http://localhost:${port}`);
  });
}
