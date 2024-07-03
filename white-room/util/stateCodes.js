const stateCodeToStateNameMapping = {
  TX: 'Texas',
  AZ: 'Arizona',
  AL: 'Alabama',
  AK: 'Alaska',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const stateNameToStateCodeMapping = Object.keys(stateCodeToStateNameMapping).reduce((memo, stateCode) => ({
  ...memo,
  [stateCodeToStateNameMapping[stateCode].toLowerCase()]: stateCode,
}), {});

const stateCodesToLowercase = Object.keys(stateCodeToStateNameMapping)
  .map((stateCode) => stateCode.toLowerCase());

export const stateOptionItems = Object.keys(stateCodeToStateNameMapping).map((stateCode) => ({
  label: stateCodeToStateNameMapping[stateCode],
  value: stateCode,
}));

export function convertStateCodeToStateName(stateCode) {
  if (typeof stateCode !== 'string') {
    return '';
  }
  return stateCodeToStateNameMapping[stateCode.toUpperCase()] || '';
}

export function convertStateNameToStateCode(stateName) {
  if (typeof stateName !== 'string') {
    return '';
  }
  return stateNameToStateCodeMapping[stateName.toLowerCase()] || '';
}

export function normalizeStatusCode(stateCode) {
  if (typeof stateCode !== 'string') {
    return '';
  }
  if (stateCodesToLowercase.includes(stateCode.toLowerCase())) {
    return stateCode.toUpperCase();
  }
  return '';
}
