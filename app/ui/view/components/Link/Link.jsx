import PropTypes from 'prop-types';
import { Link as ReactRouterDomLink } from 'react-router-dom';

import useBranch from '#white-room/client/hooks/useBranch.js';
import useDispatch from '#white-room/client/hooks/useDispatch.js';
import setShouldRestoreScrollPositionAction from '#white-room/client/actions/Navigator/setShouldRestoreScrollPosition.js';
import goBackAction from '#white-room/client/actions/Navigator/goBack.js';
import replaceAction from '#white-room/client/actions/Navigator/replace.js';

const hasProtocolRegex = /^https?:\/\//;

const Link = ({
  to,
  download,
  target,
  restoreScrollPosition = false,
  redirectToLastLocation,
  rel,
  id,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
  className,
  style,
}) => {
  const dispatch = useDispatch();
  const browsingHistory = useBranch('browsingHistory');

  const _onClick = () => {
    const lastPath = browsingHistory[1];

    if (restoreScrollPosition) {
      dispatch(setShouldRestoreScrollPositionAction);
    }

    if (redirectToLastLocation) {
      if (lastPath) {
        dispatch(goBackAction);
      } else {
        dispatch(replaceAction, { to });
      }
    }

    if (onClick) {
      onClick();
    }
  };

  const isExternalLink = hasProtocolRegex.test(to);
  if (isExternalLink) {
    return (
      // eslint-disable-next-line react/jsx-no-target-blank
      <a
        id={id}
        rel={rel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        href={to}
        target={download ? '_blank' : target}
        download={download}
        className={className}
      >
        {children}
      </a>
    );
  }

  if (redirectToLastLocation) {
    return (
      <a
        id={id}
        rel={rel}
        onClick={_onClick}
        target={target}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <ReactRouterDomLink
      id={id}
      rel={rel}
      to={to}
      onClick={_onClick}
      target={target}
      style={style}
      className={className}
    >
      {children}
    </ReactRouterDomLink>
  );
};

Link.propTypes = {
  to: PropTypes.string.isRequired,
  download: PropTypes.bool,
  target: PropTypes.string,
  restoreScrollPosition: PropTypes.bool,
  redirectToLastLocation: PropTypes.bool,
  rel: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Link;
