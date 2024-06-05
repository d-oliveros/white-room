import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Portal } from 'react-portal';

import isUserAgentMobileApp from '#common/util/isUserAgentMobileApp.js';

import preventDefaultPropagation from '#client/helpers/preventDefaultPropagation.js';
import branch from '#client/core/branch.jsx';

export const DIALOG_ACTION_THEME_DANGER = 'DIALOG_ACTION_THEME_DANGER';
export const DIALOG_ACTION_THEME_ACTIVE = 'DIALOG_ACTION_THEME_ACTIVE';
const DIALOG_ACTION_THEME_TO_CLASSNAME_MAPPING = {
  [DIALOG_ACTION_THEME_DANGER]: 'red',
  [DIALOG_ACTION_THEME_ACTIVE]: 'active',
};
const DIALOG_ACTION_THEMES = Object.keys(DIALOG_ACTION_THEME_TO_CLASSNAME_MAPPING);

@branch({
  userAgent: ['analytics', 'userAgent'],
})
class DialogActionModal extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      theme: PropTypes.oneOf(DIALOG_ACTION_THEMES),
    })).isRequired,
    onClose: PropTypes.func.isRequired,
    onClickAction: PropTypes.func.isRequired,
    userAgent: PropTypes.object.isRequired,
  };

  render() {
    const { userAgent, onClose, isOpen, title, actions, onClickAction } = this.props;

    if (!isOpen) {
      return null;
    }

    const isMobileApp = isUserAgentMobileApp(userAgent);

    return (
      <Portal>
        <div
          onClick={onClose}
          className={classnames(
            'darkModal',
            'darkNavigator',
            { webview: isMobileApp },
          )}
        >
          <div className='choiceContainer' onClick={preventDefaultPropagation}>
            <div className='choiceGroup'>
              <div className='topLabel'>
                <span>{title}</span>
              </div>

              {actions.map((action) => (
                <span
                  key={action.id}
                  onClick={() => onClickAction(action.id)}
                  className={classnames('choice', DIALOG_ACTION_THEME_TO_CLASSNAME_MAPPING[action.theme])}
                >
                  {action.text}
                </span>
              ))}
            </div>
            <div
              className='choice solo'
              onClick={onClose}
            >
              <span>Cancel</span>
            </div>
          </div>
        </div>
      </Portal>
    );
  }
}

export default DialogActionModal;
