import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { load as loadEnv } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import type { ClaspRc, EnvData, SrciptId } from "./envType.ts";
import { getClaspRcInfo, getScriptId, updateEnvFile } from "./makeEnvFies.ts";

const validateClaspRc = (data: Partial<EnvData>) => {
  return (
    data.CLASPRC_ACCESS_TOKEN &&
    data.CLASPRC_ID_TOKEN &&
    data.CLASPRC_EXPIRY_DATE &&
    data.CLASPRC_REFRESH_TOKEN &&
    data.CLASPRC_CLIENT_ID &&
    data.CLASPRC_CLIENT_SECRET
  );
};

const validateSrtiptId = (data: Partial<EnvData>) => {
  return (
    data.SCRIPT_ID
  );
};

const load = async (updateEnv = true): Promise<EnvData> => {
  const rawData = {
    ...Deno.env.toObject(),
    ...await loadEnv({ envPath: "info.env" }),
    ...await loadEnv({ envPath: ".env" }),
  };
  const claspRc = validateClaspRc(rawData)
    ? rawData as ClaspRc
    : await getClaspRcInfo();
  const scriptId = validateSrtiptId(rawData)
    ? rawData as SrciptId
    : await getScriptId();
  const data = { ...claspRc, ...scriptId } as const;
  if (updateEnv && (!validateClaspRc(rawData) || !validateSrtiptId(rawData))) {
    updateEnvFile(data);
  }
  return data;
};

const updateClaspFiles = (data: EnvData) => {
  const userHome = Deno.env.get("HOME") ?? "./";

  const clasprc = {
    token: {
      access_token: data.CLASPRC_ACCESS_TOKEN,
      scope:
        "https://www.googleapis.com/auth/script.deployments https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file openid https://www.googleapis.com/auth/service.management https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/logging.read https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/script.webapp.deploy",
      token_type: "Bearer",
      id_token: data.CLASPRC_ID_TOKEN,
      expiry_date: data.CLASPRC_EXPIRY_DATE,
      refresh_token: data.CLASPRC_REFRESH_TOKEN,
    },
    oauth2ClientSettings: {
      clientId: data.CLASPRC_CLIENT_ID,
      clientSecret: data.CLASPRC_CLIENT_SECRET,
      redirectUri: "http://localhost",
    },
    isLocalCreds: false,
  };
  const clasprcOutput = JSON.stringify(clasprc, null, 2);
  Deno.writeTextFileSync(path.join(userHome, ".clasprc.json"), clasprcOutput);

  const clasp = {
    scriptId: data.SCRIPT_ID,
    rootDir: "dist",
  };

  const claspOutput = JSON.stringify(clasp, null, 2);
  Deno.writeTextFileSync(".clasp.json", claspOutput);
};

const makeClaspFiles = async () => {
  const data = await load();
  updateClaspFiles(data);
};

if (import.meta.main) {
  await makeClaspFiles();
  Deno.exit();
}

export { makeClaspFiles };
