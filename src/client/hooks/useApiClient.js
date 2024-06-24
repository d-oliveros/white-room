import { useContext } from 'react';

import ApiClientContext from '#client/contexts/ApiClientContext.js';

const useApiClient = () => useContext(ApiClientContext);

export default useApiClient;
