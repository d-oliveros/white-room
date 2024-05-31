import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Emoji = ({ emoji, big, className }) => {
  return (
    <span
      role='img'
      className={classnames(
        'Emoji',
        big && 'big',
        className
      )}
    >
      {emoji}
    </span>
  );
};

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
  big: PropTypes.bool,
};

export default Emoji;
