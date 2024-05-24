import typeCheck from 'common/util/typeCheck';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
} from 'api/actionTypes';

import { checkVerificationCode } from 'server/lib/authyClient';
import User from 'server/models/User';

const {
  PHONE_VERIFICATION_MAGIC_CODE,
} = process.env;

export default {
  type: API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
  validate({ phone, code }) {
    typeCheck('phone::Phone', phone);
    typeCheck('code::NonEmptyString', code);
  },
  async handler({ session, payload: { phone, code } }) {
    const updateUser = async () => {
      if (session && session.userId) {
        const existingUser = await User.getById(session.userId);
        typeCheck('existingUser::NonEmptyObject', existingUser);
        await User
          .update({
            phone: phone,
            phoneVerified: true,
            phoneConfirmed: true,
          })
          .where('phone', existingUser.phone);
      }
    };

    if (code === PHONE_VERIFICATION_MAGIC_CODE) {
      await updateUser();
      return true;
    }

    const response = await checkVerificationCode({ phone, code });
    if (response && response.success) {
      await updateUser();
      return true;
    }

    return false;
  },
};
