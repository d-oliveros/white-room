import { MemoryRouter } from 'react-router';
// import ReactAppContext from '../src/client/core/ReactAppContext.js';

// import {
//   dummyHistory,
//   dummyApiClient,
//   dummyUtilityApiClient,
//   loggedOutTree,
// } from './contexts';

// export const decorators = [
//   (Story) => (
//     <ReactAppContext.Provider value={{
//       apiClient: dummyApiClient,
//       utilityApiClient: dummyUtilityApiClient,
//       history: dummyHistory,
//       tree: loggedOutTree,
//     }}>
//       <MemoryRouter initialEntries={['/']}>
//         <Story />
//       </MemoryRouter>
//     </ReactAppContext.Provider>
//   )
// ];

export const decorators = [
  (Story) => (
    <MemoryRouter initialEntries={['/']}>
      <Story />
    </MemoryRouter>
  ),
];

export const tags = ['autodocs'];

