import moment from 'moment';
import { faker } from '@faker-js/faker';

export function generateRandomFirstName() {
  return faker.person.firstName();
}

export function generateRandomLastName() {
  return faker.person.lastName();
}

export function generateRandomName() {
  return faker.person.fullName();
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
