import typeCheck from 'common/util/typeCheck';
import { sendVerificationCode } from 'server/lib/authyClient';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from 'api/actionTypes';

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
