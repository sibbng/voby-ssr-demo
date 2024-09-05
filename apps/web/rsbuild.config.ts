import { defineConfig, loadEnv } from "@rsbuild/core";
import * as voby from "voby-unplugin";
import path from "node:path";

// We do this because Rsbuild can't load .env files properly if target file is esm module
const parsedEnv = loadEnv({
	mode: process.env.NODE_ENV,
	cwd: path.join(process.cwd(), "..", ".."),
}).parsed;
const serverEnv: Record<string, string> = {};
for (const key in parsedEnv) {
	serverEnv[`process.env.${key}`] = `"${parsedEnv[key]}"`;
}

export default defineConfig({
	dev: {
		watchFiles: {
			paths: ["../../packages/voby-unplugin/**/*"],
		},
		writeToDisk: true,
	},
	server: {
		publicDir: {
			name: "public",
			copyOnBuild: true,
		},
		printUrls: true,
	},
	environments: {
		web: {
			source: {
				entry: {
					index: "./client/src/index.tsx",
				},
			},
			output: {
				inlineStyles: true,
				inlineScripts: true,
				distPath: {
					root: "dist",
				},
				cleanDistPath: true,
				target: "web",
			},
			html: {
				template: "./client/public/index.html",
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
		},
		ssr: {
			output: {
				target: "node",
				distPath: {
					root: "dist/server",
				},
				filename: {
					js: "[name].mjs",
				},
			},
			source: {
				define: {
					...serverEnv,
				},
				entry: {
					index: "./server/src/index.tsx",
				},
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
					config.output.library = {
						type:
							process.env.NODE_ENV === "production"
								? "modern-module"
								: "module",
					};
					ctx.prependPlugins(voby.ssr.rspack());
				},
			},
		},
	},
});
