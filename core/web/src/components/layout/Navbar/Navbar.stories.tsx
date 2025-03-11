import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'ui/layout/Navbar',
  component: Navbar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    logoUrl: '/images/logo.svg',
    avatarImageUrl: 'https://i.pravatar.cc/50',
    userName: 'David Oliveros',
    userEmail: 'dato.oliveros@gmail.com',
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
    dropdownMenu: [
      {
        title: 'Settings',
        path: '/user/settings',
        onClick: action('Clicked Settings'),
      },
      {
        title: '',
        path: '',
        divider: true,
      },
      {
        title: 'Log Out',
        path: '/logout',
        onClick: action('Clicked Log Out'),
      },
    ],
  },
};

export const WithLogoLabel: Story = {
  args: {
    ...Default.args,
    logoUrl: 'https://flowbite.com/images/logo.svg',
    logoLabel: 'WhiteRoom',
  },
};
