import React from 'react';
import PropTypes from 'prop-types';

import Text from '#base/view/components/Text/Text.jsx';
import useFromNowTimer from '#white-room/client/hooks/useFromNowTimer.js';

const TimerWarning = ({
  fromDate,
  tresholdSeconds,
  message,
}) => {
  const fromNowTimer = useFromNowTimer({ fromDate });
  const color = tresholdSeconds && fromNowTimer.secondsTotal >= tresholdSeconds
    ? 'orange300'
    : 'blueGreycliff';

  return (
    <Text
      color={color}
      font='greycliff'
      weight='800'
      fontSize='16px'
      lineHeight='25px'
    >
      {`${message} ${fromNowTimer.timeFormatted}`}
    </Text>
  );
};

TimerWarning.propTypes = {
  fromDate: PropTypes.string,
  message: PropTypes.string,
  tresholdSeconds: PropTypes.number,
};

export default TimerWarning;
