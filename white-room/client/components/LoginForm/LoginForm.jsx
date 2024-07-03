import React, { useState } from 'react';
import { Form, Formik } from 'formik';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';

import {
  createFormValidationFn,
  createInitialValues,
} from '#client/helpers/formikHelpers.js';

import AuthActions from '#client/actions/Auth/index.jsx';
import useApiState from '#client/hooks/useApiState.jsx';

import FormikField from '#client/components/FormikField/FormikField.jsx';
import useDispatch from '#client/hooks/useDispatch.js';
import Link from '#client/components/Link/Link.jsx';
import ErrorMessage from '#client/components/ErrorMessage/ErrorMessage.jsx';

const formFields = [
  {
    id: 'phone',
    type: 'phone',
    properties: {
      placeholder: 'Phone Number',
    },
    validations: ['phone', 'required'],
  },
  {
    id: 'password',
    type: 'password',
    properties: {
      autoComplete: 'false',
      placeholder: 'Password',
    },
    validations: ['required'],
  },
];

const LoginForm = () => {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginApiState = useApiState({ action: API_ACTION_LOGIN });
  const dispatch = useDispatch();

  const _onSubmit = (formValues) => {
    dispatch(AuthActions.login, formValues);
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={_onSubmit}
      initialValues={createInitialValues({ formFields })}
      validate={createFormValidationFn(formFields)}
    >
      {(formikBag) => (
        <div className='loginFormContainer'>
          <Form>
            {loginApiState.error && (
              <ErrorMessage>
                {loginApiState.error.message}
              </ErrorMessage>
            )}
            {formFields.map((formField) => (
              <FormikField
                key={formField.id}
                formField={formField}
                formikBag={formikBag}
              />
            ))}
            <button
              type='submit'
              className='button'
              disabled={loginApiState.inProgress || !formikBag.isValid}
            >
              {loginApiState.inProgress ? 'logging in...' : 'log in'}
            </button>
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default LoginForm;
