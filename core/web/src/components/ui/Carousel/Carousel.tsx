import { Carousel as FlowbiteCarousel } from 'flowbite-react';

interface CarouselProps {
  imageUrls: string[];
}

export const Carousel = ({ imageUrls }: CarouselProps) => {
  return (
    <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
      <FlowbiteCarousel>
        {(imageUrls || []).map((imageUrl) => (
          <img key={imageUrl} src={imageUrl} alt={imageUrl} />
        ))}
      </FlowbiteCarousel>
    </div>
  );
};

export default Carousel;
