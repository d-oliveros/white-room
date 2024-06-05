import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as ReactRouterDomLink } from 'react-router-dom';
import classnames from 'classnames';

import branch from '#client/core/branch.jsx';
import Navigator from '#client/actions/Navigator/index.js';

import './Link.less';

const hasProtocolRegex = /^https?:\/\//;

const LINK_COLOR_TO_CLASSNAME_MAPPING = {
  blue300: 'color-blue-300',
};

@branch({
  pathHistory: ['analytics', 'pathHistory'],
})
class Link extends Component {
  static propTypes = {
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
    dispatch: PropTypes.func.isRequired,
    pathHistory: PropTypes.array.isRequired,
    style: PropTypes.object,
    color: PropTypes.oneOf(Object.keys(LINK_COLOR_TO_CLASSNAME_MAPPING)),
  }

  static defaultProps = {
    restoreScrollPosition: false,
  }

  _onClick = () => {
    const {
      to,
      restoreScrollPosition,
      pathHistory,
      dispatch,
      onClick,
      redirectToLastLocation,
    } = this.props;

    const lastPath = pathHistory[1];

    if (restoreScrollPosition) {
      dispatch(Navigator.setShouldRestoreScrollPosition);
    }

    if (redirectToLastLocation) {
      if (lastPath) {
        dispatch(Navigator.goBack);
      }
      else {
        dispatch(Navigator.replace, { to });
      }
    }

    if (onClick) {
      onClick();
    }
  }

  render() {
    const {
      to,
      download,
      target,
      children,
      className,
      rel,
      id,
      onClick,
      onMouseEnter,
      onMouseLeave,
      redirectToLastLocation,
      style,
      color,
    } = this.props;

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
          onClick={this._onClick}
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
        onClick={this._onClick}
        target={target}
        styleName={linkClassName}
        style={style}
        className={className}
      >
        {children}
      </ReactRouterDomLink>
    );
  }
}

export default Link;
