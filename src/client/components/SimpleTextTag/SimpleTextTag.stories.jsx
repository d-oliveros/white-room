import React from 'react';

import SimpleTextTag from './SimpleTextTag';

export default {
  title: 'SimpleTextTag',
  component: SimpleTextTag,
};

const Template = (args) => <SimpleTextTag {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Combo Lockbox Code',
  value: '3602',
};
