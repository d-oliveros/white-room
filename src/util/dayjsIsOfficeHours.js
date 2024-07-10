import typeCheck from '#white-room/util/typeCheck.js';
import dayjsWithAustinTimezone from '#white-room/util/dayjsWithAustinTimezone.js';

export default function dayjsIsOfficeHours(dayjsInstance) {
  typeCheck('dayjsInstance::Dayjs', dayjsInstance);
  const dayHour = dayjsWithAustinTimezone(dayjsInstance).hours();
  return dayHour >= 8 && dayHour < 21;
}
