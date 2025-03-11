import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'ui/components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    img: 'https://i.pravatar.cc/50',
    alt: 'Image Alt',
  },
};

export const Squared: Story = {
  args: {
    ...Default.args,
    rounded: false,
  },
};
