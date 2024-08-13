import React from 'react';
import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, Label, Checkbox } from 'flowbite-react';

const FormField = ({ formField }) => {
  const { control } = useFormContext();

  const labelEl = (
    <Label htmlFor={formField.id} value={formField.title} />
  )

  // Automatically add email pattern if the type is 'email'
  const validationRules = {
    required: formField.required,
    pattern: formField.type === 'email'
      ? /.*@.*\..*$/
      : formField.pattern,
  };

  const renderField = ({ field, fieldState }) => {
    const commonProps = {
      id: formField.id,
      required: formField.required,
      color: fieldState.invalid ? 'failure' : 'gray',
    };

    switch (formField.type) {
      case 'email':
      case 'text':
      case 'password':
        return (
          <TextInput
            {...field}
            {...commonProps}
            type={formField.type}
            placeholder={formField.properties.placeholder}
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
    <div className="form-field">
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
    type: PropTypes.oneOf(['email', 'text', 'checkbox']).isRequired,
    properties: PropTypes.shape({
      placeholder: PropTypes.string,
      label: PropTypes.string,
    }),
    required: PropTypes.bool,
    pattern: PropTypes.string,
  }).isRequired,
};

export default FormField;
