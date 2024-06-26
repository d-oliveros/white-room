import React from 'react';

import Box from '#client/components/Box/Box.jsx';
import CollapsibleContainerController from './CollapsibleContainerController.jsx';
import {
  COLLAPSIBLE_CONTAINER_STATUS_COMPLETE,
  COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED,
  COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS,
  COLLAPSIBLE_CONTAINER_STATUS_ERROR,
  COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED,
  COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY,
} from '../CollapsibleContainer/CollapsibleContainer';

export default {
  title: 'CollapsibleContainerController',
  component: CollapsibleContainerController,
  argTypes: {
    status: {
      control: {
        type: 'select',
        options: [
          COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED,
          COLLAPSIBLE_CONTAINER_STATUS_COMPLETE,
          COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS,
          COLLAPSIBLE_CONTAINER_STATUS_ERROR,
        ],
      },
    },
    borderType: {
      control: {
        type: 'select',
        options: [
          COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED,
          COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY,
        ],
      },
    },
  },
};

const Template = (args) => <CollapsibleContainerController {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (
    <Box
      border='1px solid gray'
      width='100%'
      height='400px'
      backgroundColor='gray'
      borderRadius='8px'
    />
  ),
  title: 'Example Title',
  borderType: COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED,
  status: COLLAPSIBLE_CONTAINER_STATUS_COMPLETE,
  isExpanded: true,
};
