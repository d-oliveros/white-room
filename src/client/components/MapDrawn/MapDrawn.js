import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMap from 'react-google-map';

import lodashIsEqual from 'lodash/fp/isEqual';

import withGoogleMaps from 'client/helpers/withGoogleMaps';
import { defaultPolygonOptions } from 'client/constants/mapOptions';

import ButtonDeprecated, { BUTTON_THEME_WHITE } from 'client/components/ButtonDeprecated/ButtonDeprecated';

import log from 'client/lib/log';

const debug = log.debug('components:MapDrawn');

@withGoogleMaps
class MapDrawn extends Component {
  static propTypes = {
    googleMaps: PropTypes.object.isRequired,
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    market: PropTypes.object.isRequired,
  }

  _onLoadedMap = (googleMaps, map) => {
    const {
      value,
    } = this.props;

    this.map = map;

    if (value) {
      this._createPolygon();
    }
    else {
      this._createDrawingManager();
    }
  }

  _createDrawingManager = () => {
    debug('Creating DrawingManager');

    const {
      googleMaps,
      onChange,
    } = this.props;

    this.drawingManager = new googleMaps.drawing.DrawingManager({
      drawingMode: googleMaps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: {
        ...defaultPolygonOptions,
        editable: true,
      },
    });

    googleMaps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
      debug('Polygon created');

      this.polygon = polygon;
      this.drawingManager.setDrawingMode(null);
      this._setListenersToPolygon();

      onChange(
        this.polygon.getPath().getArray().map((point) => {
          return [
            point.lng(),
            point.lat(),
          ];
        })
      );
    });

    this.drawingManager.setMap(this.map);
  }

  _createPolygon = () => {
    debug('Creating polygon');

    const {
      googleMaps,
      value,
      market,
    } = this.props;

    if (!lodashIsEqual(value, market.settings.map.area)) {
      const bounds = new googleMaps.LatLngBounds();
      value.forEach((coord) => {
        bounds.extend(new googleMaps.LatLng(coord[1], coord[0]));
      });
      this.map.setCenter(bounds.getCenter());
      this.map.setZoom(market.settings.map.zoomLevel + 1);
    }

    this.polygon = new googleMaps.Polygon({
      paths: value.map((coord) => ({
        lng: coord[0],
        lat: coord[1],
      })),
      ...defaultPolygonOptions,
      editable: true,
    });

    this.polygon.setMap(this.map);
    this._setListenersToPolygon();
  }

  _onRemovePolygon = () => {
    debug('Removing polygon');

    const {
      onChange,
      googleMaps,
    } = this.props;

    onChange(null);

    this.polygon.setMap();

    if (!this.drawingManager) {
      this._createDrawingManager();
    }
    else {
      this.drawingManager.setDrawingMode(googleMaps.drawing.OverlayType.POLYGON);
    }
  }

  _setListenersToPolygon = () => {
    debug('Setting listeners to polygon');

    const {
      googleMaps,
    } = this.props;

    googleMaps.event.addListener(this.polygon.getPath(), 'set_at', this._onPolygonChange);
    googleMaps.event.addListener(this.polygon.getPath(), 'remove_at', this._onPolygonChange);
    googleMaps.event.addListener(this.polygon.getPath(), 'insert_at', this._onPolygonChange);
  }

  _onPolygonChange = () => {
    debug('Updating polygon coords');

    const {
      onChange,
    } = this.props;

    onChange(
      this.polygon.getPath().getArray().map((point) => {
        return [
          point.lng(),
          point.lat(),
        ];
      })
    );
  }

  resetCoords = () => {
    const {
      onChange,
      market,
    } = this.props;

    this.polygon.setMap(null);
    this.polygon.setPaths(
      market.settings.map.area.map((coord) => ({
        lng: coord[0],
        lat: coord[1],
      }))
    );

    this.polygon.setMap(this.map);
    this._setListenersToPolygon();
    onChange(market.settings.map.area);
  }

  render() {
    const {
      googleMaps,
      value,
      market,
    } = this.props;

    const showResetDots = !lodashIsEqual(value, market.settings.map.area);

    return (
      <div
        className='mapContainer'
      >
        <div
          className='innerMapContainer'
        >
          <GoogleMap
            googleMaps={googleMaps}
            center={{
              lat: market.settings.map.center[1],
              lng: market.settings.map.center[0],
            }}
            zoom={market.settings.map.zoomLevel}
            disableDefaultUI
            gestureHandling='greedy'
            onLoaded={this._onLoadedMap}
          />

          {showResetDots && (
            <ButtonDeprecated
              theme={BUTTON_THEME_WHITE}
              onClick={this.resetCoords}
              className='floatingAlert clear'
            >
              reset the dots
            </ButtonDeprecated>
          )}

          {/*
            <div
              className={value ? 'clear' : ''}
              onClick={value ? this._onRemovePolygon : undefined}
            />
          */}
        </div>
      </div>
    );
  }
}

export default MapDrawn;
