import type { Meta, StoryObj } from '@storybook/react';
import Carousel from './Carousel';

const meta: Meta<typeof Carousel> = {
  title: 'ui/components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: {
    imageUrls: [
      'https://flowbite.com/docs/images/carousel/carousel-1.svg',
      'https://flowbite.com/docs/images/carousel/carousel-2.svg',
      'https://flowbite.com/docs/images/carousel/carousel-3.svg',
      'https://flowbite.com/docs/images/carousel/carousel-4.svg',
      'https://flowbite.com/docs/images/carousel/carousel-5.svg',
    ],
  },
};
