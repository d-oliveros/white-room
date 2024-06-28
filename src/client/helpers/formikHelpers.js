import dayjs from 'dayjs';
import { getIn, setIn } from 'formik';

import lodashKeyBy from 'lodash/fp/keyBy.js';

import log from '#client/lib/log.js';

import typeCheck from '#common/util/typeCheck.js';
import objectNormalize from '#common/util/objectNormalize.js';
import extractPhoneFromText from '#common/util/extractPhoneFromText.js';
import dayjsWithAustinTimezone from '#common/util/dayjsWithAustinTimezone.js';
import preventDefaultPropagation from '#client/helpers/preventDefaultPropagation.js';
import { isChromeBrowser } from '#common/util/isUserAgentMobileApp.js';

export const validators = {
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
  requiredCheck: (value) => {
    if (!value) {
      return 'Please fill this in.';
    }
    return undefined;
  },
  legal: (value) => {
    if (!value) {
      return 'Please agree to the terms.';
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
  personName: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::PersonName', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid name.';
    }
  },
  streetName: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::StreetName', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid street name.';
    }
  },
  city: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::City', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid city.';
    }
  },
  zipCode: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::ZipCode', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a valid zip code.';
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
  dateOfBirth: (dob) => {
    const dobMoment = dayjs(dob);
    if (
      dob
      && (
        !dobMoment.isValid
        || Math.abs(dobMoment.diff(new Date(), 'years')) < 18
        || Math.abs(dobMoment.diff(new Date(), 'years')) > 100
      )
    ) {
      return 'You must be between 18-100 years old.';
    }
    return undefined;
  },
  json: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::Object', JSON.parse(value));
      return undefined;
    }
    catch (err) {
      return 'Please enter valid json.';
    }
  },
  stringifiedArray: (value) => {
    if (!value) {
      return undefined;
    }

    try {
      typeCheck('value::Array', JSON.parse(value));
      return undefined;
    }
    catch (err) {
      return 'Please enter valid array.';
    }
  },
  noPastDates: (value) => {
    if (!value) {
      return undefined;
    }
    const nowMoment = dayjsWithAustinTimezone().startOf('day');
    const valueMoment = dayjsWithAustinTimezone(value);
    if (valueMoment.isBefore(nowMoment)) {
      return 'Please enter a date in the future.';
    }
    return undefined;
  },
  beforeOrSameThanDate: (value, properties) => {
    if (
      value
      && properties.date
      && !dayjs(value).isSameOrBefore(dayjs(properties.date))
    ) {
      return properties.beforeOrSameThanDateMessage;
    }
    return undefined;
  },
  afterOrSameThanDate: (value, properties) => {
    if (
      value
      && properties.date
      && !dayjs(value).isSameOrAfter(dayjs(properties.date))
    ) {
      return properties.afterThanDateMessage;
    }
    return undefined;
  },
  date: (value) => {
    const valueMoment = dayjs(value);
    if (
      value
      && (
        !valueMoment.isValid
        || valueMoment.year() < 1900
        || valueMoment.year() > 2100
      )
    ) {
      return 'Please enter a valid date.';
    }
    return undefined;
  },
  positiveNumber: (value) => {
    try {
      typeCheck('value::PositiveNumber', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a positive number.';
    }
  },
  positiveNumberString: (value) => {
    try {
      if (typeof value !== 'number') {
        value = parseFloat(value);
      }
      typeCheck('value::PositiveNumber', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a positive number.';
    }
  },
  nonNegativeNumber: (value) => {
    try {
      typeCheck('value::NonNegativeNumber', value);
      return undefined;
    }
    catch (err) {
      return 'Please enter a number greater than or equal to 0.';
    }
  },
  greaterOrEqualTo: (value, properties) => {
    if (
      value
      && properties.threshold
      && value < properties.threshold
    ) {
      return `Please enter a number greater than or equal to ${properties.threshold}.`;
    }
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
  confirmPassword: (value, password) => {
    if (!value) {
      return undefined;
    }

    return value !== password
      ? 'Sorry your passwords do not match.'
      : undefined;
  },
  betweenNumbers: (value, properties) => {
    const { upperLimit, lowerLimit, prefix } = properties;

    if (typeof value !== 'number') {
      return 'Please enter a number.';
    }

    if (value > upperLimit || value < lowerLimit) {
      return `Please enter a value between ${prefix || ''}${lowerLimit} and ${prefix || ''}${upperLimit}.`;
    }
  },
  length: (value, properties) => {
    if (!value) {
      return undefined;
    }
    if (`${value}`.length !== properties.length) {
      return properties.lengthErrorMessage || `Enter a ${properties.length}-digit number.`;
    }
    return undefined;
  },
};

export const serverValidators = {};

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
          error.name = 'ValidateCrossFormFieldNoValuesError';
          error.details = {
            validations,
            validation,
            targetFieldId,
            value,
            values,
          };
          throw error;
        }
        validatorArgs.push(getIn(values, targetFieldId));
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

export async function applyServerValidation({ name, values, args, errorMessage, apiClient, state }) {
  const serverValidator = serverValidators[name];

  if (serverValidator) {
    if (!values) {
      const error = new Error('Tried to apply server sided validation, but no `values` were provided.');
      error.name = 'ValidateServerSidedNoValues';
      error.details = {
        validator: serverValidator,
        values,
      };
      throw error;
    }
    const validatorArgs = {};
    for (const arg of args) {
      validatorArgs[arg] = getIn(values, arg);
    }
    if (errorMessage) {
      validatorArgs.errorMessage = errorMessage;
    }

    try {
      const error = await serverValidator({ ...validatorArgs, apiClient, state });
      if (error) {
        return errorMessage || error;
      }
    }
    catch (error) {
      return error;
    }
  }
}

export function createFormServerValidationFn({ serverValidations, apiClient, state }) {
  return async (values) => {
    const serverValidationErrors = await Promise.all(
      serverValidations.map(async ({ name, args, errorMessage, fieldIdError }) => {
        const error = await applyServerValidation({
          name,
          args,
          values,
          errorMessage,
          apiClient,
          state,
        });
        if (error) {
          return { name, error, fieldIdError };
        }
      })
    );

    const errors = {};

    for (const validationError of serverValidationErrors) {
      if (validationError) {
        const { name, error, fieldIdError } = validationError;
        errors[name] = { error, fieldIdError };
      }
    }
    return errors;
  };
}

export function createFormValidationFn(formFields) {
  return (values) => {
    const errors = {};

    formFields.forEach(({ id, validations, properties }) => {
      const error = validateFormField({
        validations,
        properties,
        values,
        value: getIn(values, id),
      });
      if (error) {
        errors[id] = error;
      }
    });

    return errors;
  };
}

export function validatePasswordConfirm(password, confirmPassword) {
  // TODO (@rumvark) We need to re-write this function to handle onChange
  // and validate to true when the form is pristine.
  const errors = {};
  if (
    password !== confirmPassword
    && password !== ''
    && confirmPassword !== ''
  ) {
    errors.confirmPassword = 'Passswords do not match.';
  }
  if (password === '') {
    errors.password = 'Please provide a valid password';
  }
  if (confirmPassword === '') {
    errors.confirmPassword = 'Please provide a valid confirm password';
  }

  return errors;
}

export function createInitialValues({ formFields, defaultValues = {} }) {
  typeCheck('formFields::Array', formFields);
  return formFields.reduce((memo, field) => {
    // "formFields" may have nested field IDs, whereas "defaultValues" usually has the full structure.
    // Using "getIn" to get the value at the complex path.
    const targetValue = getIn(defaultValues, field.id);
    const defaultValue = field.type === 'checkbox'
      ? false
      : ((
        (field.type === 'multiple_choice' && field.properties?.multipleSelection)
        || ['tags', 'text_list'].includes(field.type)
      ) ? []
        : ''
      );
    const targetValueWithDefault = typeof targetValue === 'boolean' || typeof targetValue === 'number'
      ? targetValue
      : targetValue || defaultValue;
    return setIn(memo, field.id, targetValueWithDefault);
  }, {});
}

/**
 * Gets the next required form field that hasn't been filled up yet.
 * If all the required form fields have been filled, the first form field is returned.
 *
 * @param  {Array}  options.formFields Form field definitions.
 * @param  {Object} options.values     Form values, the form's completion state.
 * @return {Object|null}
 */
export function getNextPendingRequiredFormField({ formFields, values }) {
  typeCheck('formFields::Array', formFields);
  typeCheck('values::Maybe Object', values);
  const result = {
    firstFormField: formFields && formFields[0] || null,
    nextFormField: null,
    lastFormField: null,
  };
  if (!values) {
    result.nextFormField = formFields[0] || null;
    return result;
  }
  for (const formField of formFields) {
    if (
      formField.validations
      && formField.validations.includes('required')
      && typeof getIn(values, formField.id) !== 'boolean'
      && typeof getIn(values, formField.id) !== 'number'
      && !getIn(values, formField.id)
    ) {
      result.nextFormField = formField;
      break;
    }
    if (
      typeof getIn(values, formField.id) === 'boolean'
      || typeof getIn(values, formField.id) === 'number'
      || getIn(values, formField.id)
    ) {
      result.lastFormField = formField;
    }
  }
  return result;
}

/**
 * Gets the root field ID for a given complex field.
 *
 * @param  {string} fieldId Simple or complex field ID.
 * @return {string}         Root field ID.
 */
export function getRootFieldId(fieldId) {
  const bracketIndex = fieldId.indexOf('[');
  const dotIndex = fieldId.indexOf('.');
  if (bracketIndex > -1 && dotIndex > -1) {
    return bracketIndex > dotIndex
      ? fieldId.split('.')[0]
      : fieldId.split('[')[0];
  }
  if (bracketIndex > -1) {
    return fieldId.split('[')[0];
  }
  if (dotIndex > -1) {
    return fieldId.split('.')[0];
  }
  return fieldId;
}

export function handleOnChangePhone(formikBag, fieldKey) {
  return function (event) {
    if (!event) {
      return;
    }

    // Allow copy-pasting formatted phone strings.
    const extractedPhone = extractPhoneFromText(event.target.value, {
      strictNumbersLength: true,
    });

    if (
      extractedPhone
      || (
        !isNaN(Number(event.target.value))
        && event.target.value.length <= 10
      )
    ) {
      if (formikBag) {
        formikBag.setFieldValue(fieldKey, extractedPhone || event.target.value);
      }
    }
  };
}

export function handleNumberChange(formikBag, fieldKey) {
  return function (event) {
    if (!event || !formikBag || !fieldKey) {
      return;
    }
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      formikBag.setFieldValue(fieldKey, parseFloat(event.target.value));
    }
    else {
      formikBag.setFieldValue(fieldKey, '');
    }
  };
}

export function handleVerificationCodeChange(formikBag, fieldKey) {
  return function (event) {
    if (!event) {
      return;
    }
    if (
      !isNaN(Number(event.target.value))
      && event.target.value.length <= 4
    ) {
      if (formikBag) {
        formikBag.setFieldValue(fieldKey, event.target.value);
      }
    }
  };
}

export function handleCardNumberChange(formikBag, formfield) {
  return function (event) {
    if (!event) {
      return;
    }
    if (
      !isNaN(Number(event.target.value))
      && event.target.value.length <= formfield.properties.length
    ) {
      if (formikBag) {
        formikBag.setFieldValue(formfield.id, event.target.value);
      }
    }
  };
}

export function handleCardCVCChange(formikBag, formfield) {
  return function (event) {
    if (!event) {
      return;
    }
    if (
      !isNaN(Number(event.target.value))
      && event.target.value.length <= formfield.properties.length
    ) {
      if (formikBag) {
        formikBag.setFieldValue(formfield.id, event.target.value);
      }
    }
  };
}

export function handleSsnChange(formikBag, formfield) {
  return function (event) {
    if (!event) {
      return;
    }
    if (
      !isNaN(Number(event.target.value))
    ) {
      if (formikBag) {
        formikBag.setFieldValue(formfield.id, event.target.value);
        if (formfield.properties && formfield.properties.onChange) {
          formfield.properties.onChange(event);
        }
      }
    }
  };
}

export function handleZipCodeChange(formikBag, formfield) {
  return function (event) {
    if (!event) {
      return;
    }
    if (
      !isNaN(Number(event.target.value))
      && event.target.value.length <= 5
    ) {
      if (formikBag) {
        formikBag.setFieldValue(formfield.id, event.target.value);
        if (formfield.properties && formfield.properties.onChange) {
          formfield.properties.onChange(event);
        }
      }
    }
  };
}

export function handlePetCountChange(formikBag) {
  return function (event) {
    if (!event) {
      return;
    }
    const petCount = parseInt(event.target.value, 10);
    if (!isNaN(petCount)) {
      if (formikBag) {
        formikBag.setFieldValue('petCount', petCount);
        if (Array.isArray(formikBag.values.pets)) {
          formikBag.setFieldValue('pets', formikBag.values.pets.slice(0, petCount));
        }
      }
    }
  };
}

export function handleVehicleCountChange(formikBag) {
  return function (event) {
    if (!event) {
      return;
    }
    const vehicleCount = parseInt(event.target.value, 10);
    if (!isNaN(vehicleCount)) {
      if (formikBag) {
        formikBag.setFieldValue('vehicleCount', vehicleCount);
        if (Array.isArray(formikBag.values.vehicles)) {
          formikBag.setFieldValue('vehicles', formikBag.values.vehicles.slice(0, vehicleCount));
        }
      }
    }
  };
}

export function handleChildrenCountChange(formikBag) {
  return function (event) {
    if (!event) {
      return;
    }
    const childrenCount = parseInt(event.target.value, 10);
    if (!isNaN(childrenCount)) {
      if (formikBag) {
        formikBag.setFieldValue('childrenCount', childrenCount);
        if (Array.isArray(formikBag.values.children)) {
          formikBag.setFieldValue('children', formikBag.values.children.slice(0, childrenCount));
        }
      }
    }
  };
}

export function transformStringToBoolean(string) {
  if (typeof string === 'boolean') {
    return string;
  }
  if (string === 'true') {
    return true;
  }
  if (string === 'false') {
    return false;
  }
  return null;
}

export function transformBooleanToYesNo(booleanOrString) {
  const boolean = transformStringToBoolean(booleanOrString);
  // Avoid converting `null` to `no`.
  if (typeof boolean !== 'boolean') {
    return null;
  }
  return boolean ? 'yes' : 'no';
}

/**
 * Transforms raw form values to display-friendly form values.
 *
 * @param  {Object} options.formField Form field definition.
 * @param  {*}      options.value     Form field value.
 * @return {*}                        Display-friendly form value.
 */
export function getFormValueDisplay({ formField, value }) {
  typeCheck('formField::NonEmptyObject', formField);
  const properties = formField.properties || {};

  // Transform true/false to yes/no.
  let formValueDisplay = transformBooleanToYesNo(value) || value;

  // Transform date objects to date strings.
  if (formValueDisplay && formField.type.includes('date')) {
    const dateFormat = properties.dateFormat || 'LLLL';
    formValueDisplay = dayjs(formValueDisplay).format(dateFormat);
  }
  return formValueDisplay || '--';
}

export function withErrorReporter(func) {
  typeCheck('func::Function', func);
  return async (...args) => {
    try {
      await func(...args);
    }
    catch (error) {
      log.error(error);
      if (typeof global.alert === 'function') {
        global.alert(error.message);
      }
    }
  };
}

export function getTextInputFieldAttributes({ formField, formikBag, userAgent }) {
  const properties = formField.properties || {};
  const fieldAttributes = {
    name: formField.id,
    onKeyPress: properties.onKeyPress,
    autoFocus: properties.autoFocus,
    disabled: properties.disabled,
    className: properties.className,
    placeholder: properties.placeholder,
    type: 'text',
    step: properties.step,
    pattern: properties.pattern,
    style: properties.style,
    onBlur: () => {
      if (formikBag) {
        if (formikBag.values && typeof formikBag.values[formField.id] === 'string') {
          const sanitizedStringValue = formikBag.values[formField.id]
            .replace(/\s+/g, ' ')
            .trim();
          formikBag.setFieldValue(formField.id, sanitizedStringValue);
        }
        formikBag.setFieldTouched(formField.id);
      }
    },
  };

  if (userAgent) {
    // Based on https://stackoverflow.com/questions/15738259/disabling-chrome-autofill/15917221#15917221
    fieldAttributes.autoComplete = isChromeBrowser(userAgent) ? 'chrome-off' : 'off';
  }

  if (properties.onChange) {
    fieldAttributes.onChange = properties.onChange;
  }

  if (properties.onlyAcceptNumbers) {
    fieldAttributes.onChange = handleNumberChange(formikBag, formField.id);
  }

  if (properties.focusInputOnClickContainer) {
    fieldAttributes.onClick = (e) => {
      preventDefaultPropagation(e);
      if (properties.onClick) {
        properties.onClick(e);
      }
    };
  }

  if (formField.type === 'phone') {
    fieldAttributes.onChange = handleOnChangePhone(formikBag, formField.id);
    fieldAttributes.type = 'tel';
  }

  if (formField.type === 'verification_code') {
    fieldAttributes.onChange = handleVerificationCodeChange(formikBag, formField.id);
  }

  if (formField.type === 'ssn') {
    fieldAttributes.onChange = handleSsnChange(formikBag, formField);
  }

  if (formField.type === 'zipCode') {
    fieldAttributes.onChange = handleZipCodeChange(formikBag, formField);
    fieldAttributes.type = 'tel';
  }

  if (formField.type === 'card_number') {
    fieldAttributes.onChange = handleCardNumberChange(formikBag, formField);
    fieldAttributes.type = 'tel';
  }

  if (formField.type === 'card_cvc') {
    fieldAttributes.onChange = handleCardCVCChange(formikBag, formField);
    fieldAttributes.type = 'tel';
  }

  if (formField.type === 'number') {
    fieldAttributes.type = 'number';
  }

  if (formField.type === 'email') {
    fieldAttributes.type = 'email';
  }

  return fieldAttributes;
}

export function trimStringValues(values) {
  if (typeof values !== 'object' || !values) {
    return values;
  }
  const sanitizedValues = {};
  for (const key of Object.keys(values)) {
    sanitizedValues[key] = typeof values[key] === 'string'
      ? values[key].trim()
      : values[key];
  }
  return sanitizedValues;
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

export function createFormFieldsByIdGetter(formFields) {
  typeCheck('formFields::Array', formFields);
  const formFieldsById = lodashKeyBy('id', formFields);

  return (formFieldIds) => {
    if (typeof formFieldIds === 'string') {
      return formFieldsById[formFieldIds];
    }

    typeCheck('formFieldIds::Array', formFieldIds);
    return formFieldIds.map((id) => formFieldsById[id]).filter((formField) => formField);
  };
}

export function getValidFormValues({ formFields, values }) {
  typeCheck('formFields::Array', formFields);
  typeCheck('values::Object', values);

  const validFormValues = formFields.filter((formField) => {
    return !validateFormField({
      validations: formField.validations,
      properties: formField.properties,
      value: getIn(values, formField.id),
      values: values,
    });
  }).reduce((memo, formField) => {
    const rootFieldId = getRootFieldId(formField.id);
    const formFieldValue = objectNormalize({
      [rootFieldId]: values[rootFieldId],
    });
    return {
      ...memo,
      ...formFieldValue,
    };
  }, {});

  return validFormValues;
}

export function scrollToFormField({ formFieldId }) {
  const formFieldDOM = global.document && global.document.getElementById(`field-${formFieldId}`);
  if (formFieldDOM) {
    formFieldDOM.scrollIntoView(true);
  }
}

export function validateFormFieldsAndSubmit({ formikBag, formFields }) {
  const formValues = formikBag.values;
  const formErrors = createFormValidationFn(formFields)(formValues);
  const formFieldIdsWithErrors = Object.keys(formErrors);

  if (!formFieldIdsWithErrors.length) {
    formikBag.handleSubmit();
  }
  else {
    formFieldIdsWithErrors.forEach((formFieldId) => {
      formikBag.setFieldTouched(formFieldId, true, true);
    });
    scrollToFormField({
      formFieldId: formFieldIdsWithErrors[0],
    });
  }
}

export function getFormikBagObjectStorybook({
  values = {},
  initialValues = {},
}) {
  return {
    values: values,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
    isValid: false,
    initialValues: initialValues,
    setFieldValue: () => {},
    setFieldTouched: () => {},
  };
}
