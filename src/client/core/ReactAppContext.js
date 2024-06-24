import React, { createContext, useContext } from 'react';

const ReactAppContext = createContext();

export const useApiClient = () => useContext(ApiClientContext);

export default ReactAppContext;
