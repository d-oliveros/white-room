import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import lodashTimes from 'lodash/fp/times.js';

import ImagePreloader from '#client/components/ImagePreloader/ImagePreloader.jsx';

const StarRating = ({ rate, disabled, narrow, onChange }) => (
  <div className={classnames('StarRating', { narrow })}>
    {lodashTimes((i) => (
      <div key={`star-${i}`} className='starContainer'>
        <div
          className={classnames('star', {
            isActive: i < rate,
            isClickable: Boolean(onChange),
            disabled,
          })}
          data-rate={i + 1}
          onClick={() => onChange && onChange(i + 1)}
        />
      </div>
    ), 5)}

    <ImagePreloader imageUrls={['/images/star-large-yellow-v2.svg']} />
  </div>
);

StarRating.propTypes = {
  rate: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  narrow: PropTypes.bool,
  onChange: PropTypes.func,
};

export default StarRating;
