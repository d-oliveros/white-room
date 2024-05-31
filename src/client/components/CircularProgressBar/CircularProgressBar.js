import React from 'react';
import PropTypes from 'prop-types';
import Box from '#client/components/Box/Box.js';

import './CircularProgressBar.less';

const CircularProgressBar = ({
  width,
  strokeWidth,
  strokeColor,
  progress,
  iconUrl,
}) => {

  const radius = (width / 2) * 0.9;
  const center = width / 2;
  const viewBox = `0 0 ${width} ${width}`;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - ((strokeDasharray * progress) / 100);

  return (
    <Box
      display='flex'
      justifyContent='center'
    >
      {iconUrl && (
        <Box
          position='absolute'
          backgroundColor='white'
          width={`${width - (strokeWidth * 2)}px`}
          height={`${width - (strokeWidth * 2)}px`}
          borderRadius='50%'
          display='flex'
          justifyContent='center'
          alignItems='center'
          marginTop={`${strokeWidth}px`}
          boxShadow='0px 15px 35px 0px #FFCD002B'
        >
          <Box
            width='60%'
            height='60%'
            backgroundImage={`url(${iconUrl})`}
            backgroundSize='contain'
            backgroundRepeat='no-repeat'
            backgroundPosition='center'
          />
        </Box>
      )}
      <svg
        width={width}
        height={width}
        viewBox={viewBox}
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        styleName='progressBarSvg'
      >
        <circle
          r={radius}
          cx={center}
          cy={center}
          fill='transparent'
          stroke={strokeColor}
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
        />
        <circle
          r={radius}
          cx={center}
          cy={center}
          fill='transparent'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </Box>
  );
};

CircularProgressBar.propTypes = {
  width: PropTypes.number,
  strokeWidth: PropTypes.number,
  strokeColor: PropTypes.string,
  progress: PropTypes.number,
  iconUrl: PropTypes.string,
};

CircularProgressBar.defaultProps = {
  width: 180,
  strokeWidth: 5,
  strokeColor: 'green',
  progress: 0,
};

export default CircularProgressBar;
