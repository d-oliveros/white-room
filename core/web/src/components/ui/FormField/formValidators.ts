import { State } from '@namespace/address-helpers';

const validators = {
  required: (value: unknown): string | undefined => {
    if (typeof value !== 'boolean' && typeof value !== 'number' && !value) {
      return 'Please fill this in.';
    }

    return undefined;
  },
  email: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email.';
    }

    return undefined;
  },
  zipcode: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const zipcodeRegex = /^\d{5}$/;
    if (!zipcodeRegex.test(value)) {
      return 'Please enter a valid 5-digit ZIP code.';
    }

    return undefined;
  },
  latitude: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const lat = Number(value);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return 'Please enter a valid latitude between -90 and 90.';
    }

    return undefined;
  },
  longitude: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const lng = Number(value);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return 'Please enter a valid longitude between -180 and 180.';
    }

    return undefined;
  },
  stateCode: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const stateCodeRegex = /^[A-Z]{2}$/;
    if (!stateCodeRegex.test(value)) {
      return 'Please enter a valid 2-letter state code (e.g. CA, NY).';
    }

    if (!Object.values(State).includes(value as State)) {
      return 'Please enter a valid US state code.';
    }

    return undefined;
  },
  phone: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number.';
    }

    return undefined;
  },
  number: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      return 'Please enter a valid number.';
    }

    return undefined;
  },
  sameValue: (value: unknown, checkValue: unknown): string | undefined => {
    if (!value) {
      return undefined;
    }

    return value !== checkValue ? 'Values do not match.' : undefined;
  },
  differentValue: (value: unknown, checkValue: unknown): string | undefined => {
    if (!value) {
      return undefined;
    }

    return String(value) === String(checkValue) ? 'Values must be different' : undefined;
  },
  nonEmptyArray: (value: unknown[]): string | undefined => {
    if (!value) {
      return undefined;
    }
    if (!Array.isArray(value) || value.length === 0) {
      return 'Please fill this in.';
    }
    return undefined;
  },
  url: (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }
    try {
      new URL(value);
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      return undefined;
    } catch (e) {
      return 'Please enter a valid URL. The URL must include either http:// or https://';
    }
  },
};

interface FormField {
  title: string;
  label: string;
  type: string;
  validations: string[] | null;
  properties: Record<string, unknown>;
}

export function hideFieldIf(
  condition: boolean,
  formField: FormField | FormField[],
): FormField | FormField[] {
  if (!condition) {
    return formField;
  }
  const newFormFields = (Array.isArray(formField) ? formField : [formField]).map((_formField) => ({
    ..._formField,
    title: '',
    label: '',
    type: 'hidden',
    validations: null,
    properties: {},
  }));

  return Array.isArray(formField) ? newFormFields : newFormFields[0];
}

export function showFieldIf(
  condition: boolean,
  formField: FormField | FormField[],
): FormField | FormField[] {
  return hideFieldIf(!condition, formField);
}

export function scrollToFormField({ formFieldId }: { formFieldId: string }): void {
  const formFieldDOM =
    typeof document !== 'undefined' && document.getElementById(`field-${formFieldId}`);
  if (formFieldDOM) {
    formFieldDOM.scrollIntoView(true);
  }
}

export type ValidationRule = keyof typeof validators;

export default validators;
