import typeCheck from '#common/util/typeCheck.js';
import { sendVerificationCode } from '#server/lib/authyClient.js';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from '#api/actionTypes.js';

export default {
  type: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  validate({ phone }) {
    typeCheck('phone::Phone', phone);
  },
  async handler({ payload: { phone } }) {
    await sendVerificationCode({
      phone: phone,
    });
  },
};
