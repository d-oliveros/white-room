import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import {
  createFormValidationFn,
  createInitialValues,
} from '#white-room/client/helpers/formikHelpers.js';

import Button, {
  BUTTON_THEME_ADOBE_YELLOW,
} from '#base/view/components/Button/Button.jsx';

import FormikField from '#base/view/components/FormikField/FormikField.jsx';

const getFormFields = ({ activatingAccount }) => {
  return [
    {
      id: 'phone',
      type: 'phone',
      title: (
        activatingAccount
          ? 'Enter your phone to activate your account'
          : 'Enter your phone to reset your password'
      ),
      label: 'We\'ll text you a code to verify this number.',
      properties: {
        placeholder: '5121234567',
      },
      validations: ['required', 'phone'],
    },
  ];
};

class PasswordResetSmsForm extends Component {
  static propTypes = {
    activatingAccount: PropTypes.bool,
    prefillPhone: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
  };

  render() {
    const { activatingAccount, prefillPhone } = this.props;
    const initialValues = createInitialValues({
      formFields: getFormFields({ activatingAccount }),
      defaultValues: {
        phone: prefillPhone && prefillPhone.length === 10
          ? prefillPhone
          : '',
      },
    });

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validateOnChange={false}
        validate={createFormValidationFn(getFormFields({ activatingAccount }))}
        onSubmit={this.props.onSubmit}
        render={(formikBag) => {
          return (
            <Form>
              {getFormFields({ activatingAccount }).map((formField) => (
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
                next: enter code
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

export default PasswordResetSmsForm;
