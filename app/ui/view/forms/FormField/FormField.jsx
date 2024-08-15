import React from 'react';
import PropTypes from 'prop-types';
import lodashPick from 'lodash/fp/pick.js';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, Label, Checkbox } from 'flowbite-react';

import validators from './formFieldValidators.js';

const getFormFieldValidations = (formField) => {
  const validations = [...(formField?.validations || [])];

  switch (formField.type) {
    case 'email': {
      validations.push('email');
      break;
    }
    case 'phone': {
      validations.push('phone');
      break;
    }
  }
  return validations;
};

const FormField = ({ formField }) => {
  const { control } = useFormContext();
  const validations = getFormFieldValidations(formField);

  const validationRules = {
    validate: validations.length > 0
      ? lodashPick(validations, validators)
      : null,
    // validate: formField.validations
    //   ? formField.validations.reduce((acc, validationName) => {
    //       if (validatorsMap[validationName]) {
    //         acc[validationName] = validatorsMap[validationName];
    //       }
    //       return acc;
    //     }, {})
    //   : null,
  };

  const labelEl = (
    <Label htmlFor={formField.id} value={formField.title} />
  );

  const renderField = ({ field, fieldState }) => {
    const commonProps = {
      id: formField.id,
      required: validations.includes('required'),
      color: fieldState.invalid ? 'failure' : 'gray',
    };

    switch (formField.type) {
      case 'email':
      case 'text':
      case 'phone':
      case 'password':
        return (
          <TextInput
            {...field}
            {...commonProps}
            type={formField.type}
            placeholder={formField.properties.placeholder}
            autoComplete={formField.properties.autocomplete}
            helperText={fieldState.error ? fieldState.error.message : ''}
            shadow
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              {...field}
              id={formField.id}
              checked={field.value}
            />
            {labelEl}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id={`field-${formField.id}`} className="form-field">
      {formField.type !== 'checkbox' && (
        <div className="mb-2 block">
          {labelEl}
        </div>
      )}
      <Controller
        name={formField.id}
        control={control}
        rules={validationRules}
        render={renderField}
      />
    </div>
  );
};

FormField.propTypes = {
  formField: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      placeholder: PropTypes.string,
      autocomplete: PropTypes.string,
      label: PropTypes.string,
    }),
    required: PropTypes.bool,
    validations: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default FormField;
