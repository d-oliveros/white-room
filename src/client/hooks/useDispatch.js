import { useContext } from 'react';
import ReactAppContext from '#client/core/ReactAppContext.js';

export default function useDispatch() {
  const { dispatch } = useContext(ReactAppContext);
  return dispatch;
}
