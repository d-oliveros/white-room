import { useContext } from 'react';

import DispatchContext from '#white-room/client/contexts/DispatchContext.js';

const useDispatch = () => useContext(DispatchContext);

export default useDispatch;
