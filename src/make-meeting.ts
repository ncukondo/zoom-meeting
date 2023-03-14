/* eslint-disable camelcase */
import { deltaMinute, formatDate } from "./date_utils.ts";
import { fetchJson } from "./fetch.ts";
import { makePassword } from "./password.ts";
import { getAccessToken } from "./oauth-token.ts";

// https://qiita.com/kudota/items/b480610cc3f575a8ec6f
// https://dev.classmethod.jp/articles/create-meeting-with-zoom-api/

// reference -> https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingcreate

interface MeetingOption {
  topic: string;
  password?: string;
  start_time: Date;
  end_time?: Date;
  timezone?: string;
  type?: 1 | 2 | 3 | 8;
  settings?: { [key: string]: string };
}

interface AccessInfo {
  clientId: string;
  accountId: string;
  zoomId: string;
  clientSecret: string;
}

interface MeetingSendingParam {
  topic: string;
  password: string;
  start_time: string;
  duration?: number;
  timezone?: string;
  type?: 1 | 2 | 3 | 8;
  settings: { [key: string]: string };
}

interface MeetingObj {
  start_url: string;
  joint_url: string;
  registration_url?: string;
  id: number;
  password: string;
  start_time: string;
  timezone: string;
}

const makeMeetingSendingParam = (opt: MeetingOption): MeetingSendingParam => {
  const defaultConfig = {
    topic: "Weekly Meeting",
    type: 2,
    start_time: "2021-03-04T18:30:00",
    timezone: "Asia/Tokyo",
    settings: {
      use_pmi: "false",
    },
  } as const;
  const duration = opt.end_time
    ? deltaMinute(opt.start_time, opt.end_time)
    : undefined;
  const start_time = formatDate(opt.start_time);
  const { start_time: _1, end_time: _2, ...option } = opt;
  const password = opt.password || makePassword(6, { number: true });
  const res = { ...defaultConfig, ...option, start_time, password };
  return duration ? { ...res, duration } : res;
};

/**
 * @param {string} topic
 * @param {Date} start_time
 * @param {Omit<MeetingOption,"topic"|"start_time">} opt
 * @return {MeetingObj}
 */
const makeMeeting = async (
  accessInfo: AccessInfo,
  opt: MeetingOption,
) => {
  const token = await getAccessToken(
    accessInfo.clientId,
    accessInfo.clientSecret,
    accessInfo.accountId,
  );
  const url = `https://api.zoom.us/v2/users/${accessInfo.zoomId}/meetings`;
  const payload = makeMeetingSendingParam(opt);
  const options = {
    method: "post",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  } as const satisfies RequestInit;
  return await fetchJson<MeetingObj>(url, options);
};

export { makeMeeting };
// eslint-disable-next-line no-undef
export type { AccessInfo, MeetingOption };
