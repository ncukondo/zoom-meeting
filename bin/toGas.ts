import { build as esbuild } from "https://deno.land/x/esbuild@v0.17.11/mod.js";
import { cache } from "npm:esbuild-plugin-cache";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { parse as parseArgs } from "https://deno.land/std@0.66.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.179.0/fs/ensure_dir.ts";

const packageFile = "version.json";

type ImportMap = { imports: Record<string, string> };
type ConvertOption = {
  importmap: ImportMap;
  cachePath: string;
  appname: string;
  exposeExports?: boolean;
};
type BuildOption = ConvertOption & {
  outfile: string;
};

const buildiif = async (
  sourcePath: string,
  { importmap, cachePath, appname }: ConvertOption,
) => {
  const plugins = importmap && cachePath
    ? { plugins: [cache({ importmap, directory: cachePath })] }
    : {};
  const result = await esbuild({
    entryPoints: [sourcePath],
    bundle: true,
    format: "iife",
    globalName: appname,
    write: false,
    ...plugins,
  });
  const text = new TextDecoder().decode(result.outputFiles[0].contents);
  return text;
};

const exposeEntryExports = (code: string, globalName: string) => {
  const exports = new Function(`${code} return ${globalName}`)();
  const isFunction = (x: unknown): x is (...args: unknown[]) => unknown =>
    typeof x === "function";
  return Object.entries(exports).map(([name, obj]) => {
    return isFunction(obj)
      ? `function ${name}(...args){ return ${globalName}.${name}(...args);}`
      : `const ${name} = ${globalName}.${name};`;
  }).join("\n");
};

const loadImportmap = async () => {
  const nameCandidates = [
    "deno.jsonc",
    "deno.json",
    "import_map.json",
  ];
  const candidates = nameCandidates.flatMap((name) =>
    ["./", "../"].map((dir) => dir + name)
  );
  const file = (await Promise.all(candidates.map((path) =>
    (async () => {
      try {
        const info = Deno.stat(path);
        return { isFile: (await info).isFile, path };
      } catch {
        return { isFIle: false, path };
      }
    })()
  ))).find((info) => info?.isFile)?.path;
  if (file) return JSON.parse(await Deno.readTextFile(file)) as ImportMap;
  return { "imports": {} as Record<string, string> };
};

const getAppName = (sourcePath: string) => {
  const fileExists = (path: string | URL) => {
    try {
      const stat = Deno.statSync(path);
      return stat.isFile;
    } catch {
      return false;
    }
  };
  if (fileExists(packageFile)) {
    const pkg = JSON.parse(Deno.readTextFileSync(packageFile));
    return pkg.name.split("/").at(-1).replaceAll("-", "_");
  }
  const basename = path.basename(sourcePath);
  const [appname] = basename.split(".").map((t) => t.replaceAll("-", "_"));
  return appname;
};

const makeDefaultOption = async (sourcePath: string): Promise<BuildOption> => {
  const appname = getAppName(sourcePath);
  const dir = path.dirname(sourcePath);
  const outfile = path.join(dir, `${appname}.js`);
  const importmap = await loadImportmap();
  const cachePath = path.join(
    Deno.env.get("HOME") ?? "./",
    ".deno_build_cache",
  );
  return {
    appname,
    importmap,
    cachePath,
    outfile,
    exposeExports: true,
  };
};

const convert = async (
  sourcePath: string,
  options?: Partial<ConvertOption>,
) => {
  const defaultOption = makeDefaultOption(sourcePath);
  const { exposeExports, outfile, ...opt } = {
    ...await defaultOption,
    ...options,
  };
  const code = await buildiif(sourcePath, opt);
  const tail = exposeExports
    ? "\n\n" + exposeEntryExports(code, opt.appname)
    : "";
  await Deno.writeTextFile(outfile, code + tail);
  return code + tail;
};

const build = async (
  sourcePath: string,
  options?: Partial<BuildOption>,
) => {
  const defaultOption = makeDefaultOption(sourcePath);
  const { exposeExports, outfile, ...opt } = {
    ...await defaultOption,
    ...options,
  };
  const code = await buildiif(sourcePath, opt);
  const tail = exposeExports
    ? "\n\n" + exposeEntryExports(code, opt.appname)
    : "";
  const dir = path.dirname(outfile);
  await ensureDir(dir);
  await Deno.writeTextFile(outfile, code + tail);
  return code + tail;
};

if (import.meta.main) {
  const opts = parseArgs(Deno.args) as Partial<BuildOption> & { "_": string[] };
  const entryPoint = opts["_"][0];

  await build(entryPoint, opts);

  Deno.exit();
}

export { build, convert };
export type { BuildOption, ConvertOption };
