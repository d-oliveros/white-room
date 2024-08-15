import Avatar from './Avatar.jsx';

export default {
  title: 'ui/components/Avatar',
  component: Avatar,
};

export const Default = {
  args: {
    img: 'https://i.pravatar.cc/50',
    alt: 'Image Alt',
  },
};

export const Squared = {
  args: {
    ...Default.args,
    rounded: false
  },
};
