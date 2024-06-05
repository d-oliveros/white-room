import React from 'react';

import Button, {
  BUTTON_THEME_ADOBE_YELLOW,
  BUTTON_THEME_ADOBE_BLUE,
  BUTTON_THEME_ADOBE_BLUE_INVERTED,
  BUTTON_THEME_ADOBE_GREEN,
  BUTTON_THEME_ADOBE_GREY,
  BUTTON_THEME_ADOBE_RED,
  BUTTON_THEME_ADOBE_RED_INVERTED,
  BUTTON_THEME_ADOBE_WHITE,
  BUTTON_THEME_ASSEMBLY_LINE_BLUE,
  BUTTON_HEIGHT_MEDIUM,
  BUTTON_HEIGHT_TALL,
  BUTTON_FONT_SIZE_SMALL,
  BUTTON_FONT_SIZE_MEDIUM,
} from './Button.jsx';

export default {
  title: 'Button',
  component: Button,
  argTypes: {
    heightType: {
      control: {
        type: 'select',
        options: [BUTTON_HEIGHT_MEDIUM, BUTTON_HEIGHT_TALL],
      },
    },
    fontSizeType: {
      control: {
        type: 'select',
        options: [BUTTON_FONT_SIZE_SMALL, BUTTON_FONT_SIZE_MEDIUM],
      },
    },
    theme: {
      control: {
        type: 'select',
        options: [
          BUTTON_THEME_ADOBE_YELLOW,
          BUTTON_THEME_ADOBE_BLUE,
          BUTTON_THEME_ADOBE_BLUE_INVERTED,
          BUTTON_THEME_ADOBE_GREEN,
          BUTTON_THEME_ADOBE_GREY,
          BUTTON_THEME_ADOBE_RED,
          BUTTON_THEME_ADOBE_RED_INVERTED,
          BUTTON_THEME_ADOBE_WHITE,
          BUTTON_THEME_ASSEMBLY_LINE_BLUE,
        ],
      },
    },
  },
};

const Template = (args) => <Button {...args} />;

export const YellowTheme = Template.bind({});
YellowTheme.args = {
  children: 'Submit',
  theme: BUTTON_THEME_ADOBE_YELLOW,
  hasBoxShadow: true,
};

export const BlueTheme = Template.bind({});
BlueTheme.args = {
  children: 'Submit',
  theme: BUTTON_THEME_ADOBE_BLUE,
  hasBoxShadow: true,
};

export const BlueInvertedTheme = Template.bind({});
BlueInvertedTheme.args = {
  children: 'Submit',
  theme: BUTTON_THEME_ADOBE_BLUE_INVERTED,
};

export const GreyTheme = Template.bind({});
GreyTheme.args = {
  children: 'Submit',
  theme: BUTTON_THEME_ADOBE_GREY,
};

export const GreenTheme = Template.bind({});
GreenTheme.args = {
  children: 'Submit',
  theme: BUTTON_THEME_ADOBE_GREEN,
  hasBoxShadow: true,
};

export const RedTheme = Template.bind({});
RedTheme.args = {
  children: 'Cancel',
  theme: BUTTON_THEME_ADOBE_RED,
  hasBoxShadow: true,
};

export const RedInvertedTheme = Template.bind({});
RedInvertedTheme.args = {
  children: 'Cancel',
  theme: BUTTON_THEME_ADOBE_RED_INVERTED,
};

export const WhiteTheme = Template.bind({});
WhiteTheme.args = {
  children: 'Cancel',
  theme: BUTTON_THEME_ADOBE_WHITE,
  hasBoxShadow: true,
};

export const AssemblyLineBlueTheme = Template.bind({});
AssemblyLineBlueTheme.args = {
  children: 'Complete',
  theme: BUTTON_THEME_ASSEMBLY_LINE_BLUE,
  fontSizeType: BUTTON_FONT_SIZE_SMALL,
};
