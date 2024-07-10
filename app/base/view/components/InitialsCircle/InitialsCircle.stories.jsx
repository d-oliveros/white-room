import React from 'react';

import InitialsCircle, {
  INITIALS_CIRCLE_THEME_YELLOW,
  INITIALS_CIRCLE_THEME_PURPLE,
} from './InitialsCircle.jsx';

export default {
  title: 'InitialsCircle',
  component: InitialsCircle,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: [
          INITIALS_CIRCLE_THEME_YELLOW,
          INITIALS_CIRCLE_THEME_PURPLE,
        ],
      },
    },
  },
};

const Template = (args) => <InitialsCircle {...args} />;

export const Default = Template.bind({});
Default.args = {
  theme: INITIALS_CIRCLE_THEME_PURPLE,
  initials: 'do',
  hasBorder: true,
};
