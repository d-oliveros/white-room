import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import { createFormValidationFn, createInitialValues } from '#client/helpers/formikHelpers';

import ButtonDeprecated, {
  BUTTON_THEME_YELLOW,
} from '#client/components/ButtonDeprecated/ButtonDeprecated.js';
import FormikField from '#client/components/FormikField/FormikField.js';

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
              <ButtonDeprecated
                type='submit'
                theme={BUTTON_THEME_YELLOW}
              >
                next: enter code
              </ButtonDeprecated>
            </Form>
          );
        }}
      />
    );
  }
}

PasswordResetSmsForm.displayName = 'PasswordResetSmsForm';

export default PasswordResetSmsForm;
