import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EditTextbox extends Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    shouldAllowInputChange: PropTypes.func,
    withSaveButton: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      editValue: props.initialValue,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.initialValue !== this.props.initialValue) {
      this.setState({
        editValue: nextProps.initialValue,
      });
    }
  }

  _onInputRef = (el) => {
    this._inputEl = el;
  }

  _onKeyDown = (e) => {
    if (e.keyCode === 13 && this._inputEl) {
      this._inputEl.blur();
    }
  }

  _onChange = (e) => {
    const { shouldAllowInputChange } = this.props;
    const newValue = e.target.value;

    if (!shouldAllowInputChange || shouldAllowInputChange(newValue)) {
      this.setState({
        editValue: newValue,
      });
    }
  }

  _onBlur = () => {
    const { initialValue, onSave, withSaveButton } = this.props;
    const { editValue } = this.state;

    if (initialValue !== editValue && !withSaveButton) {
      onSave(editValue);
    }
  }

  _onSaveButtonClick = () => {
    const { onSave, initialValue } = this.props;
    const { editValue } = this.state;
    onSave(editValue);
    this.setState({
      editValue: initialValue,
    });
  }

  render() {
    const { placeholder, className, withSaveButton } = this.props;
    const { editValue } = this.state;

    return (
      <>
        <input
          type='text'
          ref={this._onInputRef}
          className={className}
          placeholder={placeholder}
          onKeyDown={this._onKeyDown}
          onChange={this._onChange}
          onBlur={this._onBlur}
          value={editValue}
        />
        {withSaveButton && (
          <button
            type='button'
            onClick={this._onSaveButtonClick}
            disabled={!editValue}
          >
            Add
          </button>
        )}
      </>
    );
  }
}

export default EditTextbox;
