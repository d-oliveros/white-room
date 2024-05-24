import { API_ACTION_EXPERIMENT_ACTIVE_VARIANTS_UPDATE } from 'api/actionTypes';

import typeCheck from 'common/util/typeCheck';
import User from 'server/models/User';

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
      __config.cookies.experimentActiveVariants.name,
      experimentActiveVariants,
      __config.cookies.experimentActiveVariants.settings,
    );
    return {
      experimentActiveVariants,
    };
  },
};
