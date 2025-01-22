import { defineConfig, loadEnv } from "@rsbuild/core";
import * as voby from "voby-unplugin";
import path from "node:path";

const { publicVars } = loadEnv({
  cwd: path.join(process.cwd(), "..", ".."),
});

export default defineConfig({
  dev: {
    writeToDisk: true,
  },
  server: {
    publicDir: {
      name: "./client/public",
      copyOnBuild: false,
    },
    printUrls: true,
  },
  environments: {
    client: {
      source: {
        define: {
          ...publicVars,
        },
        entry: {
          index: "./client/src/index.tsx",
        },
      },
      output: {
        // inlineStyles: true,
        // inlineScripts: true,
        distPath: {
          root: "./.output/client",
        },
        cleanDistPath: true,
        target: "web",
      },
      html: {
        template: "./client/src/index.html",
        inject: "head",
        scriptLoading: "defer",
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
          ctx.env === "development" && ctx.prependPlugins(voby.hmr.rspack());
        },
      },
    },
    ssr: {
      output: {
        minify: false,
        target: "node",
        sourceMap: {
          js: "eval-source-map",
        },
        distPath: {
          root: "./.output/server",
        },
        filename: {
          js: "[name].mjs",
        },
      },
      source: {
        define: {
          ...publicVars,
        },
        entry: {
          entry: "./server/src/entry.tsx",
          prod: "./server/src/prod.ts",
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
          config.output.library = { type: "module" };
          ctx.prependPlugins(voby.ssr.rspack());
        },
      },
    },
  },
});
