///  <reference types="npm:@types/google-apps-script@1.0.56" />

const convertFetchParams = (
  params: RequestInit = {},
): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions => {
  const { method, headers, body } = params;
  const payload = body;
  const contentType = (headers as Record<string, string>)?.["Content-Type"];
  const convertedParams = {
    method,
    headers,
    payload,
    contentType,
  } as GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
  return convertedParams;
};

const doFetch = async (url: string, params: RequestInit = {}) => {
  if (typeof UrlFetchApp !== "undefined") {
    const res = UrlFetchApp.fetch(
      url,
      convertFetchParams(params),
    );
    return {
      // deno-lint-ignore require-await
      text: async () => res.getContentText(),
      // deno-lint-ignore require-await
      json: async () => JSON.parse(res.getContentText()),
      Response: res.getResponseCode(),
      ok: res.getResponseCode() === 200 || res.getResponseCode() === 201,
      cancel: async () => {},
    };
  }
  const res = await fetch(url, params);
  const canceled = !res.ok;
  if (canceled) await res?.body?.cancel();
  return {
    text: async () => await res.text(),
    json: async () => await res.json(),
    Response: res.status,
    ok: res.ok,
    cancel: async () => {
      canceled || await res.body?.cancel();
    },
  };
};

const fetchText = async (url: string, params: RequestInit = {}) => {
  const res = await doFetch(url, params);
  if (res.ok) {
    return await res.text();
  }
  res.cancel();
  return null;
};

const fetchJson = async <T>(url: string, params: RequestInit = {}) => {
  const res = await doFetch(url, params);
  if (res.ok) {
    return await res.json() as T;
  }
  res.cancel();
  return null;
};

export { doFetch, fetchJson, fetchText };
