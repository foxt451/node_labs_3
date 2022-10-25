import http, { RequestListener } from "http";

const requestListener: RequestListener = (req, res) => {
  res.writeHead(200);
  res.end("Hello, World!");
};

const server = http.createServer(requestListener);
const PORT = process.env.PORT ?? 8080;
const a = 3;
server.listen(PORT);
console.log(`Server listening on port ${PORT}`);
