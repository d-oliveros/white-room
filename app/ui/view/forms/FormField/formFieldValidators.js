import typeCheck from '#whiteroom/util/typeCheck.js';

const validators = {
  required: (value) => {
    if (
      typeof value !== 'boolean'
      && typeof value !== 'number'
      && !value
    ) {
      return 'Please fill this in.';
    }

    return undefined;
  },
  email: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::Email', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid email.';
    }
  },
  phone: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::Phone', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid phone number.';
    }
  },
  sameValue: (value, checkValue) => {
    if (!value) {
      return undefined;
    }

    return value !== checkValue ? 'Values do not match.' : undefined;
  },
  differentValue: (value, checkValue) => {
    if (!value) {
      return undefined;
    }

    return String(value) === String(checkValue) ? 'Values must be different' : undefined;
  },
  nonEmptyArray: (value) => {
    if (!value) {
      return undefined;
    }
    try {
      typeCheck('value::NonEmptyArray', value);
      return undefined;
    }
    catch (err) {
      return 'Please fill this in.';
    }
  },
  url: (value) => {
    if (!value) {
      return undefined;
    }
    try {
      typeCheck('value::Url', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid URL. The URL must include either http:// or https://';
    }
  },
};

export function validateFormField({ validations, properties, value, values }) {
  for (const validation of validations || []) {
    const [validatorDef, errorMessage] = validation.split('::');
    const [validatorName, targetFieldId] = validatorDef.split(':');
    const validator = validators[validatorName];
    if (validator) {
      const validatorArgs = [value];
      if (targetFieldId) {
        if (!values) {
          const error = new Error('Tried to cross validate a form field, but no `values` were provided.');
          error.name = 'SrValidateCrossFormFieldNoValuesError';
          error.details = {
            validations,
            validation,
            targetFieldId,
            value,
            values,
          };
          throw error;
        }
        // validatorArgs.push(getIn(values, targetFieldId));
      }
      if (errorMessage) {
        validatorArgs.push(errorMessage);
      }
      const error = validator(...validatorArgs, properties);
      if (error) {
        return errorMessage || error;
      }
    }
  }
}

export function createFormValidationFn(formFields) {
  return (values) => {
    const errors = {};

    formFields.forEach(({ id, validations, properties }) => {
      const error = validateFormField({
        validations,
        properties,
        values,
        // value: getIn(values, id),
      });
      if (error) {
        errors[id] = error;
      }
    });

    return errors;
  };
}

export function hideFieldIf(condition, formField) {
  if (!condition) {
    return formField;
  }
  const newFormFields = (Array.isArray(formField) ? formField : [formField])
    .map((_formField) => ({
      ..._formField,
      title: '',
      label: '',
      type: 'hidden',
      validations: null,
      properties: {},
    }));

  return Array.isArray(formField)
    ? newFormFields
    : newFormFields[0];
}

export function showFieldIf(condition, formField) {
  return hideFieldIf(!condition, formField);
}

export function scrollToFormField({ formFieldId }) {
  const formFieldDOM = global.document && global.document.getElementById(`field-${formFieldId}`);
  if (formFieldDOM) {
    formFieldDOM.scrollIntoView(true);
  }
}

export default validators;
