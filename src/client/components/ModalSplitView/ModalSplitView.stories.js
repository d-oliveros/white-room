import React from 'react';

import Box from '#client/components/Box/Box.js';
import ModalSplitView from './ModalSplitView';

export default {
  title: 'ModalSplitView',
  component: ModalSplitView,
};

const Template = (args) => <ModalSplitView {...args} />;

export const Default = Template.bind({});
Default.args = {
  leftChild: (
    <Box margin='40px' width='600px' height='3300px' backgroundColor='white' borderRadius='16px' />
  ),
  rightChild: (
    <Box margin='40px' width='300px' height='1500px' backgroundColor='gray' borderRadius='16px' />
  ),
};
