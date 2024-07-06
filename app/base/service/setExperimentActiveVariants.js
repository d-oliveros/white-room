import * as cookiesConfig from '#white-room/config/cookies.js';
import typeCheck from '#white-room/util/typeCheck.js';
import User from '#user/model/userRepository.js';

export default {
  validate({ experimentActiveVariants }) {
    typeCheck('experimentActiveVariants::Object', experimentActiveVariants);
  },
  async handler({ session, setCookie, payload: { experimentActiveVariants } }) {
    if (session && session.userId) {
      await User
        .update({ experimentActiveVariants })
        .where({ id: session.userId });
    }
    setCookie(
      cookiesConfig.experimentActiveVariants.name,
      experimentActiveVariants,
      cookiesConfig.experimentActiveVariants.settings,
    );
    return {
      experimentActiveVariants,
    };
  },
};
