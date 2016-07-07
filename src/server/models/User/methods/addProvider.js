import { isObject } from 'lodash';

export default async function addProvider(provider) {
  if (!isObject(provider)) {
    provider = { id: null, name: provider };
  }

  this.providers = this.providers || [];
  this.providers.push(provider);

  await this.save();

  return this;
}
