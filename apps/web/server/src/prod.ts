import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { serveStatic } from "noren/middlewares";
import Server from "noren/node";

const serverRender = async (req: any) => {
  const remotesPath = path.join(
    process.cwd(),
    ".output",
    "server",
    "index.mjs",
  );
  const importedApp = await import(
    process.platform === "win32"
      ? `file://${remotesPath.replace(/\\/g, "/")}`
      : remotesPath
  );
  return await importedApp.render({ req });
};

const INDEX_PATH = path.join(process.cwd(), ".output", "client", "index.html");
const INDEX_CONTENT = fs.readFileSync(INDEX_PATH, "utf8");

const port = Number(process.env.PORT) || 3000;

const app = new Server();

// app.use(favicon(path.join(process.cwd(), "dist", "favicon.ico")));
app.use(serveStatic(path.join(process.cwd(), ".output", "client")));

app.get("*", async (req, res) => {
  try {
    const markup = await serverRender(req);
    const html = INDEX_CONTENT.replace(
      '<div id="app"></div>',
      `<div id="app">${markup}</div>`,
    );
    res.html(html);
  } catch (err) {
    console.error("SSR render error, downgrade to CSR...\n", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

// Remove this line as it's not needed with the new structure

process.on("exit", async () => {
  app.server.close();
});
