import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import preventDefaultPropagation from '#white-room/client/helpers/preventDefaultPropagation.js';
import Box from '#base/view/components/Box/Box.jsx';
import Text from '#base/view/components/Text/Text.jsx';
import Link from '#base/view/components/Link/Link.jsx';

import './CollapsibleContainer.less';

export const COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED = 'COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED';
export const COLLAPSIBLE_CONTAINER_STATUS_COMPLETE = 'COLLAPSIBLE_CONTAINER_STATUS_COMPLETE';
export const COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS = 'COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS';
export const COLLAPSIBLE_CONTAINER_STATUS_ERROR = 'COLLAPSIBLE_CONTAINER_STATUS_ERROR';
const COLLAPSIBLE_CONTAINER_STATUS_TO_CLASSNAME_MAPPING = {
  [COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED]: 'status-not-started',
  [COLLAPSIBLE_CONTAINER_STATUS_COMPLETE]: 'status-complete',
  [COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS]: 'status-in-progress',
  [COLLAPSIBLE_CONTAINER_STATUS_ERROR]: 'status-error',
};
export const COLLAPSIBLE_CONTAINER_STATUSES = Object.keys(COLLAPSIBLE_CONTAINER_STATUS_TO_CLASSNAME_MAPPING); // eslint-disable-line max-len

export const COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED = 'COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED';
export const COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY = 'COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY'; // eslint-disable-line max-len
const COLLAPSIBLE_CONTAINER_BORDER_TYPE_TO_CLASSNAME_MAPPING = {
  [COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED]: 'border-type-rounded',
  [COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY]: 'border-type-bottom-gray',
};
export const COLLAPSIBLE_CONTAINER_BORDER_TYPES = Object.keys(COLLAPSIBLE_CONTAINER_BORDER_TYPE_TO_CLASSNAME_MAPPING); // eslint-disable-line max-len

export const COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_TEXT = 'COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_TEXT'; // eslint-disable-line max-len
export const COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_BLUE = 'COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_BLUE'; // eslint-disable-line max-len

const CollapsibleContainer = ({
  children,
  title,
  subtitle,
  titleColor = 'blueGreycliff',
  status = COLLAPSIBLE_CONTAINER_STATUS_COMPLETE,
  borderType,
  isExpanded = false,
  editLinkUrl,
  onEditClick,
  editButtonTheme = COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_TEXT,
  onClick,
  hideIcon = false,
}) => {
  return (
    <Box
      styleName={classnames(
        'CollapsibleContainer',
        COLLAPSIBLE_CONTAINER_BORDER_TYPE_TO_CLASSNAME_MAPPING[borderType],
        COLLAPSIBLE_CONTAINER_STATUS_TO_CLASSNAME_MAPPING[status],
      )}
    >
      <div
        styleName={classnames('headerContainer', onClick ? 'pointer' : null)}
        onClick={onClick}
      >
        <div>
          {
            !hideIcon && (
              <img
                src={`/images/${COLLAPSIBLE_CONTAINER_STATUS_TO_CLASSNAME_MAPPING[status]}-icon.svg`}
                alt='status icon'
                width='12px'
                height='auto'
                style={{ margin: '0 10px 0 0' }}
              />
            )
          }
          <Text
            font='greycliff'
            color={titleColor}
            weight='700'
            size='18'
            lineHeight='22px'
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              font='greycliff'
              color='blueGreycliff'
              weight='600'
              size='18'
              lineHeight='22px'
              paddingLeft='8px'
            >
              {subtitle}
            </Text>
          )}
        </div>
        {(editLinkUrl || onEditClick) && (
          <span onClick={preventDefaultPropagation}>
            {editButtonTheme === COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_TEXT
              ? (
                <Link
                  to={editLinkUrl}
                  onClick={onEditClick}
                  font='greycliff'
                  color='grey'
                  weight='600'
                  size='12'
                  lineHeight='14px'
                  cursor='pointer'
                >
                  Edit
                </Link>
              )
              : (
                <Link
                  to={editLinkUrl}
                  onClick={onEditClick}
                >
                  <Text
                    font='greycliff'
                    color='blue300'
                    weight='700'
                    size='14'
                    lineHeight='14px'
                    cursor='pointer'
                  >
                    Edit
                  </Text>
                </Link>
              )
            }
          </span>
        )}
      </div>
      {isExpanded && (
        <Box styleName='contentContainer'>
          {children}
        </Box>
      )}
    </Box>
  );
};

CollapsibleContainer.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  titleColor: PropTypes.string,
  status: PropTypes.oneOf(COLLAPSIBLE_CONTAINER_STATUSES),
  borderType: PropTypes.oneOf(COLLAPSIBLE_CONTAINER_BORDER_TYPES),
  editLinkUrl: PropTypes.string,
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func,
  onEditClick: PropTypes.func,
  editButtonTheme: PropTypes.oneOf([
    COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_TEXT,
    COLLAPSIBLE_CONTAINER_EDIT_BUTTON_THEME_BLUE,
  ]),
  hideIcon: PropTypes.bool,
};

export default CollapsibleContainer;
