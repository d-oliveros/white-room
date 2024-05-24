import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapLoader from 'react-google-maps-loader';
import branch from 'client/core/branch';

import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

export default function withGoogleMapsDecorator(ComponentToDecorate) {
  @branch({
    googleApiKey: ['env', 'GOOGLE_API_KEY'],
  })
  class GoogleMapsLoaderDecorator extends Component {
    static propTypes = {
      googleApiKey: PropTypes.string.isRequired,
    }

    render() {
      const { googleApiKey } = this.props;
      return (
        <GoogleMapLoader
          params={{
            key: googleApiKey,
            libraries: 'places,geometry,drawing',
          }}
          render={(googleMaps) => {
            if (googleMaps) {
              if (!global.google || !global.google.maps) {
                global.google = global.google || {};
                global.google.maps = googleMaps;
              }
              return (
                <ComponentToDecorate googleMaps={googleMaps} {...this.props} />
              );
            }

            return null;
          }}
        />
      );
    }
  }

  configureDecoratedComponent({
    DecoratedComponent: GoogleMapsLoaderDecorator,
    OriginalComponent: ComponentToDecorate,
  });

  return GoogleMapsLoaderDecorator;
}
