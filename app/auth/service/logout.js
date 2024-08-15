import * as cookiesConfig from '#white-room/config/cookies.js';

export default {
  async handler({ setCookie }) {
    setCookie(
      cookiesConfig.session.name,
      null,
      cookiesConfig.session.settings
    );
  },
};
