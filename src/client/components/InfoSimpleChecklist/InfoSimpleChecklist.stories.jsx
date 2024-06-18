import React from 'react';

import InfoSimpleChecklist from './InfoSimpleChecklist.jsx';

export default {
  title: 'InfoSimpleChecklist',
  component: InfoSimpleChecklist,
};

const Template = (args) => <InfoSimpleChecklist {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Benefits of installing a Sunlock',
  listItems: [
    'Show vacant properties safely',
    'Drive more tours',
    'Get more renter demand',
    'Lease faster',
  ],
};
