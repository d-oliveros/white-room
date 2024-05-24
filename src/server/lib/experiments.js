import lodashSample from 'lodash/fp/sample';

/**
 * Gets a set of experiments,
 * using the passed object as the current variations.
 *
 * @param  {Object} experiments Current experiment variations. (optional)
 *
 * @return {Object} Object with the new experiments set, and a property 'changed',
 *                  true if the experiments have changed.
 */
export function getExperimentActiveVariants(params) {
  const {
    experimentsConfig,
    isCrawler,
  } = params;

  const prevExperimentActiveVariants = params.prevExperimentActiveVariants || {};

  const experimentActiveVariants = {};
  const experimentKeys = Object.keys(experimentsConfig);

  let changed = Object.keys(prevExperimentActiveVariants).length !== experimentKeys.length;

  Object.keys(experimentsConfig).forEach((experimentName) => {
    const experimentVariants = experimentsConfig[experimentName];
    const prevExperimentActiveVariant = prevExperimentActiveVariants[experimentName];

    const variationShouldChanged = !experimentVariants.includes(prevExperimentActiveVariant);

    if (variationShouldChanged) {
      experimentActiveVariants[experimentName] = isCrawler
        ? experimentVariants[0]
        : lodashSample(experimentVariants);
      changed = true;
    }
    else {
      experimentActiveVariants[experimentName] = prevExperimentActiveVariants[experimentName];
    }
  });

  return { experimentActiveVariants, changed };
}
