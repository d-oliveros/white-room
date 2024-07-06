import { useContext } from 'react';

import ApiClientContext from '#white-room/client/contexts/ApiClientContext.js';

const useApiClient = () => useContext(ApiClientContext);

export default useApiClient;
