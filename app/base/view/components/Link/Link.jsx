import React from 'react';
import PropTypes from 'prop-types';
import { Link as ReactRouterDomLink } from 'react-router-dom';
import classnames from 'classnames';

import useBranch from '#white-room/client/hooks/useBranch.js';
import useDispatch from '#white-room/client/hooks/useDispatch.js';
import Navigator from '#white-room/client/actions/Navigator/index.jsx';

import './Link.less';

const hasProtocolRegex = /^https?:\/\//;

const LINK_COLOR_TO_CLASSNAME_MAPPING = {
  blue300: 'color-blue-300',
};

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
  color,
}) => {
  const dispatch = useDispatch();
  const browsingHistory = useBranch('browsingHistory');

  const _onClick = () => {
    const lastPath = browsingHistory[1];

    if (restoreScrollPosition) {
      dispatch(Navigator.setShouldRestoreScrollPosition);
    }

    if (redirectToLastLocation) {
      if (lastPath) {
        dispatch(Navigator.goBack);
      } else {
        dispatch(Navigator.replace, { to });
      }
    }

    if (onClick) {
      onClick();
    }
  };

  const isExternalLink = hasProtocolRegex.test(to);
  const linkClassName = classnames(
    'Link',
    LINK_COLOR_TO_CLASSNAME_MAPPING[color],
  );

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
        styleName={linkClassName}
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
        styleName={linkClassName}
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
      styleName={linkClassName}
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
  color: PropTypes.oneOf(Object.keys(LINK_COLOR_TO_CLASSNAME_MAPPING)),
};

export default Link;
