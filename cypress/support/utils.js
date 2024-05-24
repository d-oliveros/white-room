import moment from 'moment';
import faker from 'faker';

export function generateRandomFirstName() {
  return faker.fake('{{name.firstName}}');
}

export function generateRandomLastName() {
  return faker.fake('{{name.lastName}}');
}

export function generateRandomName() {
  return [
    generateRandomFirstName(),
    generateRandomLastName(),
  ].join(' ');
}

export function generateRandomEmail() {
  return faker.internet.email();
}

export function generateRandomMoveInDate() {
  return faker.date.between(
    moment().add(15, 'days').toDate(),
    moment().add(2, 'months').toDate()
  );
}

export function generateRandomMLSNumber() {
  return Math.floor(
    Math.random() * 90000 + 10000
  ).toString();
}

export function generateRandomTotalManagedDoors() {
  return Math.floor(
    Math.random() * 4000 + 1000
  ).toString();
}

export function generateRandomCompanyName() {
  return `${generateRandomFirstName()} Management Company`;
}
