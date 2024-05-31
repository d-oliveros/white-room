import React from 'react';

import NavigationButton from './NavigationButton';

export default {
  title: 'NavigationButton',
  component: NavigationButton,
};

const Template = (args) => <NavigationButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: '#565656',
  iconUrl: '/images/house-icon-white.svg',
  to: 'https://google.com',
  title: 'Some Title',
  subtitle: 'Some Subtitle',
};
