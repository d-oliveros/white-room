import { useContext } from 'react';

import DispatchContext from '#whiteroom/client/contexts/DispatchContext.js';

const useDispatch = () => useContext(DispatchContext);

export default useDispatch;
