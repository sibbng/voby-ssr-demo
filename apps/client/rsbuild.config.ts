import { defineConfig } from "@rsbuild/core";
import * as voby from "voby-unplugin";

export default defineConfig({
	server: {
		publicDir: {
			name: "public",
			copyOnBuild: true,
		},
		port: 8080,
		printUrls: false
	},
	dev: {
		client: {
			port: 8080,
		},
		watchFiles: {
			paths: ["../../packages/voby-unplugin/**/*"],
		},
		writeToDisk: true,
	},
	source: {
		entry: {
			index: "./src/index.tsx",
		},
	},
	output: {
		inlineStyles: true,
		inlineScripts: true,
		distPath: {
			root: "dist",
		},
		cleanDistPath: true,
	},
	html: {
		template: "./public/index.html",
		inject: "body",
		scriptLoading: "blocking",
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
			ctx.env === "development" && ctx.prependPlugins(voby.hmr.rspack());
		},
	},
});
