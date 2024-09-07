import path from "node:path";
import process from "node:process";
import { serveStatic } from "noren/middlewares";
import Server from "noren/node";
import { createRsbuild, loadConfig } from "@rsbuild/core";
import type { Req, Res } from "noren/node";

const serverRender = (serverAPI: any) => async (req: Req, res: Res) => {
  const indexModule = await serverAPI.environments.ssr.loadBundle("entry");
  const markup = await indexModule.render({ req });
  const template = await serverAPI.environments.client.getTransformedHtml("index");

  const html = template.replace('<div id="app"></div>', `<div id="app">${markup}</div>`);

  res.html(html);
};

const { content } = await loadConfig();

// Init Rsbuild
const rsbuild = await createRsbuild({
  rsbuildConfig: content,
});

const app = new Server();

// Create Rsbuild DevServer instance
const rsbuildServer = await rsbuild.createDevServer();

const serverRenderMiddleware = serverRender(rsbuildServer);

app.use(
  serveStatic(path.join(process.cwd(), ".output", "client"), {
    dotfiles: true,
  }),
  serveStatic(path.join(process.cwd(), "client", "public")),
);

app.get("*", async (req, res) => {
  try {
    await serverRenderMiddleware(req, res);
  } catch (err) {
    console.error("SSR render error, downgrade to CSR...\n", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(rsbuildServer.port, async () => {
  // Notify Rsbuild that the custom server has started
  await rsbuildServer.afterListen();
  console.log(`Dev server started at http://localhost:${rsbuildServer.port}`);
});

rsbuildServer.connectWebSocket({ server: app.server });

console.log(
  "server",
  process.env.NODE_ENV,
  process.env.PORT,
  process.env.HELLO,
  process.env.PUBLIC_HELLO,
);

process.on("exit", async () => {
  await rsbuildServer.close();
  app.server.close();
});
