import React from 'react';

import Tag, {
  TAG_THEME_GREEN_WHITE,
  TAG_THEME_GOLD_WHITE,
  TAG_THEME_BLUE_WHITE,
  TAG_THEME_PURPLE_WHITE,
  TAG_THEME_GREEN_ADOBE,
  TAG_THEME_ORANGE_WHITE,
  TAG_THEME_GREY_OUTLINE,
} from './Tag';

export default {
  title: 'Tag',
  component: Tag,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: [
          TAG_THEME_GREEN_WHITE,
          TAG_THEME_GOLD_WHITE,
          TAG_THEME_BLUE_WHITE,
          TAG_THEME_PURPLE_WHITE,
          TAG_THEME_GREEN_ADOBE,
          TAG_THEME_ORANGE_WHITE,
          TAG_THEME_GREY_OUTLINE,
        ],
      },
    },
  },
};

const Template = (args) => <Tag {...args} />;

export const Default = Template.bind({});
Default.args = {
  theme: TAG_THEME_GREEN_WHITE,
  children: 'Involved',
};
