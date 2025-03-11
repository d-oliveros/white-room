import type { FieldValues, FieldPath, ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import type { AddressParsedWithLocationDto } from '@namespace/address-helpers';
import type { ValidationRule } from './formValidators';

import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, Label, Checkbox } from 'flowbite-react';
import FormFieldAddressAutoComplete from '../FormFieldAddressAutocomplete/FormFieldAddressAutocomplete';
import validators from './formValidators';

// Enhanced type definitions
export type BaseFieldProperties = {
  placeholder?: string;
  autocomplete?: string;
  label?: string;
  labelClassName?: string;
};

export type TextFieldProperties = BaseFieldProperties & {
  minLength?: number;
  maxLength?: number;
};

export type NumberFieldProperties = BaseFieldProperties & {
  min?: number;
  max?: number;
  step?: number;
};

export type AddressFieldProperties = BaseFieldProperties & {
  apiKey?: string;
  country?: string;
};

export type FieldProperties = TextFieldProperties | NumberFieldProperties | AddressFieldProperties;

export type FieldType = {
  email: TextFieldProperties;
  short_text: TextFieldProperties;
  phone: TextFieldProperties;
  password: TextFieldProperties;
  number: NumberFieldProperties;
  checkbox: BaseFieldProperties;
  address_autocomplete: AddressFieldProperties;
  hidden: BaseFieldProperties;
};

export type FormFieldType = {
  id: string;
  title?: string;
  type: keyof FieldType;
  properties?: FieldType[keyof FieldType];
  required?: boolean;
  validations?: ValidationRule[];
  onChange?: (value: unknown) => void;
};

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  formField: FormFieldType;
  control?: UseFormReturn<TFieldValues>['control'];
}

interface CommonProps {
  id: string;
  required: boolean;
  color: 'failure' | 'gray';
  helperText: string;
}

interface FieldRendererProps {
  field: ControllerRenderProps;
  commonProps: CommonProps;
  properties: FieldType[keyof FieldType];
  labelEl?: React.ReactNode;
  formContext: ReturnType<typeof useFormContext>;
  formField: FormFieldType;
}

// Utility functions
const shouldRenderLabel = (formField: FormFieldType): boolean =>
  formField.type !== 'checkbox' && formField.type !== 'hidden';

const isHidden = (formField: FormFieldType): boolean => formField.type === 'hidden';

const getFormFieldValidations = (formField: FormFieldType): ValidationRule[] => {
  const validations = new Set<ValidationRule>(formField.validations || []);

  if (formField.required) {
    validations.add('required');
  }

  // Add type-specific validations
  switch (formField.type) {
    case 'email':
      validations.add('email');
      break;
    case 'phone':
      validations.add('phone');
      break;
    case 'number':
      validations.add('number');
      break;
  }

  return Array.from(validations);
};

// Enhanced field renderers with better typing and accessibility
const TextFieldRenderer = ({ field, commonProps, properties }: FieldRendererProps) => (
  <TextInput
    {...commonProps}
    type="text"
    {...field}
    placeholder={properties.placeholder}
    autoComplete={properties.autocomplete}
    maxLength={(properties as TextFieldProperties).maxLength}
    helperText={commonProps.helperText}
    shadow
    data-testid={`text-input-${field.name}`}
  />
);

const EmailFieldRenderer = ({ field, commonProps, properties }: FieldRendererProps) => (
  <TextInput
    {...field}
    {...commonProps}
    type="email"
    placeholder={properties.placeholder}
    autoComplete={properties.autocomplete || 'email'}
    shadow
    data-testid={`email-input-${field.name}`}
  />
);

const CheckboxFieldRenderer = ({ field, commonProps, labelEl, formField }: FieldRendererProps) => (
  <div className="flex items-center gap-2">
    <Checkbox
      {...field}
      id={commonProps.id}
      checked={field.value}
      onChange={(e) => {
        field.onChange(e.target.checked);
        formField.onChange?.(e.target.checked);
      }}
      data-testid={`checkbox-${field.name}`}
    />
    {labelEl}
  </div>
);

const AddressFieldRenderer = ({ field, formContext }: FieldRendererProps) => {
  const handleAddressChange = (address: AddressParsedWithLocationDto | null) => {
    field.onChange(address?.display ?? null);

    if (address) {
      const addressFields = {
        streetNumber: address.streetNumber,
        streetPrefix: address.streetPrefix,
        streetName: address.streetName,
        streetSuffix: address.streetSuffix,
        unitNumber: address.unitNumber ?? '',
        city: address.city,
        stateCode: address.stateCode,
        zip: address.zip,
        latitude: address.latitude,
        longitude: address.longitude,
      } as const;

      Object.entries(addressFields).forEach(([key, value]) => {
        formContext.setValue(key as keyof typeof addressFields, value);
      });

      // Focus on the file number field after address is selected
      setTimeout(() => {
        // Try to find the file number input field by its ID
        const fileNumberField = document.getElementById('fileNumber');
        if (fileNumberField) {
          fileNumberField.focus();
        } else {
          // As a fallback, try to find it by attribute
          const fileNumberInput = document.querySelector('input[name="fileNumber"]');
          if (fileNumberInput instanceof HTMLElement) {
            fileNumberInput.focus();
          }
        }
      }, 100); // Slightly longer timeout to ensure the DOM is updated
    } else {
      const emptyFields = [
        'streetNumber',
        'streetPrefix',
        'streetName',
        'streetSuffix',
        'unitNumber',
        'display',
        'city',
        'stateCode',
        'zip',
        'latitude',
        'longitude',
      ];

      emptyFields.forEach((fieldName) => {
        formContext.setValue(fieldName, '');
      });
    }
  };

  return (
    <FormFieldAddressAutoComplete
      value={field.value}
      onChange={handleAddressChange}
      data-testid={`address-input-${field.name}`}
    />
  );
};

// Type-safe field renderer mapping
const FIELD_RENDERERS: Record<keyof FieldType, (props: FieldRendererProps) => JSX.Element> = {
  email: EmailFieldRenderer,
  short_text: TextFieldRenderer,
  phone: (props) => <TextFieldRenderer {...props} field={{ ...props.field, type: 'tel' }} />,
  password: (props) => (
    <TextFieldRenderer {...props} field={{ ...props.field, type: 'password' }} />
  ),
  number: (props) => <TextFieldRenderer {...props} field={{ ...props.field, type: 'number' }} />,
  checkbox: CheckboxFieldRenderer,
  address_autocomplete: AddressFieldRenderer,
  hidden: () => <div />,
};

const FormField = ({ formField }: FormFieldProps) => {
  const formContext = useFormContext<FieldValues>();
  const validations = getFormFieldValidations(formField);

  const validationRules = {
    validate:
      validations.length > 0
        ? Object.assign(
            {},
            ...validations.map((key) => ({ [key]: validators[key as keyof typeof validators] })),
          )
        : undefined,
  };

  const labelEl = formField.title ? <Label htmlFor={formField.id} value={formField.title} /> : null;

  const renderField = ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<FieldValues, FieldPath<FieldValues>>;
    fieldState: {
      invalid: boolean;
      error?: { message?: string };
    };
  }) => {
    const commonProps: CommonProps = {
      id: formField.id,
      required: validations.includes('required'),
      color: fieldState.invalid ? 'failure' : 'gray',
      helperText: fieldState.error?.message ?? '',
    };

    const properties = formField.properties || {};
    const renderer = FIELD_RENDERERS[formField.type as keyof typeof FIELD_RENDERERS];

    if (!renderer) {
      return <div>Unsupported field type: {formField.type}</div>;
    }

    return renderer({ field, commonProps, properties, labelEl, formContext, formField });
  };

  return (
    <Controller
      name={formField.id}
      control={formContext.control}
      rules={validationRules}
      render={renderField}
    />
  );
};

const FormFieldContainer = ({ formField }: FormFieldProps) => {
  if (isHidden(formField)) {
    return null;
  }

  const labelEl = formField.title ? (
    <Label
      htmlFor={formField.id}
      value={formField.title}
      className={`text-[21px] font-semibold ${formField.properties?.labelClassName || ''}`}
    />
  ) : null;

  return (
    <div id={`field-${formField.id}`} className="mb-2 first:pt-2">
      {shouldRenderLabel(formField) && <div className="mb-2 block">{labelEl}</div>}
      <FormField formField={formField} />
    </div>
  );
};

export default FormFieldContainer;
