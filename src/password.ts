// https://qiita.com/kudota/items/b480610cc3f575a8ec6f
// https://dev.classmethod.jp/articles/create-meeting-with-zoom-api/
// reference -> https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingcreate
interface PasswordOption {
  number?: boolean;
  letter?: boolean;
  upperCase?: boolean;
  symbol?: boolean;
}
const makePassword = (len: number, opt: PasswordOption | null = null) => {
  const o = opt
    ? { letter: false, upperCase: false, number: false, symbol: false, ...opt }
    : { letter: true, upperCase: true, number: true, symbol: false };
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const seed = `${o.letter ? letters : ""}${o.number ? numbers : ""}${
    o.upperCase ? letters.toUpperCase() : ""
  }${o.symbol ? symbols : ""}`;
  return [...Array(len)]
    .map(() => seed.charAt(Math.floor(Math.random() * seed.length)))
    .join("");
};

export { makePassword };
// eslint-disable-next-line no-undef
export type { PasswordOption };
