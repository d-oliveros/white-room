import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import AnalyticsActions from '#client/actions/Analytics/index.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

import useDispatch from '#client/hooks/useDispatch.js';

const isBrowser = process.browser;

/**
 * HOC decorator to set the "screenId" value  when the decorated component is mounted.
 *
 * @param  {string|Function} screenIdConstantOrGetter Constant screen ID or function<props:Object> => screen ID string.
 * @return {Function} screenId decorator.
 */
export default function withScreenIdDecoratorFactory(screenIdConstantOrGetter) {
  return function withScreenIdDecorator(ComponentToDecorate) {
    function DecoratedComponent(props) {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [location.pathname, screenId]);

      return (
        <ComponentToDecorate
          {...props}
        />
      );
    }

    configureDecoratedComponent({
      DecoratedComponent: DecoratedComponent,
      OriginalComponent: ComponentToDecorate,
    });

    return DecoratedComponent;
  };
}
