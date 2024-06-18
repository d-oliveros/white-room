import React from 'react';
import { MemoryRouter } from 'react-router';
import ReactAppContext from '../src/client/core/ReactAppContext.js';
import '../src/client/style/style.less';

import {
  dummyHistory,
  dummyApiClient,
  dummyUtilityApiClient,
  loggedOutTree,
} from './contexts';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <ReactAppContext.Provider value={{
      apiClient: dummyApiClient,
      utilityApiClient: dummyUtilityApiClient,
      history: dummyHistory,
      tree: loggedOutTree,
    }}>
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    </ReactAppContext.Provider>
  )
];
