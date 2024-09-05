/* IMPORT */

import { renderToString } from "voby";
import App from "../../client/src/app";
import { Req } from "noren/node";

/* MAIN */
console.log(
	process.env.NODE_ENV,
	process.env.PORT,
	process.env.HELLO,
	process.env.PUBLIC_HELLO,
);
export async function render({ req }: { req: Req }) {
	return await renderToString(<App path={`/${req.path}`} />);
}
