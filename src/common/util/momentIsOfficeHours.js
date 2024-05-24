import typeCheck from 'common/util/typeCheck';
import momentWithAustinTimezone from 'common/util/momentWithAustinTimezone';

export default function momentIsOfficeHours(momentInstance) {
  typeCheck('momentInstance::Moment', momentInstance);
  const dayHour = momentWithAustinTimezone(momentInstance).hours();
  return dayHour >= 8 && dayHour < 21;
}
