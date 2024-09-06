/* IMPORT */

import { render } from "voby";
import App from "./app";
import "./main.css";

/* MAIN */

console.log("client", import.meta.env.PUBLIC_HELLO);
render(<App />, document.getElementById("app"));
