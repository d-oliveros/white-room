import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withJsScript from '#white-room/client/helpers/withJsScript.jsx';
import Box from '#base/view/components/Box/Box.jsx';
import Link from '#base/view/components/Link/Link.jsx';

@withJsScript({
  scriptUrl:
    'https://unpkg.com/leaflet@1.6.0/dist/leaflet-src.js',
})
class OpenStreetMap extends Component {
  static propTypes = {
    coordinates: PropTypes.array.isRequired,
    initialZoom: PropTypes.number,
    onMapClick: PropTypes.func,
  };

  static defaultProps = {
    initialZoom: 12,
  };

  render() {
    if (!process.browser) {
      return null;
    }

    const { coordinates, initialZoom, onMapClick } = this.props;
    const lng = coordinates[0];
    const lat = coordinates[1];
    const position = [lat, lng];
    const googleStreetUrl = `http://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0`;

    const { Map, TileLayer, Marker } = require('react-leaflet');

    return (
      <div className='section map'>
        <Box
          width='100%'
          height='100%'
          minHeight='400px'
          borderRadius='8px'
          overflow='hidden'
          position='relative'
          zIndex='800'
        >
          <Map
            center={position}
            zoom={initialZoom}
            style={{
              height: '100%',
              width: '100%',
              minHeight: '400px',
            }}
            onClick={onMapClick}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={position} />
          </Map>
          <Link
            weight='bold'
            font='whitney-sc'
            color='blue300'
            cursor='pointer'
            decoration='underline'
            to={googleStreetUrl}
            target='_blank'
          >
            View on Google Street View 📍
          </Link>
        </Box>
      </div>
    );
  }
}

export default OpenStreetMap;
