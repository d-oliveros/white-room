import { branch } from 'baobab-react/higher-order';

const whitelist = [
  'fetchData',
  'getPageMetadata'
];

/**
 * Decorator that wraps the component in  baobab-react's branch,
 * and passes whitelisted static method to the branched component.
 *
 * @type  {Decorator}
 *
 * @param  {Object} cursors Baobab cursors to bind in the branched component
 *
 * @return {Function}       Decorator with whitelisted static methods
 *
 * @see  https://github.com/Yomguithereal/baobab-react
 */

const wrappedBranchDecorator = (cursors) => (Component) => {
  const branched = branch(cursors, Component);

  for (const propertyName of whitelist) {
    branched[propertyName] = Component[propertyName];
  }

  return branched;
};

export default wrappedBranchDecorator;
