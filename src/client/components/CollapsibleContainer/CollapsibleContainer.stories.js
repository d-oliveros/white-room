import React from 'react';

import Box from '#client/components/Box/Box.js';
import CollapsibleContainer, {
  COLLAPSIBLE_CONTAINER_STATUS_COMPLETE,
  COLLAPSIBLE_CONTAINER_STATUS_NOT_STARTED,
  COLLAPSIBLE_CONTAINER_STATUS_IN_PROGRESS,
  COLLAPSIBLE_CONTAINER_STATUS_ERROR,
  COLLAPSIBLE_CONTAINER_BORDER_TYPE_ROUNDED,
  COLLAPSIBLE_CONTAINER_BORDER_TYPE_BOTTOM_GRAY,
} from './CollapsibleContainer';

export default {
  title: 'CollapsibleContainer',
  component: CollapsibleContainer,
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

const Template = (args) => <CollapsibleContainer {...args} />;

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
