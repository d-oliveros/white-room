import React from 'react';
import PropTypes from 'prop-types';
import { Form, Formik } from 'formik';
import { useLocation } from 'react-router';

import useBranch from '#client/hooks/useBranch.js';
import {
  initialApiActionState,
} from '#api/createApiClient.js';
import {
  API_ACTION_SIGNUP,
} from '#api/actionTypes.js';
import {
  createFormValidationFn,
  createInitialValues,
} from '#client/helpers/formikHelpers.js';

import AuthActions from '#client/actions/Auth.js';

import Box from '#client/components/Box/Box.jsx';
import Card from '#client/components/Card/Card.jsx';
import ErrorMessage from '#client/components/ErrorMessage/ErrorMessage.jsx';
import FooterSaveButton from '#client/components/FooterSaveButton/FooterSaveButton.jsx';
import Link from '#client/components/Link/Link.jsx';
import StaticFooter from '#client/components/StaticFooter/StaticFooter.jsx';
import Text from '#client/components/Text/Text.jsx';
import FormikField, {
  FIELD_THEME_ADOBE,
} from '#client/components/FormikField/FormikField.jsx';

const getFormFields = () => {
  const formFields = [
    {
      id: 'firstName',
      title: 'First Name',
      type: 'short_text',
      validations: ['required'],
    },
    {
      id: 'lastName',
      title: 'Last Name',
      type: 'short_text',
      validations: ['required'],
    },
    {
      id: 'email',
      title: 'Email',
      type: 'email',
      validations: ['required', 'email'],
    },
    {
      id: 'phone',
      title: 'Phone',
      type: 'phone',
      validations: ['required', 'phone'],
    },
    {
      id: 'password',
      title: 'New Password',
      type: 'password',
      validations: ['required'],
    },
    {
      id: 'confirmPassword',
      title: 'Confirm Password',
      type: 'password',
      validations: ['required', 'confirmPassword:password'],
    },
  ];
  return formFields;
};

const SignupForm = ({ referrer, dispatch }) => {
  const { signupApiState = initialApiActionState } = useBranch({
    signupApiState: ['apiState', API_ACTION_SIGNUP, 'default'],
  });

  const location = useLocation();

  const loginRedirect = `/login${location.search}`;
  const errorMessage = signupApiState.error?.message;

  const _onSubmit = (formValues) => {
    dispatch(AuthActions.Signup, {
      ...formValues,
      referrerId: referrer?.id,
    });
  };

  return (
    <>
      <Card>
        <Formik
          initialValues={createInitialValues({
            formFields: getFormFields(),
          })}
          validate={createFormValidationFn(getFormFields())}
          onSubmit={_onSubmit}
          render={(formikBag) => (
            <Form>
              {getFormFields()
                .map((formField, index) =>
                  <FormikField
                    formField={formField}
                    formikBag={formikBag}
                    theme={FIELD_THEME_ADOBE}
                    key={formField.id}
                    margin={index === 0 ? '0' : null}
                  />
                )}
              <StaticFooter>
                <FooterSaveButton
                  isSubmitting={signupApiState.inProgress}
                  buttonText='Sign up'
                />
              </StaticFooter>
            </Form>
          )}
        />
      </Card>
      {errorMessage && (
        <Box
          marginTop='10px'
          borderRadius='3px'
          overflow='hidden'
        >
          <ErrorMessage>
            {errorMessage}
          </ErrorMessage>
        </Box>
      )}
      <Box
        marginTop='26px'
        textAlign='center'
      >
        <Text
          font='greycliff'
          weight='bold'
        >
          Already have an account?
          &nbsp;&nbsp;
          <Link to={loginRedirect} color='blue300'>
            Log In &gt;
          </Link>
        </Text>
      </Box>
    </>
  );
};

SignupForm.propTypes = {
  referrer: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

SignupForm.displayName = 'SignupForm';

export default SignupForm;
