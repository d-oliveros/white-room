import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Text from '#client/components/Text/Text.jsx';
import Button from '#client/components/Button/Button.jsx';

class SimpleMessage extends Component {
  static propTypes = {
    iconUrl: PropTypes.string.isRequired,
    headline: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]).isRequired,
    message: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]).isRequired,
    buttonText: PropTypes.string,
    onClickButton: PropTypes.func,
    className: PropTypes.string,
  };

  render() {
    const { iconUrl, className, headline, message, buttonText, onClickButton } = this.props;

    return (
      <div className={classnames('SimpleMessage', className)}>
        <div className='SimpleMessageIcon' style={{ backgroundImage: `url(${iconUrl})` }} />
        <Text
          size='2xl'
          weight='bold'
          display='block'
          align='center'
          leading='2xl'
          className='SimpleMessageHeadline'
        >
          {headline}
        </Text>
        <Text display='block' align='center' className='SimpleMessageMessage'>
          {message}
        </Text>
        {buttonText && (
          <Button onClick={onClickButton}>
            {buttonText}
          </Button>
        )}
      </div>
    );
  }
}

export default SimpleMessage;
