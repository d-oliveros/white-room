import React from 'react';

import Link from './Link';

export default {
  title: 'Link',
  component: Link,
};

const Template = (args) => <Link {...args} />;

export const Default = Template.bind({});
Default.args = {
  to: 'https://google.com',
  target: '_blank',
  restoreScrollPosition: false,
  redirectToLastLocation: false,
  rel: null,
  id: null,
  onClick: null,
  children: 'Click me',
  dispatch: null,
  pathHistory: null,
  style: null,
  color: null,
};
