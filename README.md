# @ras0q/esbuild-plugin-jsr

[![JSR][jsr-badge]][jsr-link] [![JSR Score][jsr-score-badge]][jsr-link]

A simple [esbuild](https://esbuild.github.io/) plugin to load [JSR](https://jsr.io) packages.

## Usage

```bash
deno add jsr:@ras0q/esbuild-plugin-jsr
```

```typescript
import * as esbuild from "esbuild";
import { esbuildJsrPlugin } from "@ras0q/esbuild-plugin-jsr";

const context = await esbuild.context({
  entryPoints: ["./mod.ts"],
  bundle: true,
  plugins: [esbuildJsrPlugin()], // ← Add the plugin!
  // other settings...
});

const result = await context.rebuild();
```

[jsr-link]: https://jsr.io/@ras0q/esbuild-plugin-jsr
[jsr-badge]: https://jsr.io/badges/@ras0q/esbuild-plugin-jsr
[jsr-score-badge]: https://jsr.io/badges/@ras0q/esbuild-plugin-jsr/score
