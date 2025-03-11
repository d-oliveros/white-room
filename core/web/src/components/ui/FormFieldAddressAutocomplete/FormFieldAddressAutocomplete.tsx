import type { SingleValue } from 'react-select';
import type { AddressParsedWithLocationDto } from '@namespace/address-helpers';
import AsyncSelect from 'react-select/async';
import { createLogger } from '@namespace/logger';
import { debounce } from '@namespace/util';
import { getGoogleAutocomplete } from '@namespace/api-client';

const logger = createLogger('FormFieldAddressAutocomplete');

interface AddressOption {
  value: string;
  label: string;
  address: AddressParsedWithLocationDto;
}

interface FormFieldAddressAutoCompleteProps {
  onChange?: (address: AddressParsedWithLocationDto | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  value?: string;
  id?: string;
}

const loadAddressOptions = async (inputValue: string): Promise<AddressOption[]> => {
  if (inputValue.length < 3) return [];

  try {
    const { data } = await getGoogleAutocomplete({
      searchTerm: inputValue,
    });

    return data?.suggestions.map((address) => ({
      value: address.display,
      label: address.display,
      address: address as AddressParsedWithLocationDto,
    }));
  } catch (error) {
    logger.error(error);
    return [];
  }
};

const debouncedLoadOptions = debounce(loadAddressOptions, 250);

const FormFieldAddressAutoComplete = ({
  onChange,
  placeholder = 'search address...',
  isDisabled = false,
  value,
  id = 'addressInput',
}: FormFieldAddressAutoCompleteProps) => {
  const handleChange = (newValue: SingleValue<AddressOption>) => {
    onChange?.(newValue?.address ?? null);

    // If an address was selected, focus on the file number field
    if (newValue?.address) {
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
    }
  };

  return (
    <AsyncSelect<AddressOption>
      inputId={id}
      cacheOptions
      defaultOptions={false}
      loadOptions={debouncedLoadOptions}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      value={value ? { value, label: value, address: {} as AddressParsedWithLocationDto } : null}
      isClearable
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: 'rgb(249, 250, 251)',
          height: '42px',
          borderRadius: '8px',
          borderColor: 'rgb(209, 213, 219)',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'rgb(156, 163, 175)',
          },
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          fontSize: '14px',
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          fontSize: '14px',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: () => ({
          display: 'none',
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          marginTop: '4px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '8px',
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isFocused ? 'rgba(59, 130, 246, 0.1)' : 'white',
          color: 'rgb(17, 24, 39)',
          fontSize: '14px',
          padding: '10px 12px',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        }),
        clearIndicator: (baseStyles) => ({
          ...baseStyles,
          cursor: 'pointer',
          padding: '0 8px',
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            color: 'rgb(107, 114, 128)',
          },
        }),
      }}
      components={{
        IndicatorSeparator: () => null,
      }}
    />
  );
};

export default FormFieldAddressAutoComplete;
