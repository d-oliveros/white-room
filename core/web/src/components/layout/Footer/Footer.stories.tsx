import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Footer from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'ui/layout/Footer',
  component: Footer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    logoUrl: '/images/logo.svg',
  },
};

export const WithLogoLabel: Story = {
  args: {
    logoUrl: 'https://flowbite.com/images/logo.svg',
    logoLabel: 'WhiteRoom',
  },
};

export const WithMenu: Story = {
  args: {
    ...Default.args,
    menu: [
      {
        title: 'Home',
        path: '/',
        onClick: action('Clicked Home'),
      },
      {
        title: 'Sandbox',
        path: '/sandbox',
        onClick: action('Clicked Sandbox'),
      },
    ],
  },
};
