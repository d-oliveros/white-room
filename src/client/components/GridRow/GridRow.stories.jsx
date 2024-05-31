import React from 'react';

import FormikField from '#client/components/FormikField/FormikField.jsx';
import GridRow from './GridRow';

export default {
  title: 'GridRow',
  component: GridRow,
};

const Template = (args) => <GridRow {...args} />;

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
      <FormikField
        formField={{
          id: 'field4',
          properties: {
            placeholder: 'value 4',
          },
          type: 'currency',
        }}
      />
      <FormikField
        formField={{
          id: 'field5',
          title: '',
          properties: {
            placeholder: 'value 5',
          },
          type: 'currency',
        }}
      />
      <FormikField
        formField={{
          id: 'field6',
          properties: {
            placeholder: 'value 6',
          },
          type: 'currency',
        }}
      />
    </>);
};

export const Default = Template.bind({});
Default.args = {
  autofit: false,
  autofitMinColumnWidth: '250px',
  fillColumns: false,
  columns: 3,
  width: '800px',
  children: <Children />,
};
