import React from 'react';

import FormikField from '#base/view/components/FormikField/FormikField.jsx';
import FlexRow from './FlexRow.jsx';

export default {
  title: 'FlexRow',
  component: FlexRow,
};

const Template = (args) => <FlexRow {...args} />;
const Children = () => {
  return (
    <>
      <FormikField
        formField={{
          id: 'min',
          title: '',
          properties: {
            placeholder: 'min rent',
          },
          type: 'currency',
        }}
      />
      <FormikField
        formField={{
          id: 'max',
          properties: {
            placeholder: 'max rent',
          },
          type: 'currency',
        }}
      />
      <FormikField
        formField={{
          id: 'field3',
          title: '',
          properties: {
            placeholder: 'value 3',
          },
          type: 'currency',
        }}
      />
    </>);
};

export const Default = Template.bind({});
Default.args = {
  children: <Children />,
  width: '800px',
};
