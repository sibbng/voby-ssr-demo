/* IMPORT */

import Page404 from "./pages/_404";
import PageCounter from "./pages/counter";
import PageHome from "./pages/home";
import PageLoader from "./pages/loader";
import PageScrolling from "./pages/scrolling";
import PageSearch from "./pages/search";
import PageUser from "./pages/user";
import { Navigate } from "voby-simple-router";
import type { RouterRoute } from "voby-simple-router";

/* MAIN */
export const routes: RouterRoute[] = [
	{
		path: "/",
		to: PageHome,
	},
	{
		path: "/counter",
		to: PageCounter,
	},
	{
		path: "/loader",
		// @ts-ignore
		// to: lazy ( () => import ( '../pages/loader' ) ),
		to: PageLoader,
		loader: () =>
			new Promise((resolve) => {
				setTimeout(() => {
					resolve(123);
				}, 1000);
			}),
	},
	{
		path: "/redirect",
		to: <Navigate to="/counter" />,
	},
	{
		path: "/scrolling",
		to: PageScrolling,
	},
	{
		path: "/search",
		to: PageSearch,
	},
	{
		path: "/user/:name",
		to: PageUser,
	},
	{
		path: "/404",
		to: Page404,
	},
];
