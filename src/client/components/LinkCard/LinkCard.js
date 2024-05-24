import React from 'react';
import PropTypes from 'prop-types';

import Text from 'client/components/Text/Text';
import Flex from 'client/components/Flex/Flex';
import Link from 'client/components/Link/Link';

const LinkCard = ({
  title,
  label,
  linkLabel,
  linkTo,
  backgroundImageUrl,
}) => (
  <div
    className='LinkCard'
    style={!backgroundImageUrl ? null : {
      backgroundImage: `url(${backgroundImageUrl})`,
    }}
  >
    <Link to={linkTo}>
      <div className='cardContents cardLink'>
        <div>
          <Text weight='bold' color='white' font='whitney-sc'>
            {title}
          </Text>
        </div>
        <Flex justify='between'>
          <Text color='white' weight='medium'>
            {label}
          </Text>
          <Text className='linkLabel' color='white' weight='medium'>
            {linkLabel}
          </Text>
        </Flex>
      </div>
    </Link>
  </div>
);

LinkCard.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  backgroundImageUrl: PropTypes.string,
  linkLabel: PropTypes.string,
  linkTo: PropTypes.string,
};

LinkCard.defaultProps = {
  linkLabel: 'View',
};

export default LinkCard;
