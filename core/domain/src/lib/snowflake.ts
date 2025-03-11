import Snowflakify from 'snowflakify';

const snowflakify = new Snowflakify();

export function generateSnowflakeId(): string {
  return snowflakify.nextId().toString();
}
