/* IMPORT */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { favicon, serveStatic } from "noren/middlewares";
import Server from "noren/edge";
import { renderToString } from "voby";
import App from "../../client/src/app";

/* MAIN */

const INDEX_PATH = path.join(
	process.cwd(),
	"..",
	"client",
	"dist",
	"index.html",
);
const INDEX_CONTENT = fs.readFileSync(INDEX_PATH, "utf8");

const app = new Server();

app.use(
	favicon(path.join(process.cwd(), "..", "client", "dist", "favicon.ico")),
);
app.use(serveStatic(path.join(process.cwd(), "apps", "client", "dist")));

app.get("*", async (req, res) => {
	try {
		const app = await renderToString(<App path={`/${req.url.pathname}`} />);
		const page = INDEX_CONTENT.replace(
			'<div id="app"></div>',
			`<div id="app">${app}</div>`,
		);
		res.html(page);
	} catch (error: unknown) {
		res.status(500);
		console.error(error);
	}
});

export default {
	port: process.env.PORT,
	fetch: app.fetch.bind(app),
}
