import React from 'react';

import {
  BUTTON_THEME_ADOBE_GREEN,
  BUTTON_THEME_ADOBE_GREY,
  BUTTON_THEME_ADOBE_RED,
} from '#client/components/Button/Button.jsx';

import SimpleMessageModal, {
  SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP,
} from './SimpleMessageModal.jsx';

export default {
  title: 'SimpleMessageModal',
  component: SimpleMessageModal,
};

const Template = (args) => <SimpleMessageModal {...args} />;

export const Success = Template.bind({});
export const Cancel = Template.bind({});

Success.args = {
  iconUrl: '/images/checkmark-circle-large-green.svg',
  headline: 'Thank you for doing business with us!',
  underline: true,
  message: 'A representative will contact you soon. ' +
    'You\'ll be notified when something happens.',
  multiButtons: [
    {
      buttonText: 'Undo',
      buttonTheme: BUTTON_THEME_ADOBE_GREY,
    },
    {
      buttonText: 'Ok, thanks!',
      buttonTheme: BUTTON_THEME_ADOBE_GREEN,
    },
  ],
  maxWidth: 375,
  theme: SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP,
};

Cancel.args = {
  iconUrl: '/images/caution-red.svg',
  headline: 'You will lose your work if you navigate away, are you sure you want to leave?',
  multiButtons: [
    {
      buttonText: 'Leave',
      buttonTheme: BUTTON_THEME_ADOBE_RED,
    },
    {
      buttonText: 'Stay',
      buttonTheme: BUTTON_THEME_ADOBE_GREEN,
    },
  ],
  maxWidth: 375,
  theme: SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP,
};
