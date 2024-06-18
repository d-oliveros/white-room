import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { formatPhoneNumber } from '#common/formatters.js';

const SmsSendingIndicator = ({ phone }) => {
  const [showSmsSent, setShowSmsSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSmsSent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='stepContainer'>
      <div className='modal success'>
        {showSmsSent ? (
          <div className='contentContainer'>
            <div className='smsSent' />
            <div className='textContainer'>
              <span className='headline'>
                Sent you the code!
              </span>
            </div>
          </div>
        ) : (
          <div className='contentContainer'>
            <div className='smsSending' />
            <div className='textContainer'>
              <span className='headline'>
                Sending SMS to
                <br />
                {formatPhoneNumber(phone)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SmsSendingIndicator.propTypes = {
  phone: PropTypes.string.isRequired,
}

export default SmsSendingIndicator;
