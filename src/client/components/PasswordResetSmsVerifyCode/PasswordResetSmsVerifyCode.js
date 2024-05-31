import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import client from '@${module}/helpers/formikHelpers';
import common from '@${module}/formatters';
import client from '@${module}/core/branch.js';

import ButtonDeprecated, {
  BUTTON_THEME_YELLOW,
} from '#client/components/ButtonDeprecated/ButtonDeprecated.js';

import client from '@${module}/components/FormikField/FormikField.js';

function getFormFields({
  phone,
}) {
  return [
    {
      id: 'code',
      type: 'verification_code',
      title: 'Enter your 4-digit code',
      label: `We just texted you the code to ${formatPhoneNumber(phone)}`,
      properties: {
        placeholder: '1234',
      },
      validations: ['required'],
    },
  ];
}

@branch({
  phone: ['resetPasswordForm', 'phone'],
})
class PasswordResetSmsVerifyCode extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    phone: PropTypes.string.isRequired,
  };

  render() {
    const {
      onSubmit,
      phone,
    } = this.props;
    const formFields = getFormFields({
      phone,
    });
    return (
      <Formik
        enableReinitialize
        initialValues={createInitialValues({
          formFields: formFields,
        })}
        validateOnChange={false}
        validate={createFormValidationFn(formFields)}
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
                next: reset password
              </ButtonDeprecated>
            </Form>
          );
        }}
      />
    );
  }
}

export default PasswordResetSmsVerifyCode;
