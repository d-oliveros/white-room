import capitalizeAll from 'common/util/capitalizeAll';

export default function camelCaseToTitleCase(camelCaseString) {
  const titleCaseString = capitalizeAll(camelCaseString.replace(/([A-Z])/g, ' $1')).trim();
  return titleCaseString;
}
