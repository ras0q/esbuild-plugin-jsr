import * as esbuild from "esbuild";
import esbuildJsrPlugin from "./mod.ts";
import { assertEquals, assertNotEquals } from "@std/assert";

// TODO: fix following error
// ERRORS
//
// esbuildRebuild => ./mod_test.ts:6:6
// error: Leaks detected:
//   - A child process stdin was opened during the test, but not closed during the test. Close the child process stdin by calling `proc.stdin.close()`.
//   - A child process stdout was opened during the test, but not closed during the test. Close the child process stdout by calling `proc.stdout.close()` or `await child.stdout.cancel()`.
//   - A child process was started during the test, but not closed during the test. Close the child process by calling `proc.kill()` or `proc.close()`.
//   - An async call to op_read was started in this test, but never completed.
//   - An async operation to wait for a subprocess to exit was started in this test, but never completed. This is often caused by not awaiting the result of a `Deno.Process#status` call.
// To get more details where leaks occurred, run again with the --trace-leaks flag.
Deno.test(async function esbuildRebuild() {
  const context = await esbuild.context({
    entryPoints: ["./mod.ts"],
    write: false,
    external: ["@deno/emit"],
    bundle: true,
    minify: true,
    sourcemap: false,
    sourcesContent: false,
    plugins: [esbuildJsrPlugin()],
  });

  const result = await context.rebuild();
  await context.dispose();

  assertEquals(result.errors, []);
  assertNotEquals(new TextDecoder().decode(result.outputFiles[0].contents), "");
});
