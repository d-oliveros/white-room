import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Box from 'client/components/Box/Box';
import Text from 'client/components/Text/Text';
import Icon from 'client/components/Icon/Icon';
import Flex from 'client/components/Flex/Flex';

import './CollapsibleOption.less';

const CollapsibleOption = ({
  title,
  label,
  icon,
  children,
  isActive,
  initialCollapsedState,
  changeBackground }) => {

  const [isCollapsed, setIsCollapsed] = useState(typeof initialCollapsedState === 'boolean'
    ? initialCollapsedState
    : true
  );

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      backgroundColor={changeBackground && isActive ? 'rgba(0, 122, 255, 0.1)' : '#F6F6F6'}
      styleName={classNames('optionContainer')}
    >
      <Flex
        align='center'
        width='100%'
        onClick={toggleCollapse}
        cursor='pointer'
      >
        <Box
          styleName={classNames('iconContainer', { isActive })}
        >
          <Icon className={`${icon}${isActive ? '-active' : ''}`} />
        </Box>
        <Box>
          <Text
            weight='800'
            color={isActive ? null : 'greyMonochrome'}
            size='16'
            display='block'
          >
            {title}
          </Text>
          <Text
            weight='500'
            color={isActive ? null : 'greyMonochrome'}
            size='13'
            lineHeight='18.45px'
            width='100%'
          >
            {label}
          </Text>
        </Box>
        <Icon
          className={isCollapsed ? 'caret-down' : 'caret-up'}
          styleName={classNames('arrow-dropdown')}
        />
      </Flex>
      {!isCollapsed && (
        <>
          <Box
            margin='32px 0'
          >
            {children}
          </Box>
        </>
      )}
    </Box>
  );
};

CollapsibleOption.propTypes = {
  icon: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string,
  changeBackground: PropTypes.bool,
  initialCollapsedState: PropTypes.bool,
  isActive: PropTypes.bool,
  children: PropTypes.node,
};

export default CollapsibleOption;
