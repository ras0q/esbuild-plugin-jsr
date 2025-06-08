import type { OnLoadResult, OnResolveResult, Plugin } from "esbuild";
import {
  format as formatSemver,
  maxSatisfying as maxSatisfyingSemver,
  parse as parseSemver,
  parseRange as parseSemverRange,
} from "@std/semver";
import { bundle } from "@deno/emit";
import * as b from "jsr:@std/path/basename";

/** JsrPluginOptions is a set of options for {@link esbuildJsrPlugin} */
export type JsrPluginOptions = {
  namespace?: string;
};

/** esbuildJsrPlugin is a function to create an esbuild plugin for jsr.io */
export const esbuildJsrPlugin = (options?: JsrPluginOptions): Plugin => {
  const namespace = options?.namespace ?? "jsr-loader";

  console.log(b);

  return {
    name: "jsr",
    setup: (build) => {
      build.onResolve({ filter: /^jsr:|^@/ }, async (args) => {
        if (args.kind !== "import-statement") return null;
        if (build.initialOptions.external?.includes(args.path)) return null;

        const resolved = import.meta.resolve(args.path);
        if (!resolved) return null;

        const isHTTP = resolved.startsWith("http://") ||
          resolved.startsWith("https://");
        const isJSR = resolved.startsWith("jsr:");
        if (!isHTTP && !isJSR) return null;

        if (isHTTP) {
          return {
            external: false,
            namespace,
            path: resolved,
          } satisfies OnResolveResult;
        }

        if (isJSR) {
          const matches = resolved.match(
            /^jsr:(@[^/]+\/[^@]+)(?:@([^/]+))?(?:(\/.+))?$/,
          );
          if (!matches) throw `Invalid JSR import: ${args.path}`;

          const [, packageName, version, path] = matches;
          const jsrioBasePath = `https://jsr.io/${packageName}`;
          const meta = await (await fetch(`${jsrioBasePath}/meta.json`))
            .json() as { versions: Record<string, unknown> };
          const resolvedSemver = maxSatisfyingSemver(
            Object.keys(meta.versions).map(parseSemver),
            parseSemverRange(version),
          );
          if (!resolvedSemver) {
            throw `No matching version found for ${packageName}@${version}`;
          }

          const resolvedVersion = formatSemver(resolvedSemver);
          const versionMeta = await (await fetch(
            `${jsrioBasePath}/${resolvedVersion}_meta.json`,
          )).json() as { exports: Record<string, string> };

          const exportPath = `.${path ?? ""}`;
          const resolvedPath = versionMeta.exports[exportPath]?.replace(
            /^\.\/?/,
            "",
          );
          if (!resolvedPath) throw `Export not found: ${exportPath}`;

          const resolvedUrl =
            `${jsrioBasePath}/${resolvedVersion}/${resolvedPath}`;

          return {
            external: false,
            namespace,
            path: resolvedUrl,
          } satisfies OnResolveResult;
        }
      });

      build.onLoad(
        { filter: /\.(ts|js)/, namespace },
        async (args) => {
          const { code } = await bundle(args.path);

          return {
            contents: code,
            loader: args.path.endsWith(".ts") ? "ts" : "js",
          } satisfies OnLoadResult;
        },
      );
    },
  };
};

export default esbuildJsrPlugin;
