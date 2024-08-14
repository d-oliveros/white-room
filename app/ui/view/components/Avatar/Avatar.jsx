import PropTypes from 'prop-types';
import { Avatar as FlowbiteAvatar } from 'flowbite-react';

const Avatar = ({ imageSrc, imageAlt, rounded = true }) => {
  return (
    <FlowbiteAvatar img={imageSrc} alt={imageAlt} rounded={rounded} />
  );
};

Avatar.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  imageAlt: PropTypes.string,
  rounded: PropTypes.bool,
};

export default Avatar;
