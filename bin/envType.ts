type ClaspRc = Readonly<{
  CLASPRC_ACCESS_TOKEN: string;
  CLASPRC_ID_TOKEN: string;
  CLASPRC_EXPIRY_DATE: string;
  CLASPRC_REFRESH_TOKEN: string;
  CLASPRC_CLIENT_ID: string;
  CLASPRC_CLIENT_SECRET: string;
}>;

type SrciptId = Readonly<{
  SCRIPT_ID: string;
}>;

type EnvData = ClaspRc & SrciptId;

export type { ClaspRc, EnvData, SrciptId };
