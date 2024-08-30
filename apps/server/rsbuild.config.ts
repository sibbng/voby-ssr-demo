import { defineConfig } from "@rsbuild/core";
import * as voby from "voby-unplugin";

export default defineConfig({
	server: {
		port: 35000, // Not using this, see the plugin below
	},
	dev: {
		watchFiles: {
			paths: ["../../packages/voby-unplugin/**/*"],
		},
		writeToDisk: true,
	},
	source: {
		entry: {
			"entry.prod": "./src/entry.prod.tsx",
			"entry.dev": "./src/entry.dev.tsx",
		},
	},
	output: {
		target: "node",
		distPath: {
			root: "dist",
		},
		cleanDistPath: true,
	},
	tools: {
		swc: {
			jsc: {
				transform: {
					react: {
						runtime: "automatic",
						importSource: "voby",
					},
				},
			},
		},
		rspack(config, ctx) {
			config.experiments ??= {};
			config.experiments.outputModule = true;
			config.output ??= {};
			config.output.module = true;
			config.output.chunkFormat = "module";
			config.output.library = { type: "modern-module" };
			config.devServer = false;
			ctx.prependPlugins(voby.ssr.rspack());
		},
	},
});
