import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';

class DialogBox extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })).isRequired,
  };

  render() {
    const { onClose, isOpen, title, message, actions } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <Portal>
        <div className='darkModal DialogBox' onClick={onClose}>
          <div className='promptContainer'>
            <div className='textContainer'>
              <div className='headlineContainer'>
                <span className='headline'>{title}</span>
              </div>
              {message && (
                <div className='descriptionContainer'>
                  <span className='description'>{message}</span>
                </div>
              )}
            </div>
            <div className='actionsContainer'>
              {actions.map((action) => (
                <span
                  key={action.id}
                  onClick={action.onClick}
                  className={'action ' + action.id}
                >
                  {action.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Portal>
    );
  }
}

export default DialogBox;
