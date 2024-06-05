import React from 'react';

import TooltipV2 from './TooltipV2.jsx';

export default {
  title: 'TooltipV2',
  component: TooltipV2,
};

const Template = (args) => <TooltipV2 {...args} />;

export const Default = Template.bind({});
Default.args = {
  // eslint-disable-next-line max-len
  text: 'Sorry, you can’t set it lower. Contact your account manager to submit this property with a lower commission.',
  fromRight: true,
};
