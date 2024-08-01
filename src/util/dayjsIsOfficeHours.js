import typeCheck from '#white-room/util/typeCheck.js';
import dayjsWithDefaultTimezone from '#white-room/util/dayjsWithDefaultTimezone.js';

export default function dayjsIsOfficeHours(dayjsInstance) {
  typeCheck('dayjsInstance::Dayjs', dayjsInstance);
  const dayHour = dayjsWithDefaultTimezone(dayjsInstance).hours();
  return dayHour >= 8 && dayHour < 21;
}
