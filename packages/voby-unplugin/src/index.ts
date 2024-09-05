import { createUnplugin } from "unplugin";
import MagicString from "magic-string";

interface Options {
	hmr?: {
		enabled?: boolean;
		filter?: RegExp;
	};
}

export const hmr = createUnplugin<Options | undefined>((options = {}, meta) => {
	if (!/vite|rspack/.test(meta.framework)) {
		console.warn(`Voby plugin not tested with ${meta.framework}`);
	}
	const hmrEnabled =
		options.hmr?.enabled ?? process.env.NODE_ENV === "development";
	const hmrFilter = options.hmr?.filter ?? /\.(jsx|tsx)$/;
	const hmrDefaultExportRe =
		/^export\s+default\s+(_?[A-Z][a-zA-Z0-9$_-]*)\s*(;|$)/m;
	const hmrNamedExportRe = /^export\s+{([^}]+)}/gm;
	const hmrNamedExportSingleRe = /^\s*(_?[A-Z][a-zA-Z0-9$_-]*)\s*$/;
	const hmrNamedExportAliasedRe =
		/^\s*([a-zA-Z$_][a-zA-Z0-9$_]*)\s+as\s+(_?[A-Z][a-zA-Z0-9$_-]*|default)\s*$/;
	const hmrNamedInlineExportRe =
		/^export\s+((?:function|const)\s+(_?[A-Z][a-zA-Z0-9$_-]*))/gm;
	const hmrNamedDefaultExportRe =
		/^export\s+(?:default\s+)?((?:function|const)\s+(_?[A-Z][a-zA-Z0-9$_-]*))/gm;

	const templates = {
		rspack: /* js */ `
      let onAccept___name__ = module.hot.data?.__name__.acceptFn || ((_onAccept) => { 
        onAccept___name__ = _onAccept
      });
      const $$hmr___name__ = module.hot.data?.__name__.component || $$hmr(onAccept___name__, __name__)
      __export__
      onAccept___name__({default:__name__})
      module.hot.dispose((data) => {
        data.__name__ = { component: $$hmr___name__, acceptFn: onAccept___name__ }
      })
    `,
		vite: /* js */ `
      const $$hmr___name__ = $$hmr(import.meta.hot?.accept?.bind(import.meta.hot), __name__);
      __export__
    `,
	};

	const template =
		templates[meta.framework.endsWith("pack") ? "rspack" : "vite"];

	const generateExports = ({
		name,
		type = "default",
		alias,
	}: {
		name: string;
		type: "named" | "default";
		alias?: string;
	}) => {
		let code = template.replaceAll("__name__", name);
		if (type === "named") {
			code = code.replace(
				"__export__",
				() => `export {$$hmr_${name} as ${name}};`,
			);
		} else if (alias) {
			if (!code.includes(`${name} as default`)) {
				code = code.replace(
					"__export__",
					() => `export {$$hmr_${name} as ${alias}};`,
				);
			}
		} else {
			code = code.replace("__export__", () => `export default $$hmr_${name};`);
		}
		return code;
	};

	return {
		name: "voby",
		enforce: "pre",
		transformInclude: (id) => {
			return hmrEnabled && hmrFilter.test(id);
		},
		transform(code, id) {
			const exports: string[] = [];
			// incject import
			code = `import {hmr as $$hmr} from 'voby';\n${code}`;
			code = code.replace(hmrDefaultExportRe, (_, $1, $2) => {
				return generateExports({
					name: $1,
					type: "default",
				}).concat($2);
			});
			code = code.replace(hmrNamedInlineExportRe, (_, $1, $2) => {
				exports.push(
					generateExports({
						name: $2,
						type: "named",
					}),
				);
				return $1;
			});
			code = code.replace(hmrNamedDefaultExportRe, (_, $1, $2) => {
				exports.push(
					generateExports({
						name: $2,
						type: "default",
					}),
				);
				return $1;
			});

			code = code.replace(hmrNamedExportRe, ($0, $1) => {
				const parts = $1.split(",").filter((part: string) => {
					const matchSingle = part.match(hmrNamedExportSingleRe);
					const matchAliased = part.match(hmrNamedExportAliasedRe);

					if (matchSingle) {
						const name = matchSingle[1];

						exports.push(
							generateExports({
								name,
								type: "named",
							}),
						);

						return false;
					} else if (matchAliased) {
						const name = matchAliased[1];
						const alias = matchAliased[2];

						exports.push(
							generateExports({
								name,
								type: "named",
								alias,
							}),
						);

						return false;
					} else {
						return true;
					}
				});
				return parts.length ? `export {${parts.join(",")}}` : $0;
			});
			if (exports.length) {
				code += `\n${exports.join("\n")}`;
			}

			if (meta.framework === "rspack") {
				code += "\nmodule.hot.accept()\n";
			}
			return code;
		},
	};
});

export const ssr = createUnplugin(() => {
	const linkedomImports = [
		"window",
		"document",
		"HTMLElement",
		"Element",
		"Node",
	].join(",");
	const virtualModuleId = "\0voby-linkedom";
	const targetPackagesRE = /node_modules\/(voby|when-exit)\/dist/;

	return {
		name: "voby-ssr-helpers",
		enforce: "pre",
		transformInclude: (id) => {
			id = id.replaceAll("\\", "/");
			return targetPackagesRE.test(id);
		},
		resolveId: (id) => {
			if (id === virtualModuleId) {
				return id;
			}
		},
		load: (id) => {
			if (id === virtualModuleId) {
				return /* js */ `
          import {parseHTML} from 'linkedom';
          const {${linkedomImports}} = parseHTML('<!doctype html><html><head></head><body></body></html>');
					import {nextTick} from 'node:process';
					globalThis.queueMicrotask = nextTick;
          export {${linkedomImports}};`;
			}
		},
		transform(code, id) {
			id = id.replaceAll("\\", "/");
			if (targetPackagesRE.test(id)) {
				const s = new MagicString(code);
				s.prepend(`import {${linkedomImports}} from '${virtualModuleId}';\n`);
				return {
					code: s.toString(),
					map: s.generateMap(),
				};
			}
		},
	};
});
