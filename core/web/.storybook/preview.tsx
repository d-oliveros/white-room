import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { StorybookFormProvider } from './decorators/StorybookFormProvider';
import '../src/styles.css';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    (Story, context) => {
      if (context.parameters.withReactHookForm) {
        return (
          <StorybookFormProvider>
            <Story />
          </StorybookFormProvider>
        );
      }
      return <Story />;
    },
  ],
};

export default preview;
