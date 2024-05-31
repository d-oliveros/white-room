import {
  API_ACTION_EXPERIMENT_ACTIVE_VARIANTS_UPDATE,
} from '#api/actionTypes.js';

import * as cookiesConfig from '#config/cookies.js';
import typeCheck from '#common/util/typeCheck.js';
import User from '#server/models/User/index.js';

export default {
  type: API_ACTION_EXPERIMENT_ACTIVE_VARIANTS_UPDATE,
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
