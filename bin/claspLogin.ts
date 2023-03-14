import * as path from "https://deno.land/std@0.167.0/path/mod.ts";

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

const makeClaspRcFile = async () => {
  const code = await runClaspLogin();
  if (code !== 0) return code;
  try {
    const clasprcPath = path.join(
      Deno.env.get("HOME") ?? "./",
      ".clasprc.json",
    );
    const clasprc = JSON.parse(Deno.readTextFileSync(clasprcPath));
    const clsaprcEnvInfo = {
      CLASPRC_ACCESS_TOKEN: clasprc.token.access_token as string,
      CLASPRC_ID_TOKEN: clasprc.token.id_token as string,
      CLASPRC_EXPIRY_DATE: clasprc.token.expiry_date as string,
      CLASPRC_REFRESH_TOKEN: clasprc.token.refresh_token as string,
      CLASPRC_CLIENT_ID: clasprc.oauth2ClientSettings.clientId as string,
      CLASPRC_CLIENT_SECRET: clasprc.oauth2ClientSettings
        .clientSecret as string,
    };
    const clasprcEnv = [
      ...Object.entries(clsaprcEnvInfo).map(([key, value]) =>
        `${key}=${value}`
      ),
    ].join("\n") + "\n";
    Deno.writeTextFileSync(".clasprc.json.env", clasprcEnv);
    console.log(
      "add content of .clasprc.json.env to environmental variables(.env)",
    );
    return code;
  } catch (_) {
    return 1;
  }
};

if (import.meta.main) {
  const code = await makeClaspRcFile();
  Deno.exit(code);
}

export { runClaspLogin };
