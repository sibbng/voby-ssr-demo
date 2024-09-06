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
      name: "public",
      copyOnBuild: true,
    },
    printUrls: true,
  },
  environments: {
    web: {
      source: {
        define: {
          ...publicVars,
        },
        entry: {
          index: "./client/src/index.tsx",
        },
      },
      output: {
        inlineStyles: true,
        inlineScripts: true,
        distPath: {
          root: ".output/client",
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
          root: ".output/server",
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
