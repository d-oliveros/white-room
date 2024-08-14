import { action } from '@storybook/addon-actions';
import Footer from './Footer.jsx';

export default {
  title: 'ui/layout/Footer',
  component: Footer,
};

export const Default = {
  args: {
    logoUrl: 'https://flowbite.com/images/logo.svg',
    logoLabel: 'WhiteRoom',
  },
};

export const WithMenu = {
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
