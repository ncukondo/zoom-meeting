///  <reference types="npm:@types/google-apps-script@1.0.56" />

/* eslint-disable camelcase */
import { AccessInfo, makeMeeting as doMakeMeeting } from "./make-meeting.ts";
// eslint-disable-next-line no-unused-vars
import type { MeetingOption } from "./make-meeting.ts";

/**
 * @typedef {{
 *   topic: string;
 *   password?: string;
 *   start_time: Date;
 *   end_time?: Date;
 *   timezone?: string;
 *   type?: 1|2|3|8;
 *   setting?: {[key:string]:string};
 * }} MeetingOption
 */

/**
 * @typedef {{
 * clientId: string;
 *  accountId: string;
 *  zoomId: string;
 *  clientSecret: string;
 * }} AccessInfo
 */

/**
 * @typedef {{
 *   start_url: string;
 *   join_url: string;
 *   registration_url?: string;
 *   id: number;
 *   password: string;
 *   start_time: string;
 *   timezone: string;
 * }} MeetingObj
 */

/**
 * @param {string} topic
 * @param {Date} start_time
 * @param {Omit<MeetingOption,"topic"|"start_time">} opt
 * @return {Promise<MeetingObj>}
 */
export async function makeMeeting(
  topic: string,
  start_time: Date,
  accessInfo: AccessInfo,
  opt: Omit<MeetingOption, "topic" | "start_time">,
) {
  return await doMakeMeeting(accessInfo, {
    ...opt,
    topic,
    start_time,
  });
}
/*
import * as env from "https://deno.land/std@0.178.0/dotenv/mod.ts";
const test = async () => {
  const vars = await env.load();
  const accessInfo: AccessInfo = {
    accountId: vars.ZOOM_ACCOUNT_ID as string,
    clientId: vars.ZOOM_CLIENT_ID,
    zoomId: vars.ZOOM_ID,
    clientSecret: vars.ZOOM_CLIENT_SECRET,
  };
  console.log(
    await makeMeeting("test meeting", new Date(2021, 9, 1, 20), accessInfo, {
      end_time: new Date(2021, 9, 1, 21),
    }),
  );
};

if (import.meta.main) {
  test();
}
*/
