import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import {
  createInitialValues,
  validatePasswordConfirm,
} from '#client/helpers/formikHelpers.js';

import ButtonDeprecated, {
  BUTTON_THEME_YELLOW,
} from '#client/components/ButtonDeprecated/ButtonDeprecated.jsx';
import FormikField from '#client/components/FormikField/FormikField.jsx';

const formFields = [
  {
    id: 'password',
    type: 'password',
    title: 'Create your new password',
    autoComplete: 'false',
    properties: {
      autoComplete: 'false',
      placeholder: 'New password',
    },
    placeholder: 'new password',
    validations: ['required'],
  },
  {
    id: 'confirmPassword',
    type: 'password',
    autoComplete: 'off',
    properties: {
      autoComplete: 'false',
      placeholder: 'Confirm password',
    },
    placeholder: 'confirm new password',
    validations: ['required'],
  },
];

class PasswordResetConfirmForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    locationQuery: PropTypes.object.isRequired,
  };

  render() {
    const {
      onSubmit,
      locationQuery,
    } = this.props;

    return (
      <Formik
        enableReinitialize
        initialValues={createInitialValues({ formFields })}
        validateOnChange={false}
        validate={(values) => {
          return validatePasswordConfirm(values.password, values.confirmPassword);
        }}
        onSubmit={onSubmit}
        render={(formikBag) => {
          return (
            <Form>
              {formFields.map((formField) => (
                <FormikField
                  key={formField.id}
                  formField={formField}
                  formikBag={formikBag}
                />
              ))}
              <ButtonDeprecated
                type='submit'
                theme={BUTTON_THEME_YELLOW}
              >
                {locationQuery.userName && locationQuery.listingAddress ? 'see my tour' : 'log back in'}
              </ButtonDeprecated>
            </Form>
          );
        }}
      />
    );
  }
}

PasswordResetConfirmForm.displayName = 'PasswordResetConfirmForm';

export default PasswordResetConfirmForm;
