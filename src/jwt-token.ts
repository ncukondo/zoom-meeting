///  <reference types="npm:@types/google-apps-script@1.0.56" />

import {
  create as createJwt,
  getNumericDate,
} from "https://deno.land/x/djwt@v2.2/mod.ts";

const getJWTinDeno = async (apiKey: string, apiSecret: string) => {
  const claimSet = {
    iss: apiKey,
    exp: getNumericDate(Date.now() + 3600),
  };
  return await createJwt(
    {
      alg: "HS256",
      typ: "JWT",
    },
    claimSet,
    apiSecret,
  );
};

/**
 * @param {string} apiKey
 * @param {string} apiSecret
 * @return {Promise<string>}
 */
const getJWTToken = async (
  apiKey: string,
  apiSecret: string,
): Promise<string> => {
  if (typeof Utilities === "undefined") {
    return await getJWTinDeno(apiKey, apiSecret);
  }
  const header = Utilities.base64Encode(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    }),
  );
  const claimSet = JSON.stringify({
    iss: apiKey,
    exp: Date.now() + 3600,
  });
  const encodeText = `${header}.${Utilities.base64Encode(claimSet)}`;
  const signature = Utilities.computeHmacSha256Signature(encodeText, apiSecret);
  const jwtToken = `${encodeText}.${Utilities.base64Encode(signature)}`;
  return jwtToken;
};

export { getJWTToken };
