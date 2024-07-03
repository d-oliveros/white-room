import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';

class CopyText extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    formattedText: PropTypes.string,
    shouldShowTooltipOnHover: PropTypes.bool,
    shouldShowTooltipOnClick: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    shouldShowTooltipOnHover: true,
    shouldShowTooltipOnClick: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      showClickedTooltip: false,
      showHoverTooltip: false,
    };
    this._unmounting = false;
  }

  componentWillUnmount() {
    this._unmounting = true;
  }

  _onCopyTextClick = (e) => {
    const { text, shouldShowTooltipOnClick } = this.props;
    e.preventDefault();
    e.stopPropagation();

    copyToClipboard(text);

    this.setState({
      showClickedTooltip: shouldShowTooltipOnClick,
      showHoverTooltip: false,
    });
    setTimeout(() => {
      if (!this._unmounting) {
        this.setState({
          showClickedTooltip: false,
          showHoverTooltip: false,
        });
      }
    }, 600);
  }

  _onMouseOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      showHoverTooltip: true,
    });
  }

  _onMouseLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      showHoverTooltip: false,
    });
  }

  render() {
    const { text, formattedText, shouldShowTooltipOnHover, className } = this.props;
    const { showClickedTooltip, showHoverTooltip } = this.state;

    return (
      <span
        onClick={this._onCopyTextClick}
        className={classnames('CopyText', className)}
        onMouseOver={shouldShowTooltipOnHover ? this._onMouseOver : null}
        onFocus={shouldShowTooltipOnHover ? this._onMouseOver : null}
        onMouseLeave={shouldShowTooltipOnHover ? this._onMouseLeave : null}
      >
        <span
          className={classnames('secondaryAction')}
        >
          {formattedText || text}
        </span>
        <span
          className={classnames(
            'copiedMessage', {
              hovered: showHoverTooltip,
              clicked: showClickedTooltip,
            }
          )}
        >
          {showClickedTooltip ? 'Copied!' : 'Click to copy'}
        </span>
      </span>
    );
  }
}

export default CopyText;
