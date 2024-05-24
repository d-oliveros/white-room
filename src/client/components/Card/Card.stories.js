import React from 'react';

import Card from './Card';

export default {
  title: 'Card',
  component: Card,
};

const Template = (args) => <Card {...args} />;

const Child = () => {
  return <div style={{ border: '1px solid black', padding: '15px' }}>This is a child element</div>;
};

export const Default = Template.bind({});
Default.args = {
  color: 'green',
  header: 'Marketing',
  subheader: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  iconUrl: 'Some iconUrl',
  children: <Child />,
};
