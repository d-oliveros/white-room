import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';

const LinkUrlButton = ({
  buttonText = 'Copy Link',
  href,
  className,
}) => {
  const [clickedMessageActive, setClickedMessageActive] = useState(false);

  const handleClick = () => {
    copyToClipboard(href);
    setClickedMessageActive(true);
    setTimeout(() => {
      setClickedMessageActive(false);
    }, 2000);
  };

  return (
    <span
      className={classnames('LinkUrlButtonContainer', className, { clickedMessageActive })}
      onClick={handleClick}
    >
      <span className='link'>{href.slice()}</span>
      <div className='linkUrlButton'>{clickedMessageActive ? 'Copied!' : buttonText}</div>
    </span>
  );
};

LinkUrlButton.propTypes = {
  buttonText: PropTypes.string,
  href: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LinkUrlButton;
