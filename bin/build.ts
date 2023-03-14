import { build } from "./toGas.ts";
import type { BuildOption } from "./toGas.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { copy as copyFile } from "https://deno.land/std@0.179.0/fs/mod.ts";
import { emptyDir } from "https://deno.land/std@0.179.0/fs/mod.ts";

const doBuild = async (options?: Partial<BuildOption>) => {
  const outfile = path.join("dist", "main.js");
  const opt: Partial<BuildOption> = {
    outfile,
    ...options ?? {},
  };
  return await build("src/main.ts", opt);
};

const clean = async () => {
  await emptyDir("dist");
};

const copy = async () => {
  await copyFile("public", "dist", { overwrite: true });
  await copyFile("src/appsscript.json", "dist/appsscript.json");
};

if (import.meta.main) {
  await clean();
  await copy();
  await doBuild();
  Deno.exit();
}
