import { withLastLocation } from 'react-router-last-location';
import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

export default function withLastLocationDecorator(ComponentToDecorate) {
  const DecoratedComponent = withLastLocation(ComponentToDecorate);

  configureDecoratedComponent({
    DecoratedComponent: DecoratedComponent,
    OriginalComponent: ComponentToDecorate,
  });

  return DecoratedComponent;
}
