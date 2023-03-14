import { fetchJson } from "./fetch.ts";
import * as base64 from "https://deno.land/std@0.178.0/encoding/base64.ts";

type SuccessResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};
type FailResponse = {
  reason: string;
  error: string;
};

const base64Encode = (source: string): string => {
  if (typeof Utilities !== "undefined") {
    return Utilities.base64Encode(source);
  }
  return base64.encode(source);
};

const getAccessToken = async (
  clientId: string,
  clientSecret: string,
  acountId: string,
) => {
  const url =
    "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" +
    acountId;
  const client = base64Encode(`${clientId}:${clientSecret}`);
  const options = {
    method: "POST",
    headers: {
      "Authorization": "Basic " + client,
    },
  } as const satisfies RequestInit;
  const res = await fetchJson<SuccessResponse | FailResponse>(url, options);
  if (!res) throw new Error("Failed to fetch");
  if ("error" in res) throw new Error(`${res.reason}(${res.error})`);
  return res.access_token;
};

export { getAccessToken };
