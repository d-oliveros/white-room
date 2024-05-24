import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/fp/get';

import { API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED } from 'common/errorCodes';

const initialState = {
  formState: {
    phone: '',
    password: '',
  },
};

const isUserNotFoundError = (error) => lodashGet('details.fields.phone', error);
const isIncorrectPasswordError = (error) => lodashGet('details.fields.password', error);
const isPhoneValidationError = (error) => {
  return error && error.name === API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED;
};
const isUnexpectedError = (error) => (
  error
  && !isUserNotFoundError(error)
  && !isIncorrectPasswordError(error)
  && !isPhoneValidationError(error)
);

class LoginForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    submitError: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  submitForm = (event) => {
    event.preventDefault();
    this.props.onSubmit(this.state.formState);
    this.setState(initialState);
  }

  onInputChange = (event, field) => {
    if (field === 'phone' && event.target.value.length > 10) {
      return;
    }
    this.setState({
      formState: {
        ...this.state.formState,
        [field]: event.target.value,
      },
    });
  }

  render() {
    const { isSubmitting, submitError } = this.props;
    const { formState } = this.state;

    return (
      <form onSubmit={this.submitForm}>
        <input
          type='tel'
          pattern='[0-9]*'
          name='phone'
          placeholder='Phone Number'
          value={formState.phone}
          onChange={(event) => this.onInputChange(event, 'phone')}
        />
        {isPhoneValidationError(submitError) && (
          <div className='formMessage error'>
            <span>Sorry, that phone number is not a valid 10-digit phone number</span>
          </div>
        )}
        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formState.password}
          onChange={(event) => this.onInputChange(event, 'password')}
        />
        {isIncorrectPasswordError(submitError) && (
          <div className='formMessage error'>
            <span>Whoops, your password is incorrect</span>
          </div>
        )}
        {isUserNotFoundError(submitError) && (
          <div className='formMessage error'>
            <span>Sorry, there is no account with that phone number</span>
          </div>
        )}
        <button
          type='submit'
          className='button blue'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'logging in...' : 'log in'}
        </button>
        {isUnexpectedError(submitError) && (
          <div className='formMessage error'>
            {submitError.message}
          </div>
        )}
      </form>
    );
  }
}

export default LoginForm;
