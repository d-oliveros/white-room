import React, { Component } from 'react';
import PropTypes from 'prop-types';

import isBoolean from 'common/util/isBoolean';
import {
  getCurrentWebGeolocation,
  getCurrentMobileGeolocation,
  getWebGeolocationPermission,
  setWebGeolocationPermission,
} from 'common/geolocationHelpers';
import isUserAgentMobileApp from 'common/util/isUserAgentMobileApp';

import branch from 'client/core/branch';
import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

export const GEOLOCATION_STATE_INIT = 'GEOLOCATION_STATE_INIT'; // Initial state.
export const GEOLOCATION_STATE_UNAVAILABLE = 'GEOLOCATION_STATE_UNAVAILABLE'; // No geolocation capabilities.
export const GEOLOCATION_STATE_REQUIRE_PERMISSION = 'GEOLOCATION_STATE_REQUIRE_PERMISSION'; // Require user's permission.
export const GEOLOCATION_STATE_DISABLED = 'GEOLOCATION_STATE_DISABLED'; // User not allowed the use of GPS.
export const GEOLOCATION_STATE_ENABLE = 'GEOLOCATION_STATE_ENABLE'; // Ready to get current location.

export const GEOLOCATION_ERROR_USER_DENIED_PERMISSION = 'User denied Geolocation';

export default function withGeolocation(ComponentToDecorate) {
  @branch({
    userAgent: ['analytics', 'userAgent'],
    mobileGeolocationPermission: ['mobileApp', 'geolocationPermission'],
    mobileAppFeatures: ['mobileApp', 'features'],
  })
  class WithGeolocation extends Component {
    static propTypes = {
      userAgent: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);

      this.state = {
        geolocationState: GEOLOCATION_STATE_INIT,
      };
    }

    componentDidMount() {
      this._getInitialGelocationState();
    }

    _isMobileApp = () => {
      return isUserAgentMobileApp(this.props.userAgent);
    }

    _getInitialGelocationState = () => {
      const { mobileAppFeatures } = this.props;

      if (this._isMobileApp() && mobileAppFeatures.geolocationV1) {
        const { mobileGeolocationPermission } = this.props;
        this.setState({
          geolocationState: mobileGeolocationPermission === 'denied'
            ? GEOLOCATION_STATE_REQUIRE_PERMISSION
            : mobileGeolocationPermission === 'granted'
              ? GEOLOCATION_STATE_ENABLE
              : GEOLOCATION_STATE_DISABLED,
        });
      }
      else if (global.navigator.geolocation) {
        const hasWebGeolocationPermission = getWebGeolocationPermission();
        this.setState({
          geolocationState: !isBoolean(hasWebGeolocationPermission)
            ? GEOLOCATION_STATE_REQUIRE_PERMISSION
            : hasWebGeolocationPermission
              ? GEOLOCATION_STATE_ENABLE
              : GEOLOCATION_STATE_DISABLED,
        });
      }
      else {
        this.setState({
          geolocationState: GEOLOCATION_STATE_UNAVAILABLE,
        });
      }
    }

    _getGeolocationFn = () => {
      const { mobileAppFeatures } = this.props;

      if (this._isMobileApp() && mobileAppFeatures.geolocationV1) {
        return getCurrentMobileGeolocation;
      }
      if (global.navigator.geolocation) {
        return getCurrentWebGeolocation;
      }

      return null;
    }

    _requestGeolocationPermission = () => {
      const geolocationFn = this._getGeolocationFn();

      return new Promise((resolve, reject) => {
        if (geolocationFn) {
          geolocationFn()
            .then(() => {
              setWebGeolocationPermission(true);
              this.setState({ geolocationState: GEOLOCATION_STATE_ENABLE }, resolve);
            })
            .catch((error) => {
              setWebGeolocationPermission(false);
              this.setState({ geolocationState: GEOLOCATION_STATE_DISABLED }, () => reject(error));
            });
        }
        else {
          reject(new Error('Not found geolocation handler'));
        }
      });
    };

    _getCurrentGeolocation = () => {
      const geolocationFn = this._getGeolocationFn();

      return new Promise((resolve, reject) => {
        if (geolocationFn) {
          geolocationFn().then(({ coords }) => {
            resolve({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }).catch(reject);
        }
        else {
          reject(new Error('Could not get current geolocation'));
        }
      });
    };

    render() {
      return (
        <ComponentToDecorate
          {...this.props}
          geolocationState={this.state.geolocationState}
          requestGeolocationPermission={this._requestGeolocationPermission}
          getCurrentLocation={this._getCurrentGeolocation}
        />
      );
    }
  }

  configureDecoratedComponent({
    DecoratedComponent: WithGeolocation,
    OriginalComponent: ComponentToDecorate,
  });

  return WithGeolocation;
}
