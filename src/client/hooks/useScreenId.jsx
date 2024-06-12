import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import AnalyticsActions from '#client/actions/Analytics/index.js';

import useDispatch from '#client/hooks/useDispatch.js';

const isBrowser = typeof window !== 'undefined';

function useScreenId(screenIdConstantOrGetter, props) {
  const location = useLocation();
  const dispatch = useDispatch();

  const screenId = typeof screenIdConstantOrGetter === 'function'
    ? screenIdConstantOrGetter(props)
    : screenIdConstantOrGetter;

  const willMount = useRef(true);
  if (willMount.current && !isBrowser) {
    willMount.current = false;
    dispatch(AnalyticsActions.setScreenId, screenId);
  }

  useEffect(() => {
    dispatch(AnalyticsActions.setScreenId, screenId);

    return () => {
      dispatch(AnalyticsActions.unsetScreenId);
    };
  }, [location.pathname, screenId, dispatch]);

  return screenId;
}

export default function useScreenIdDecorator(screenIdConstantOrGetter) {
  return function ScreenIdDecorator(Component) {
    return function DecoratedComponent(props) {
      useScreenId(screenIdConstantOrGetter, props);

      return <Component {...props} />;
    };
  };
}
