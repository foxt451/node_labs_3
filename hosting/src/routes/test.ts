import { MyServer } from "../my-server";

export const testApp = new MyServer();
const LONG_CONN_MS = 60_000;
testApp.addHandler("GET", "/long-conn", (req, res) => {
  setTimeout(() => {
    res.end("done");
  }, LONG_CONN_MS);
});
