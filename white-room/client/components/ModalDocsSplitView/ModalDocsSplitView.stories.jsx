import React from 'react';

import ModalDocsSplitView from './ModalDocsSplitView.jsx';

export default {
  title: 'ModalDocsSplitView',
  component: ModalDocsSplitView,
};

const Template = (args) => <ModalDocsSplitView {...args} />;

export const Default = Template.bind({});
Default.args = {
  navbarTitle: 'Applicants’ Documents for 13613 Alysheba Dr, Del Valle, TX 78617',
  sidebarTitle: 'Documents (5 Applicants)',
  ctaClick: () => global.alert('clicked'),
  ctaText: 'Download All Docs',
  onClose: () => global.alert('closed'),
  groups: [
    {
      title: 'Jill Schmo',
      items: [
        {
          title: 'Government ID',
          value: 'https://i.pinimg.com/564x/3f/7b/18/3f7b18c474d559a4b51aa38ea2171cae.jpg',
        },
        {
          title: 'Application Form',
          value: 'SomeOtherURL',
        },
        {
          title: 'VOE Additional Doc 1',
          value: 'SomeOtherURL2',
        },
        {
          title: 'VOE Additional Doc 1',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL3',
        },
        {
          title: 'Paystub 3',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL4',
        },
        {
          title: 'Verification of Rental History',
          value: 'SomeOtherURL5',
        },
      ],
    },
    {
      title: 'Gabe Schmo',
      items: [
        {
          title: 'Additional Proof Of Income 1',
          value: 'SomeOtherURL6',
        },
        {
          title: 'Paystub 1',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL7',
        },
        {
          title: 'Paystub 2',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL8',
        },
        {
          title: 'Verification of Rental History',
          value: 'SomeOtherURL9',
        },
      ],
    },
    {
      title: 'Gabe Schmo 2',
      items: [
        {
          title: 'Application Form',
          value: 'SomeOtherURL6',
        },
        {
          title: 'Paystub 1',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL7',
        },
        {
          title: 'Paystub 2',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL8',
        },
        {
          title: 'Verification of Rental History',
          value: 'SomeOtherURL9',
        },
      ],
    },
    {
      title: 'Gabe Schmo 3',
      items: [
        {
          title: 'Application Form',
          value: 'SomeOtherURL6',
        },
        {
          title: 'Paystub 1',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL7',
        },
        {
          title: 'Paystub 2',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL8',
        },
        {
          title: 'Verification of Rental History',
          value: 'SomeOtherURL9',
        },
      ],
    },
    {
      title: 'Gabe Schmo 4',
      items: [
        {
          title: 'Application Form',
          value: 'SomeOtherURL6',
        },
        {
          title: 'Paystub 1',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL7',
        },
        {
          title: 'Paystub 2',
          subtitle: '(Pinwheel)',
          value: 'SomeOtherURL8',
        },
        {
          title: 'Verification of Rental History',
          value: 'SomeOtherURL9',
        },
      ],
    },

  ],
};
