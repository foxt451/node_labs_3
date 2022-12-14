import bodyParser from "body-parser";
import morgan from "morgan";
import { formdata } from "@/middleware/form-data";
import { MyServer } from "@/my-server";
import { postsApp } from "@/routes/posts";
import { testApp } from "@/routes/test";

const server = new MyServer();

server.useWare(morgan("common"));
server.useWare(bodyParser.json());
server.useWare(formdata);
server.useWare("/posts", postsApp);
server.useWare("/test", testApp);

const PORT = process.env.PORT ?? 8080;
server.listen(Number(PORT), undefined, undefined, () => {
  console.log(`Server listening on port ${PORT}`);
});
