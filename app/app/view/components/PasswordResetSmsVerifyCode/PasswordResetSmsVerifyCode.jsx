import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import {
formatPhoneNumber,
} from '#white-room/server/lib/formatters.js';

import {
  createInitialValues,
  createFormValidationFn,
} from '#white-room/client/helpers/formikHelpers.js';

import useBranch from '#white-room/client/hooks/useBranch.js';

import Button, {
  BUTTON_THEME_ADOBE_YELLOW,
} from '#app/view/components/Button/Button.jsx';

import FormikField from '#app/view/components/FormikField/FormikField.jsx';

const getFormFields = ({ phone })  => [
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

const PasswordResetSmsVerifyCode = ({ onSubmit, phone }) => {
  const { phone: branchPhone } = useBranch({
    phone: ['resetPasswordForm', 'phone'],
  });

  const formFields = getFormFields({
    phone: branchPhone || phone,
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
    >
      {(formikBag) => (
        <Form>
          {formFields.map((formField) => (
            <FormikField
              key={formField.id}
              formField={formField}
              formikBag={formikBag}
            />
          ))}
          <Button
            type='submit'
            theme={BUTTON_THEME_ADOBE_YELLOW}
          >
            next: reset password
          </Button>
        </Form>
      )}
    </Formik>
  );
};

PasswordResetSmsVerifyCode.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  phone: PropTypes.string.isRequired,
};

export default PasswordResetSmsVerifyCode;
