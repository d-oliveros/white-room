import typeCheck from '#common/util/typeCheck.js';
import dayjsWithAustinTimezone from '#common/util/dayjsWithAustinTimezone.js';

export default function dayjsIsOfficeHours(dayjsInstance) {
  typeCheck('dayjsInstance::Dayjs', dayjsInstance);
  const dayHour = dayjsWithAustinTimezone(dayjsInstance).hours();
  return dayHour >= 8 && dayHour < 21;
}
