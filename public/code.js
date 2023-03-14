const config = {
  get: (key) => PropertiesService.getScriptProperties().getProperty(key),
  load: () => PropertiesService.getScriptProperties().getProperties(),
};

/* eslint-disable camelcase */
async function testmakeMeeting() {
  const info = config.load();
  const accessInfo = {
    zoomId: info.ZOOM_ID,
    clientId: info.ZOOM_CLIENT_ID,
    clientSecret: info.ZOOM_CLIENT_SECRET,
    accountId: info.ZOOM_ACCOUNT_ID,
  };
  const res = await makeMeeting(
    "test meeting",
    new Date(2021, 9, 1, 20),
    accessInfo,
    {
      end_time: new Date(2021, 9, 1, 21),
    },
  );
  console.log(res);
}
