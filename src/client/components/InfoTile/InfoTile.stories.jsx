import React from 'react';

import InfoTile, { INFO_TILE_THEME_ADMIN_GREY } from './InfoTile.jsx';

export default {
  title: 'InfoTile',
  component: InfoTile,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: [
          'Default',
          INFO_TILE_THEME_ADMIN_GREY,
        ],
      },
    },
  },
};

const Template = (args) => <InfoTile {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Some Label',
  value: 'Some Value',
  editButtonLabel: 'Edit',
};

export const Admin = Template.bind({});
Admin.args = {
  label: 'Some Label',
  value: '$2,000',
  valueColor: '#000',
  theme: INFO_TILE_THEME_ADMIN_GREY,
  editButtonLabel: null,
};
