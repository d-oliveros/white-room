const originalComponentPropertiesToTransfer = [
  'fetchData',
  'getPageMetadata',
];

/**
 * Copies certain static properties from the decorator component to the decorated component.
 *
 * @param  {Object} options.DecoratedComponent Decorated component class.
 * @param  {Object} options.OriginalComponent  Original component class.
 * @return {undefined}
 */
export default function configureDecoratedComponent({
  DecoratedComponent,
  OriginalComponent,
}) {
  // Pass in whitelisted properties to decorated component.
  for (const propertyName of originalComponentPropertiesToTransfer) {
    DecoratedComponent[propertyName] = OriginalComponent[propertyName];
  }

  return DecoratedComponent;
}
