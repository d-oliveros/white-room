import PropTypes from 'prop-types';
import { Avatar as FlowbiteAvatar } from 'flowbite-react';

const Avatar = ({ img, alt, rounded = true }) => {
  return (
    <FlowbiteAvatar img={img} alt={alt} rounded={rounded} />
  );
};

Avatar.propTypes = {
  img: PropTypes.string,
  alt: PropTypes.string,
  rounded: PropTypes.bool,
};

export default Avatar;
