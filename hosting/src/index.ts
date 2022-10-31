import http, { RequestListener } from "http";
console.log(as);

const requestListener: RequestListener = (req, res) => {
  res.writeHead(200);
  res.end("Hello, Mom!!!");
};

const server = http.createServer(requestListener);
const PORT = process.env.PORT ?? 8080;

server.listen(PORT);
console.log(`Server listening on port ${PORT}`);
