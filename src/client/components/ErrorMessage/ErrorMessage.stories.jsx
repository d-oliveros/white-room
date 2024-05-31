import React from 'react';

import ErrorMessage, {
  ERROR_MESSAGE_THEME_ORANGE,
  ERROR_MESSAGE_THEME_RED,
} from './ErrorMessage';

export default {
  title: 'ErrorMessage',
  component: ErrorMessage,
};

const Template = (args) => <ErrorMessage {...args} />;

export const ShortText = Template.bind({});
ShortText.args = {
  children: 'There is an error!',
};

export const LongText = Template.bind({});
LongText.args = {
  children: (
    'It is a long established fact that a reader will be distracted by the readable content of ' +
    'a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less ' +
    'normal distribution of letters, as opposed to using \'Content here, content here\', making it ' +
    'look like readable English. Many desktop publishing packages and web page editors now use Lorem ' +
    'Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites ' +
    'still in their infancy. Various versions have evolved over the years, sometimes by accident, ' +
    'sometimes on purpose (injected humour and the like).'
  ),
};

export const ShortTextRedTheme = Template.bind({});
ShortTextRedTheme.args = {
  children: 'There is an error!',
  theme: ERROR_MESSAGE_THEME_RED,
};

export const LongTextThemeOrange = Template.bind({});
LongTextThemeOrange.args = {
  children: (
    'It is a long established fact that a reader will be distracted by the readable content of ' +
    'a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less ' +
    'normal distribution of letters, as opposed to using \'Content here, content here\', making it ' +
    'look like readable English. Many desktop publishing packages and web page editors now use Lorem ' +
    'Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites ' +
    'still in their infancy. Various versions have evolved over the years, sometimes by accident, ' +
    'sometimes on purpose (injected humour and the like).'
  ),
  theme: ERROR_MESSAGE_THEME_ORANGE,
};
