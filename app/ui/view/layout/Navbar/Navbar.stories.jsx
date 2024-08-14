import { action } from '@storybook/addon-actions';
import Navbar from './Navbar.jsx';

export default {
  title: 'ui/layout/Navbar',
  component: Navbar,
};

export const Default = {
  args: {
    logoUrl: 'https://flowbite.com/images/logo.svg',
    logoLabel: 'WhiteRoom',
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
