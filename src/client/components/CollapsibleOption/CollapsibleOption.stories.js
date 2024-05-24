import React from 'react';
import Box from 'client/components/Box/Box';
import Text from 'client/components/Text/Text';

import CollapsibleOption from './CollapsibleOption';

export default {
  title: 'CollapsibleOption',
  component: CollapsibleOption,
};

const Template = (args) => <CollapsibleOption {...args} />;

export const Default = Template.bind({});

Default.args = {
  title: 'Link your payroll provider',
  label: 'For employees with direct deposit',
  children: (
    <>
      <Text
        weight='500'
        size='16'
        lineHeight='24px'
      >
        Use this option:
        <br />
        <Box
          margin='12px 0'
          marginLeft='10px'
        >
          {'\u2022 If you are employed and receive direct deposit paycheck to your bank account'}
        </Box>
        If your payroll provider isn't supported, you can link a bank below instead.
      </Text>
    </>
  ),
  buttonText: 'Verify Income',
  isActive: false,
  icon: 'payroll-icon',
  onClick: () => {
    global.alert('user is redirected to correponding VOIE flow');
  },

};
