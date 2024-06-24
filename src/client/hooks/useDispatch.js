import { useContext } from 'react';

import DispatchContext from '#client/contexts/DispatchContext.js';

const useDispatch = () => useContext(DispatchContext);

export default useDispatch;
