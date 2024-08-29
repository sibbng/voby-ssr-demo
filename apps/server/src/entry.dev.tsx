/* IMPORT */

import Server from "noren/node";
import { renderToString } from "voby";
import { useRouter } from "voby-simple-router";
import { routes } from "../../client/src/routes";
import App from "../../client/src/app";

/* MAIN */

const app = new Server();
const router = useRouter(routes);

app.get("*", async (req, res) => {
	if (router.route(req.path)) {
		// Using SSR
		try {
			const content = await fetch(`http://localhost:8080/`).then((r) =>
				r.text(),
			);
			const app = await renderToString(<App path={`/${req.url.pathname}`} />);
			const page = content.replace(
				'<div id="app"></div>',
				`<div id="app">${app}</div>`,
			);
			res.html(page);
		} catch (error: unknown) {
			res.status(500);
			console.error(error);
		}
	} else {
		const response = await fetch(`http://localhost:8080${req.url.pathname}`);
		if (response.ok) {
			res.header(
				"Content-Type",
				response.headers.get("Content-Type") || "text/plain",
			);
			res.send(response.body!);
		} else {
			res.status(404);
		}
	}
});

app.listen(Number(process.env.PORT), () => {
	console.log(`Listening on: http://localhost:${process.env.PORT}`);
});
