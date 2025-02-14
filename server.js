import { createServer } from "node:http";
import next from "next";
import { initializeSocket } from "./lib/socket.js"

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();


app.prepare().then(() => {
  const httpServer = createServer(handler);
  initializeSocket(httpServer);
  

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
