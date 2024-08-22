import { useContext } from 'react';

import ApiClientContext from '#whiteroom/client/contexts/ApiClientContext.js';

const useApiClient = () => useContext(ApiClientContext);

export default useApiClient;
