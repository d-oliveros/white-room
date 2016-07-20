import { sample, isArray } from 'lodash';
import inspect from 'util-inspect';
import assert from 'http-assert';

const debug = __log.debug('whiteroom:modules:experiments');

/**
 * Gets a set of experiments,
 * using the passed object as the current variations.
 *
 * @param  {Object}  experiments  Current experiment variations. (optional)
 *
 * @return {Object}               Object with the new experiments set,
 *                                and a property 'changed', true if the
 *                                experiments have changed.
 */
export function getExperiments(expList, prevExperiments = {}) {
  const experiments = {};
  const experimentKeys = Object.keys(expList);
  let changed = Object.keys(prevExperiments).length !== experimentKeys.length;

  for (const expKey in expList) {
    if (!expList.hasOwnProperty(expKey)) {
      continue;
    }

    const experiment = expList[expKey];

    const validVariation = experiment.type === Boolean
      ? typeof prevExperiments[expKey] === 'boolean'
      : experiment.variations.indexOf(prevExperiments[expKey]) > -1;

    if (expKey in prevExperiments && validVariation) {
      experiments[expKey] = prevExperiments[expKey];
    } else {
      changed = true;
      experiments[expKey] = getVariation(expList, expKey);
    }
  }

  debug(`Previous experiments:\n${inspect(prevExperiments)}`);
  debug(`New experiments:\n${inspect(experiments)}`);

  return { experiments, changed };
}

export function getVariation(expList, name) {
  const experiment = expList[name];

  switch (experiment.type) {
    case Boolean:
      return sample([true, false]);

    case Array:
      const validVariations = isArray(expList[name].variations);
      assert(validVariations, 500, 'This experiment has invalid variations');
      return sample(expList[name].variations);
  }
}
