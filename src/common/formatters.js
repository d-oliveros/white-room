import dayjs from 'dayjs';
import pluralize from 'pluralize';
import typeCheck from '#common/util/typeCheck.js';
import capitalize from '#common/util/capitalize.js';
import dayjsWithAustinTimezone from '#common/util/dayjsWithAustinTimezone.js';

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

export function numberWithCommas(number) {
  if (!number) {
    return '0';
  }

  return `${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function numberFixedTwoDecimals(number) {
  if (!number) {
    return 0;
  }
  // If the number is an integer or string return it.
  if (Number.isInteger(number) || typeof number === 'string') {
    return number;
  }

  const numberFloatString = number.toString();
  const numberFixedDecimals = numberFloatString.slice(0, (numberFloatString.indexOf('.')) + 3);

  return numberFixedDecimals;
}

export function formatPriceCompact(price) {
  if (price < 1000) {
    return `$${price}`;
  }

  const decimals = parseInt(price / 1000, 10);
  const cents = parseInt((price % 1000) / 100, 10);

  return `$${decimals}.${cents}k`;
}

export function formatWithTwoDecimals(price) {
  let priceString = String(price);
  if (priceString.includes('.')) {
    const priceStringParts = priceString.split('.');
    if (priceStringParts[priceStringParts.length - 1].length === 1) {
      priceString = `${priceString}0`;
    }
  }
  return priceString;
}

export function formatPrice(price) {
  if (typeof price !== 'string' && typeof price !== 'number') {
    return '$0';
  }

  // Support price values that were already formatted.
  if (typeof price === 'string') {
    price = price.replace(/[^.\d]/g, '');
    if (isNaN(price)) {
      return '$0';
    }
  }

  price = roundTwoDecimals(parseFloat(price));
  return `$${formatWithTwoDecimals(numberWithCommas(price))}`;
}

export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length !== 10) {
    return '';
  }
  const matchedPhoneNumber = `${phoneNumber}`.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (!matchedPhoneNumber) {
    return '';
  }
  return `(${matchedPhoneNumber[1]}) ${matchedPhoneNumber[2]}-${matchedPhoneNumber[3]}`;
}

export function formatPriceRange({ minRentPrice, maxRentPrice }) {
  return `$${numberWithCommas(minRentPrice)}-${numberWithCommas(maxRentPrice)}`;
}

export function roundTwoDecimals(number) {
  return Math.round(number * 100) / 100;
}

export function getFormattedFromNowDate({ date, compact }) {
  const pastDate = dayjsWithAustinTimezone(date);
  const nowDate = dayjsWithAustinTimezone();
  const dateDifference = Math.floor((nowDate.unix() - pastDate.unix()) / ONE_DAY_IN_SECONDS);

  if (dateDifference === 0) {
    const hourDifference = nowDate.diff(pastDate, 'hours');
    if (hourDifference === 0) {
      const minuteDifference = nowDate.diff(pastDate, 'minutes');
      if (minuteDifference === 0) {
        return compact ? 'now' : 'just now!';
      }
      return compact ? `${minuteDifference}m` : `${minuteDifference} min`;
    }
    return compact ? `${hourDifference}h` : `${hourDifference} hr`;
  }
  if (dateDifference === 1) {
    return compact ? '1d' : 'Yesterday';
  }
  return compact ? `${dateDifference}d` : dayjsWithAustinTimezone(date).format('MMMM Do');
}

export function getDateRangeDuration({ fromDate, toDate }) {
  const fromMoment = dayjsWithAustinTimezone(fromDate);
  const toMoment = dayjsWithAustinTimezone(toDate);
  const diffInYears = toMoment.diff(fromMoment, 'years');
  if (diffInYears >= 1) {
    const diffInMonths = toMoment.diff(fromMoment, 'months') % 12;
    let dateString = pluralize('year', diffInYears, true);
    if (diffInMonths > 0) {
      dateString += ` ${pluralize('month', diffInMonths, true)}`;
    }
    return dateString;
  }
  return fromMoment.from(toMoment, true);
}

export function formatAgoDate(date, options = {}) {
  const pastDate = dayjs(date);
  const nowDate = dayjs();
  const numberOfDays = Math.round((nowDate.unix() - pastDate.unix()) / ONE_DAY_IN_SECONDS);
  const useDays = options.useDays || false;

  if (numberOfDays === 0) {
    const hourDifference = nowDate.diff(pastDate, 'hours');
    if (hourDifference === 0) {
      const minuteDifference = nowDate.diff(pastDate, 'minutes');
      if (minuteDifference === 0) {
        return 'just now!';
      }
      return `${minuteDifference}m ago`;
    }
    return `${hourDifference}h ago`;
  }

  if (useDays) {
    return `${numberOfDays}d ago`;
  }

  return formatAgoDateFromNumberOfDays(numberOfDays);
}

export function formatAgoDateFromNumberOfDays(numberOfDays) {
  if (numberOfDays >= 0 && numberOfDays <= 28) {
    return `${numberOfDays}d ago`;
  }
  if (numberOfDays > 28 && numberOfDays <= 45) {
    return '1 month ago';
  }
  if (numberOfDays > 45 && numberOfDays <= 319) {
    const months = Math.round(numberOfDays / 30);
    return `${months} months ago`;
  }
  if (numberOfDays > 319 && numberOfDays <= 547) {
    return '1 year ago';
  }

  const years = Math.round(numberOfDays / 365);
  return `${years} years`;
}

export function formatPercentage(percentage, decimals = true) {
  typeCheck('percentage::Number', percentage);
  if (!decimals) {
    percentage = parseFloat(percentage.toFixed(2));
  }
  return `${roundTwoDecimals(percentage * 100)}%`;
}

export function abbreviateNumber(num, digits) {
  const SI = [
    { value: 1, symbol: '' },
    { value: 1E3, symbol: 'k' },
    { value: 1E6, symbol: 'M' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = SI.length - 1; i > 0; i--) { // eslint-disable-line no-plusplus
    if (num >= SI[i].value) {
      break;
    }
  }
  return (num / SI[i].value).toFixed(digits).replace(rx, '$1') + SI[i].symbol;
}

export function formatElapsedDisplay(fromMoment, toMoment) {
  const diff = toMoment.valueOf() - fromMoment.valueOf();
  if (diff > 1000) {
    return `${diff / 1000} seconds.`;
  }

  return `${diff} milliseconds.`;
}

export function formatName(name, style) {
  switch (style) {
    case 'shortAbbr': {
      const nameParts = name.split(' ');
      return `${capitalize(nameParts[0] || '')} ${nameParts[1]
        ? `${capitalize(nameParts[1])[0]}.`
        : ''}`.trim();
    }
    default: {
      return capitalize(name);
    }
  }
}
