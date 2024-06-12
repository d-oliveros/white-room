import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Box from '#client/components/Box/Box.jsx';
import ModalV2, {
  MODAL_THEME_FIXED_FOOTER_BUTTON,
} from '#client/components/ModalV2/ModalV2.jsx';
import {
  BUTTON_THEME_ADOBE_GREY,
} from '#client/components/Button/Button.jsx';

import './InfoTile.less';

export const INFO_TILE_THEME_ADMIN_GREY = 'INFO_TILE_THEME_ADMIN_GREY';
export const INFO_TILE_THEME_ADMIN_LOGO = 'INFO_TILE_THEME_ADMIN_LOGO';
const INFO_TILE_THEME_TO_CLASSNAME_MAPPING = {
  [INFO_TILE_THEME_ADMIN_GREY]: 'theme-admin-grey',
  [INFO_TILE_THEME_ADMIN_LOGO]: 'theme-admin-logo',
};
const INFO_TILE_THEMES = Object.keys(INFO_TILE_THEME_TO_CLASSNAME_MAPPING);

export const InfoTileTextValue = ({
  children,
  color,
  cursor,
  theme,
}) => (
  <div
    className='InfoTileTextValue' // for cypress tests
    styleName={classnames(
      'value',
      INFO_TILE_THEME_TO_CLASSNAME_MAPPING[theme],
    )}
    style={{
      cursor,
      color,
    }}
  >
    {children}
  </div>
);

const InfoTile = ({
  label,
  value,
  valueColor = '#132630',
  photoUrls,
  editButtonLabel = 'Edit',
  onEditClick,
  theme,
  className,
}) => {
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const withPhotos = photoUrls && photoUrls.length > 0;

  const togglePhotosModal = () => {
    setShowPhotosModal(!showPhotosModal);
  };

  return (
    <div
      className={className}
      styleName={classnames(
        'InfoTile',
        INFO_TILE_THEME_TO_CLASSNAME_MAPPING[theme],
        { withPhotos }
      )}
    >
      <div>
        <div styleName='topContainer'>
          <div styleName='label'>
            {label}
          </div>
          {editButtonLabel && onEditClick &&
            <div styleName='editButton' onClick={onEditClick}>
              {editButtonLabel}
            </div>
          }
        </div>
        <InfoTileTextValue
          color={valueColor}
          theme={theme}
        >
          {value}
        </InfoTileTextValue>
      </div>

      {withPhotos && (
        <div styleName='photoContainer' onClick={togglePhotosModal}>
          <img
            alt={label}
            src={photoUrls[0]}
            styleName='photo'
          />
        </div>
      )}

      {showPhotosModal && (
        <ModalV2
          theme={MODAL_THEME_FIXED_FOOTER_BUTTON}
          onClose={togglePhotosModal}
          buttonTheme={BUTTON_THEME_ADOBE_GREY}
          showCloseButton
          overflow='auto'
        >
          <Box paddingBottom='80px'>
            {photoUrls.map((photo) => (
              <img
                key={photo}
                alt='unit'
                src={photo}
                width='100%'
                height='auto'
              />
            ))}
          </Box>
        </ModalV2>
      )}
    </div>
  );
};

InfoTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  theme: PropTypes.oneOf(INFO_TILE_THEMES),
  valueColor: PropTypes.string,
  editButtonLabel: PropTypes.string,
  onEditClick: PropTypes.func,
  className: PropTypes.string,
  photoUrls: PropTypes.array,
};

export default InfoTile;
