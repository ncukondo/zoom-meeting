import { Input } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

const versionStore = "version.json";

const fileExists = (path: string | URL) => {
  try {
    const stat = Deno.statSync(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

const getPrevVersion = () => {
  const prevVersion = fileExists(versionStore) &&
      JSON.parse(Deno.readTextFileSync(versionStore))?.version || "0.0.0";
  return prevVersion;
};

const getNewVersion = (prevVersion: string) => {
  const version = prevVersion.split(".").map((v) => parseInt(v));
  version[2] += 1;
  return version.join(".");
};

const saveNewVersion = (newVersion: string) => {
  const data = fileExists(versionStore) &&
      JSON.parse(Deno.readTextFileSync(versionStore)) || {};
  const newData = { ...data, ...{ version: newVersion } };
  Deno.writeTextFileSync(versionStore, JSON.stringify(newData, null, 2));
};

const promptNewVersion = async (prevVersion: string) => {
  const newVersion = await Input.prompt({
    message: `Please specify new version. (prev: ${prevVersion})`,
    default: getNewVersion(prevVersion),
  });
  return newVersion;
};

const addGitTag = (newVersion: string) => {
  const command = new Deno.Command("git", { args: ["tag", `v${newVersion}`] });
  const { code, stdout, stderr } = command.outputSync();
  if (code === 0) {
    console.log(new TextDecoder().decode(stdout));
  } else {
    console.error("Error in add git tag:" + new TextDecoder().decode(stderr));
  }
};

const main = async () => {
  const prevVersion = getPrevVersion();
  const newVersion = await promptNewVersion(prevVersion);
  saveNewVersion(newVersion);
  addGitTag(newVersion);
  console.log(`new version saved. -> ${newVersion}`);
  return newVersion;
};

if (import.meta.main) {
  await main();
  Deno.exit();
}
