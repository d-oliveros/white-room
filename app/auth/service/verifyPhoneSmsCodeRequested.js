import typeCheck from '#whiteroom/util/typeCheck.js';
import { sendVerificationCode } from '#whiteroom/server/lib/authyClient.js';

export default {
  validate({ phone }) {
    typeCheck('phone::Phone', phone);
  },
  async handler({ payload: { phone } }) {
    await sendVerificationCode({
      phone: phone,
    });
  },
};
