import React from 'react';

import InformationLabel from './InformationLabel.jsx';

export default {
  title: 'InformationLabel',
  component: InformationLabel,
};

const Template = (args) => <InformationLabel {...args} />;

export const Default = Template.bind({});
Default.args = {
  text: 'We replaced the original deadbolt with a Sunlock, your key will no longer work!',
};
