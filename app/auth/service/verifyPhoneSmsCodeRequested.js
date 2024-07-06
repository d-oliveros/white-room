import typeCheck from '#white-room/util/typeCheck.js';
import { sendVerificationCode } from '#white-room/server/lib/authyClient.js';

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
