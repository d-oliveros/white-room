import PropTypes from 'prop-types';
import { Carousel as FlowbiteCarousel } from 'flowbite-react';

export function Carousel({ imageUrls }) {
  return (
    <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
      <FlowbiteCarousel>
        {(imageUrls || []).map((imageUrl) => (
          <img key={imageUrl} src={imageUrl} alt={imageUrl} />
        ))}
      </FlowbiteCarousel>
    </div>
  );
}

Carousel.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Carousel;
