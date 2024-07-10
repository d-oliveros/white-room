import React, { useState } from 'react';
import { Form, Formik } from 'formik';

import {
  createFormValidationFn,
  createInitialValues,
} from '#white-room/client/helpers/formikHelpers.js';

import AuthActions from '#auth/view/actions/index.jsx';
import useApiState from '#white-room/client/hooks/useApiState.jsx';

import FormikField from '#base/view/components/FormikField/FormikField.jsx';
import useDispatch from '#white-room/client/hooks/useDispatch.js';
import Link from '#base/view/components/Link/Link.jsx';
import ErrorMessage from '#base/view/components/ErrorMessage/ErrorMessage.jsx';

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
