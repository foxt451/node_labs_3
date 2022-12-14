import { MyServer } from "@/my-server";
import { Request } from "@/types/server";
import { ServerResponse } from "http";

export const testApp = new MyServer();
const LONG_CONN_MS = 60_000;
testApp.addHandler("GET", "/long-conn", (_: unknown, res: ServerResponse) => {
  setTimeout(() => {
    res.end("done");
  }, LONG_CONN_MS);
});
