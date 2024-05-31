import React from 'react';
import { useMediaQuery } from 'react-responsive';

import Box from '#client/components/Box/Box.js';

import ModalV2, {
  MODAL_THEME_SLIDE_UP,
  MODAL_THEME_FIXED_FOOTER_BUTTON,
  MODAL_THEME_FIXED_FOOTER_BUTTON_PREVIEW_DOCS,
  MODAL_THEME_FIXED_FOOTER_BUTTON_SLIDE_UP,
  MODAL_THEME_STACK,
} from './ModalV2';

export default {
  title: 'ModalV2',
  component: ModalV2,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: [
          MODAL_THEME_SLIDE_UP,
          MODAL_THEME_FIXED_FOOTER_BUTTON,
          MODAL_THEME_FIXED_FOOTER_BUTTON_PREVIEW_DOCS,
          MODAL_THEME_FIXED_FOOTER_BUTTON_SLIDE_UP,
          MODAL_THEME_STACK,
        ],
      },
    },
  },
};

const Template = (args) => <ModalV2 {...args} />;

const photos = [
  'https://picsum.photos/200',
  'https://picsum.photos/200',
  'https://picsum.photos/200',
  'https://picsum.photos/200',
  'https://picsum.photos/200',
  'https://picsum.photos/200',
  'https://picsum.photos/200',
];

const Child = () => {
  const isSmallScreen = useMediaQuery({
    query: '(max-device-width: 600px)',
  });

  return (
    <>
      {photos.map((photo) => (
        <Box
          backgroundImage={`url(${photo})`}
          backgroundPosition='center'
          backgroundSize='cover'
          backgroundRepeat='no-repeat'
          marginBottom='6px'
          width='100%'
          height={isSmallScreen ? '400px' : '60vw'}
        />
      ))}
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  children: <Child />,
  showCloseButton: true,
  theme: MODAL_THEME_SLIDE_UP,
};

export const FixedFooterButton = Template.bind({});
FixedFooterButton.args = {
  children: <Child />,
  showCloseButton: true,
  theme: MODAL_THEME_FIXED_FOOTER_BUTTON,
};
