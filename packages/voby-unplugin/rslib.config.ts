import { defineConfig } from "@rslib/core";

export default defineConfig({
	lib: [
		{
			dts: {
				distPath: "./dist",
				bundle: true,
			},
			format: "esm",
			output: {
				distPath: {
					root: "./dist",
				},
			},
		},
		{
			dts: {
				distPath: "./dist",
				bundle: true,
			},
			format: "cjs",
			output: {
				distPath: {
					root: "./dist",
				},
			},
		},
	],
	output: {
		target: "node",
	},
});
