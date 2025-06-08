import * as esbuild from "esbuild";
import { esbuildJsrPlugin } from "./mod.ts";
import { assertEquals, assertNotEquals } from "@std/assert";

Deno.test(async function esbuildRebuild() {
  const result = await esbuild.build({
    entryPoints: ["./mod.ts"],
    write: false,
    format: "esm",
    external: ["@deno/emit"],
    bundle: true,
    minify: true,
    sourcemap: false,
    sourcesContent: false,
    plugins: [esbuildJsrPlugin()],
  });

  await esbuild.stop();

  assertEquals(result.errors, []);
  assertNotEquals(new TextDecoder().decode(result.outputFiles[0].contents), "");
});
