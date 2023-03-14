import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import type { ClaspRc, EnvData, SrciptId } from "./envType.ts";

const runClaspLogin = async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-env",
      "--allow-sys",
      "--allow-net",
      "--allow-run",
      "--allow-write",
      "npm:@google/clasp",
      "login",
    ],
  });

  const { code } = await p.status();
  return code;
};

const fileExists = (path: string | URL) => {
  try {
    const fileInfo = Deno.statSync(path);
    return fileInfo.isFile;
  } catch {
    return false;
  }
};

const getClaspRcInfo = async (force = false): Promise<ClaspRc> => {
  const clasprcPath = path.join(
    Deno.env.get("HOME") ?? "./",
    ".clasprc.json",
  );
  if (!fileExists(clasprcPath) || force) {
    const code = await runClaspLogin();
    if (code !== 0) throw new Error(`Error during clasp login (code:${code})`);
  }
  if (!fileExists(clasprcPath)) throw new Error(`Fail to ditect .clasprc.json`);
  const clasprc = JSON.parse(Deno.readTextFileSync(clasprcPath));
  return {
    CLASPRC_ACCESS_TOKEN: clasprc.token.access_token as string,
    CLASPRC_ID_TOKEN: clasprc.token.id_token as string,
    CLASPRC_EXPIRY_DATE: clasprc.token.expiry_date as string,
    CLASPRC_REFRESH_TOKEN: clasprc.token.refresh_token as string,
    CLASPRC_CLIENT_ID: clasprc.oauth2ClientSettings.clientId as string,
    CLASPRC_CLIENT_SECRET: clasprc.oauth2ClientSettings
      .clientSecret as string,
  } as const;
};

const getScriptId = async (): Promise<SrciptId> => {
  const prevId = fileExists(".clasp.json") &&
    JSON.parse(Deno.readTextFileSync(".clasp.json"))?.scriptId;
  const scriptId = prevId
    ? prevId
    : await Input.prompt(`Please specify app script ID.`);
  if (!scriptId) throw new Error(`Failt to get app script ID`);
  const data = { SCRIPT_ID: scriptId } as const;
  return data;
};

const getEnvInfo = async (): Promise<EnvData> => {
  const data = { ...await getClaspRcInfo(), ...await getScriptId() } as const;
  return data;
};

const updateEnvFile = (data: EnvData) => {
  const envText =
    Object.entries(data).map(([key, value]) => `${key}=${value}`).join("\n") +
    "\n";
  Deno.writeTextFileSync("claspInfo.env", envText);
  console.log(
    "add content of claspInfo.env to environmental variables(.env)",
  );
};

const makeEnvFile = async () => {
  const info = { ...await getEnvInfo() } as const;
  updateEnvFile(info);
};

if (import.meta.main) {
  await makeEnvFile();
  Deno.exit();
}

export { getClaspRcInfo, getScriptId, updateEnvFile };
