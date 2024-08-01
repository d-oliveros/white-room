import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Field, getIn } from 'formik';
import Autosuggest from 'react-autosuggest';
import { NumericFormat } from 'react-number-format';
import dayjs from 'dayjs';
import lodashCompact from 'lodash/fp/compact.js';

import emptyFunction from '#white-room/util/emptyFunction.js';
import extractDateString from '#white-room/util/extractDateString.js';

import {
  isPDFFile,
} from '#white-room/client/lib/fileUploader.js';

import {
  transformStringToBoolean,
  getTextInputFieldAttributes,
} from '#white-room/client/helpers/formikHelpers.js';

import Tooltip, {
  TOOLTIP_POSITION_LEFT,
  TOOLTIP_ICON_QUESTION_MARK,
  TOOLTIP_POSITIONS,
  TOOLTIP_BG_COLOR_TO_CLASSNAME_MAPPING,
} from '#app/view/components/Tooltip/Tooltip.jsx';
import DatePicker from '#app/view/components/DatePicker/DatePicker.jsx';
import DateInput from '#app/view/components/DateInput/DateInput.jsx';
import ExpirationDateInput from '#app/view/components/ExpirationDateInput/ExpirationDateInput.jsx';
import CheckboxList from '#app/view/components/CheckboxList/CheckboxList.jsx';
import FormikErrorMessage from '#app/view/components/FormikErrorMessage/FormikErrorMessage.jsx';
import FilterCheckbox from '#app/view/components/FilterCheckbox/FilterCheckbox.jsx';
import Checkbox, {
  CHECKBOX_THEME_BOX,
} from '#app/view/components/Checkbox/Checkbox.jsx';
import FileUploader from '#app/view/components/FileUploader/FileUploader.jsx';
import MultiFileUploader from '#app/view/components/MultiFileUploader/MultiFileUploader.jsx';
import S3FileDisplay from '#app/view/components/S3FileDisplay/S3FileDisplay.jsx';
import StarRating from '#app/view/components/StarRating/StarRating.jsx';
import InfoOptionCheckboxList from '#app/view/components/InfoOptionCheckboxList/InfoOptionCheckboxList.jsx';
import FormFieldTagList from '#app/view/components/FormFieldTagList/FormFieldTagList.jsx';
import EditTextbox from '#app/view/components/EditTextbox/EditTextbox.jsx';
import Text from '#app/view/components/Text/Text.jsx';
import Flex from '#app/view/components/Flex/Flex.jsx';

/* eslint-disable max-len */
export const FIELD_THEME_RENTAL_APPLICATION_HORIZONTAL = 'rentalApplicationFieldHorizontal';
export const FIELD_THEME_RENTAL_APPLICATION_HORIZONTAL_ADJUSTED = 'rentalApplicationFieldHorizontalAdjusted/Flex';
export const FIELD_THEME_RENTAL_APPLICATION_VERTICAL = 'rentalApplicationFieldVertical';
export const FIELD_THEME_RENTAL_APPLICATION_VERTICAL_ADJUSTED = 'rentalApplicationFieldVerticalAdjusted';
export const FIELD_THEME_RENTAL_APPLICATION_HORIZONTAL_CHECKBOX = 'rentalApplicationFieldHorizontalCheckbox';
export const FIELD_THEME_PARTNER_FORM = 'partnerForm';
export const FIELD_THEME_PROPERTY_CONDITION_FORM = 'propertyConditionReportForm';
export const FIELD_THEME_ORDER_UNINSTALL_FORM = 'orderUninstallForm';
export const FIELD_THEME_ADMIN = 'adminTheme';
export const FIELD_THEME_ADMIN_HORIZONTAL_SMALL = 'adminHorizontalSmall';
export const FIELD_THEME_CHECKBOX_BLUE = 'checkboxBlue';
export const FIELD_THEME_LONG_TEXTAREA = 'longTextarea';
export const FIELD_THEME_ADOBE = 'adobe';
export const FIELD_THEME_ADOBE_LONG_LABEL = 'adobeLongLabel';
export const FIELD_THEME_ADOBE_ASSEMBLY_LINE = 'adobeAssemblyLine';
export const FIELD_THEME_ADOBE_ASSEMBLY_LINE_ORANGE = 'adobeAssemblyLineOrange';
export const FIELD_THEME_ADOBE_ASSEMBLY_LINE_RED = 'adobeAssemblyLineRed';
export const FIELD_THEME_GREYCLIFF_DARK_BG = 'greycliffDarkBg';
export const FIELD_THEME_WHITNEY = 'whitneyTheme';
export const FIELD_THEME_PARTNER_FORM_ADOBE = 'partnerFormAdobe';
export const FIELD_THEME_PARTNER_FORM_ADOBE_GREY = 'partnerFormAdobeGrey';
export const FIELD_THEME_FORM_INPUT_BORDER_2X = 'inputBorder';
/* eslint-enable max-len */

const FIELD_THEMES = [
  FIELD_THEME_RENTAL_APPLICATION_HORIZONTAL,
  FIELD_THEME_RENTAL_APPLICATION_HORIZONTAL_ADJUSTED,
  FIELD_THEME_RENTAL_APPLICATION_VERTICAL,
  FIELD_THEME_RENTAL_APPLICATION_VERTICAL_ADJUSTED,
  FIELD_THEME_PARTNER_FORM,
  FIELD_THEME_ADMIN,
  FIELD_THEME_ADMIN_HORIZONTAL_SMALL,
  FIELD_THEME_CHECKBOX_BLUE,
  FIELD_THEME_LONG_TEXTAREA,
  FIELD_THEME_ADOBE,
  FIELD_THEME_ADOBE_LONG_LABEL,
  FIELD_THEME_ADOBE_ASSEMBLY_LINE,
  FIELD_THEME_ADOBE_ASSEMBLY_LINE_ORANGE,
  FIELD_THEME_ADOBE_ASSEMBLY_LINE_RED,
  FIELD_THEME_GREYCLIFF_DARK_BG,
  FIELD_THEME_WHITNEY,
  FIELD_THEME_PARTNER_FORM_ADOBE,
  FIELD_THEME_FORM_INPUT_BORDER_2X,
  FIELD_THEME_ORDER_UNINSTALL_FORM,
  FIELD_THEME_PARTNER_FORM_ADOBE_GREY,
];

class FormikField extends Component {
  static propTypes = {
    formField: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      properties: PropTypes.object,
      tooltipCopy: PropTypes.string,
      tooltipPosition: PropTypes.oneOf(TOOLTIP_POSITIONS),
      tooltipBgColor: PropTypes.oneOf(Object.keys(TOOLTIP_BG_COLOR_TO_CLASSNAME_MAPPING)),
      tooltipClassName:  PropTypes.string,
    }).isRequired,
    formikBag: PropTypes.object,
    theme: PropTypes.oneOf(FIELD_THEMES),
    margin: PropTypes.string,
    // TODO: Add support for a FormikField "disable" prop.
  }

  static contextTypes = {
    userAgent: PropTypes.object,
  }

  constructor(props) {
    super(props);
    if (props.formikBag && props.value) {
      throw new Error('FormikField accepts formikBag or value, but not both.');
    }
  }

  _onClickContainer = () => {
    const { formField } = this.props;
    const properties = formField.properties || {};

    if (properties.focusInputOnClickContainer && this.el && this.el.focus) {
      this.el.focus();
      const inputValue = this.el.value;
      this.el.value = '';
      this.el.value = inputValue;
    }
  }

  render() {
    const { formField, formikBag, margin } = this.props;
    const setFieldValue = formikBag ? formikBag.setFieldValue.bind(formikBag) : emptyFunction;
    const setFieldTouched = formikBag ? formikBag.setFieldTouched.bind(formikBag) : emptyFunction;
    const properties = formField.properties || {};
    const theme = this.props.theme || properties.theme;
    const fieldsContainerClassName = this.props.className || properties.className;
    const userAgent = this.context.userAgent;
    let showActiveClassName = false;
    let shouldWrapInLabel = false;

    const value = typeof this.props.value === 'undefined' && formikBag
      ? getIn(formikBag.values, formField.id)
      : this.props.value;

    let fieldDOM = null;
    switch (formField.type) {
      case 'ssn':
      case 'zipCode':
      case 'verification_code':
      case 'phone':
      case 'card_number':
      case 'card_cvc':
      case 'number': {
        fieldDOM = (
          <Field
            innerRef={(el) => {
              this.el = el;
            }}
            {...getTextInputFieldAttributes({ formField, formikBag, userAgent })}
            validate={properties.validate}
          />
        );
        break;
      }
      case 'short_text': {
        fieldDOM = (
          <Field
            innerRef={(el) => {
              this.el = el;
            }}
            {...getTextInputFieldAttributes({ formField, formikBag, userAgent })}
            validate={properties.validate}
            value={value}
          />
        );
        break;
      }
      case 'barcode_scan': {
        fieldDOM = (
          <Flex
            alignItems='center'
          >
            <div
              width='calc(100% - 50px)'
            >
              <Field
                innerRef={(el) => {
                  this.el = el;
                }}
                {...getTextInputFieldAttributes({ formField, formikBag, userAgent })}
                validate={properties.validate}
                value={value}
              />
            </div>
            <div
              onClick={properties.onScanClick}
              cursor='pointer'
              backgroundImage='url(/images/scan-barcode.svg)'
              backgroundPosition='center'
              backgroundSize='contain'
              backgroundRepeat='no-repeat'
              width='40px'
              height='40px'
              marginLeft='4px'
              marginBottom='3px'
            />
          </Flex>
        );
        break;
      }
      case 'text_list': {
        fieldDOM = (
          <>
            <div>
              <EditTextbox
                initialValue=''
                onSave={(newValue) => {
                  // Adds the value only if the value didn't exist before.
                  const valueAlreadyExists = (value || []).some((_text) => {
                    const text = typeof _text === 'object'
                      ? JSON.stringify(_text)
                      : _text;
                    return (text || '').toLowerCase() === (newValue || '').toLowerCase();
                  });
                  if (!valueAlreadyExists && newValue) {
                    setFieldValue(formField.id, [ ...(value || []), newValue ]);
                  }
                }}
                placeholder={properties.placeholder || 'Write here...'}
                withSaveButton
              />
            </div>
            {(value || []).map((_text, index) => {
              const text = typeof _text === 'object'
                ? JSON.stringify(_text)
                : _text;
              return (
                <div key={text}>
                  <Text font='greycliff' color='blueGreycliff' size='16'>
                    {text}
                  </Text>
                  <button
                    type='button'
                    onClick={() => {
                      const newValue = [...value];
                      newValue.splice(index, 1);
                      setFieldValue(formField.id, newValue);
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </>
        );
        break;
      }
      case 'percentage': {
        const displayValue = typeof value === 'number'
          ? (value * 100).toFixed(0)
          : '';

        fieldDOM = (
          <Field
            {...getTextInputFieldAttributes({ formField, formikBag })}
            value={displayValue}
            validate={properties.validate}
            onChange={(event) => {
              const value = event.target.value;
              const percentageValue = value
                ? parseFloat(value) / 100
                : null;
              if (typeof percentageValue !== 'number') {
                setFieldValue(formField.id, null);
              }
              else if (
                value[value.length - 1] !== '.'
                && !isNaN(percentageValue)
              ) {
                setFieldValue(formField.id, percentageValue);
              }
            }}
          />
        );
        break;
      }
      case 'email': {
        fieldDOM = (
          <Field
            innerRef={(el) => {
              this.el = el;
            }}
            {...getTextInputFieldAttributes({ formField, formikBag, userAgent })}
            onChange={(event) => {
              const trimmedValue = (event.target.value || '').trim();
              setFieldValue(formField.id, trimmedValue);
            }}
            validate={properties.validate}
          />
        );
        break;
      }
      case 'currency': {
        fieldDOM = (
          <NumberFormat
            getInputRef={(el) => {
              this.el = el;
            }}
            {...getTextInputFieldAttributes({ formField, formikBag })}
            onChange={undefined}
            value={value}
            thousandSeparator
            prefix='$'
            type='tel'
            decimalScale={2}
            onValueChange={(values) => {
              const floatValue = values.floatValue === undefined
                ? null
                : values.floatValue;
              setFieldValue(formField.id, floatValue);
              if (properties.onChange) {
                properties.onChange(floatValue);
              }
            }}
          />
        );
        break;
      }
      case 'numberWithComma': {
        fieldDOM = (
          <NumberFormat
            {...getTextInputFieldAttributes({ formField, formikBag })}
            onChange={undefined}
            value={value}
            thousandSeparator
            type='tel'
            onValueChange={(values) => {
              setFieldValue(formField.id, values.floatValue);
              if (properties.onChange) {
                properties.onChange(values.floatValue);
              }
            }}
          />
        );
        break;
      }
      case 'password': {
        const fieldAttributes = {
          onKeyPress: properties.onKeyPress,
          autoFocus: properties.autoFocus,
          disabled: properties.disabled,
          className: properties.className,
          placeholder: properties.placeholder,
          type: 'password',
          pattern: properties.pattern,
        };

        if (properties.onChange) {
          fieldAttributes.onChange = properties.onChange;
        }

        fieldDOM = (
          <Field
            name={formField.id}
            {...fieldAttributes}
          />
        );
        break;
      }
      case 'long_text': {
        const fieldAttributes = {
          onKeyPress: properties.onKeyPress,
          placeholder: properties.placeholder,
          className: 'textarea value',
          component: 'textarea',
          autoFocus: properties.autoFocus,
          disabled: properties.disabled,
        };

        if (properties.onChange) {
          fieldAttributes.onChange = properties.onChange;
        }

        if (properties.onBlur) {
          fieldAttributes.onBlur = properties.onBlur;
        }

        fieldDOM = (
          <Field name={formField.id} {...fieldAttributes} />
        );
        break;
      }
      case 'date_picker': {
        fieldDOM = (
          <DatePicker
            formikBag={formikBag}
            className='datePicker'
            name={formField.id}
            skipOnChangeReRender={properties.skipOnChangeReRender}
            onChange={(dayjsInstance) => {
              let value = dayjsInstance?.toISOString
                ? dayjsInstance.toISOString()
                : null;

              if (properties.dateWithoutTime) {
                value = extractDateString(value);
              }

              setFieldValue(formField.id, value);

              if (value) {
                setFieldTouched(formField.id);
              }
              if (properties.onChange) {
                properties.onChange(value);
              }
            }}
            timeFormat={properties.timeFormat}
            dateFormat={properties.dateFormat || 'MM/DD/YYYY'}
            viewMode={properties.dateViewMode}
            value={value}
            placeholderValue={properties.placeholderValue}
            placeholder={properties.placeholder}
            isValidDate={properties.isValidDate}
            readOnly={properties.readOnly}
            disabled={properties.disabled}
            closeOnSelect
          />
        );
        break;
      }
      case 'week_picker': {
        fieldDOM = (
          <DatePicker
            formikBag={formikBag}
            className='datePicker'
            name={formField.id}
            skipOnChangeReRender={properties.skipOnChangeReRender}
            onChange={(dayjsInstance) => {
              if (!dayjsInstance) {
                setFieldValue(formField.id, null);
              }
              else if (dayjsInstance.toISOString) {
                setFieldValue(formField.id, dayjsInstance.toISOString());
                setFieldTouched(formField.id);
              }
              if (properties.onChange) {
                properties.onChange(dayjsInstance ? dayjsInstance.toISOString() : null);
              }
            }}
            timeFormat={properties.timeFormat}
            dateFormat={properties.dateFormat || 'MM/DD/YYYY'}
            viewMode={properties.dateViewMode}
            value={value}
            placeholderValue={properties.placeholderValue}
            placeholder={properties.placeholder}
            readOnly={properties.readOnly}
            isValidDate={properties.isValidDate}
            disabled={properties.disabled}
            closeOnSelect
            selection='weekly'
          />
        );
        break;
      }
      case 'date_input':
        fieldDOM = (
          <DateInput
            formFieldId={formField.id}
            onChange={(newValue) => {
              const newValueMoment = dayjs(newValue, 'YYYY-MM-DD');
              if (newValue.length === 10 && newValueMoment.isValid()) {
                setFieldValue(formField.id, newValueMoment.toISOString());
              }
              else {
                setFieldValue(formField.id, null);
              }
            }}
            onBlur={() => {
              setFieldTouched(formField.id);
            }}
            value={value ? dayjs(value).format('YYYY-MM-DD') : ''}
            disabled={properties.disabled}
          />
        );
        break;
      case 'date_expiration_input':
        fieldDOM = (
          <ExpirationDateInput
            formFieldId={formField.id}
            onChange={(newValue) => {
              const newValueMoment = dayjs(newValue, 'MM-YY');

              if (newValueMoment.isValid()) {
                setFieldValue(formField.id, newValueMoment.toISOString());
              }
            }}
            onBlur={() => {
              setFieldTouched(formField.id);
            }}
            value={value ? dayjs(value).format('MM-YY') : ''}
            disabled={properties.disabled}
          />
        );
        break;
      case 'yes_no': {
        showActiveClassName = !!formikBag.values[formField.id];
        const labels = properties.labels || {};
        const oppositeBoolean = properties.oppositeBoolean || false;

        fieldDOM = (
          <CheckboxList
            optionList={[
              { value: !oppositeBoolean, label: labels.yes || 'Yes' },
              { value: oppositeBoolean, label: labels.no || 'No' },
            ]}
            onChange={(newValue) => {
              setFieldValue(formField.id, newValue);
              if (properties.onChange) {
                properties.onChange(newValue);
              }
            }}
            value={transformStringToBoolean(value)}
            multipleSelection={false}
            disabled={properties.disabled}
            fieldType={CHECKBOX_THEME_BOX}
            className='checkboxListBoolean'
          />
        );
        break;
      }
      case 'multiple_choice': {
        const fieldAttributes = {
          multipleSelection: properties.multipleSelection,
          useArrayValues: properties.useArrayValues,
          allowEmptyArray: properties.allowEmptyArray,
          toggleSingleSelection: properties.toggleSingleSelection,
          uncheckedValue: properties.uncheckedValue,
          theme: properties.theme,
          checkboxClassName: properties.checkboxClassName,
          className: properties.checkboxListClassName,
        };

        if (properties.onChange) {
          fieldAttributes.onChange = properties.onChange;
        }

        fieldDOM = (
          <CheckboxList
            optionList={properties.choices}
            value={value}
            onChange={(newValue) => {
              setFieldValue(formField.id, newValue);
            }}
            {...fieldAttributes}
            fieldType={properties.fieldType}
            autoFitWidth={properties.autoFitWidth}
            checkboxIconType={properties.checkboxIconType}
            columns={properties.columns}
            width={properties.width}
            gridGap={properties.gridGap}
          />
        );
        break;
      }
      case 'info_checkbox': {
        fieldDOM = (
          <InfoOptionCheckboxList
            optionList={properties.choices}
            value={value}
            onChange={(newValue) => {
              setFieldValue(formField.id, newValue);
            }}
          />
        );
        break;
      }

      case 'info_checkbox_multi': {
        fieldDOM = (
          <InfoOptionCheckboxList
            optionList={properties.choices}
            value={value}
            onChange={(selectedOption, initialValue = []) => {
              const newValue = initialValue.includes(selectedOption)
                ? initialValue.filter((value) => value !== selectedOption)
                : [...initialValue, selectedOption];

              setFieldValue(formField.id, newValue);
            }}
          />
        );
        break;
      }

      case 'select': {
        const fieldAttributes = {
          disabled: properties.disabled,
        };
        // TODO: Figure out if there's a non-WTF way of doing this without messing Field's native `onChange`.
        const optionalOnChange = {};
        if (properties.onChange) {
          optionalOnChange.onChange = properties.onChange;
        }

        if (properties.transformToBoolean) {
          optionalOnChange.onChange = (e) => {
            setFieldValue(formField.id, transformStringToBoolean(e.target.value));
          };
        }

        if (properties.transformToFloat) {
          optionalOnChange.onChange = (e) => {
            setFieldValue(formField.id, parseFloat(e.target.value));
          };
        }

        if (properties.transformToNumber) {
          optionalOnChange.onChange = (e) => {
            setFieldValue(formField.id, parseInt(e.target.value, 10));
          };
        }

        fieldDOM = (
          <Field
            component='select'
            name={formField.id}
            className={properties.className}
            {...optionalOnChange}
            {...fieldAttributes}
          >
            <option
              label={properties.placeholder || 'Choose'}
              value=''
              disabled={!properties.enableResetOption}
            />
            {properties.choices.map((choice) => (
              <option
                label={choice.label}
                value={choice.value}
                key={choice.value}
              >
                {choice.label}
              </option>
            ))}
          </Field>
        );
        break;
      }
      case 'checkbox': {
        showActiveClassName = !!formikBag.values[formField.id];
        shouldWrapInLabel = true;
        fieldDOM = (
          <FilterCheckbox
            id={formField.id}
            disabled={properties.disabled}
            className={properties.className}
            value={!!value}
            onChange={(id, newValue) => {
              setFieldValue(id, newValue);
              if (properties.onChange) {
                properties.onChange(newValue);
              }
            }}
          />
        );
        break;
      }
      case 'simple_checkbox': {
        showActiveClassName = !!formikBag.values[formField.id];
        shouldWrapInLabel = true;
        fieldDOM = (
          <Checkbox
            className={properties.className}
            checked={!!value}
            onClick={() => {
              setFieldValue(formField.id, !value);
              if (properties.onChange) {
                properties.onChange(!value);
              }
            }}
          >
            {properties.children}
          </Checkbox>
        );
        break;
      }
      case 'file_single': {
        fieldDOM = (
          <FileUploader
            value={value}
            accept={properties.fileAccept}
            filePath={properties.filePath}
            placeholder={properties.placeholder}
            checkmarks={properties.checkmarks}
            warning={properties.warning}
            isPrivate={properties.isPrivate}
            uploadAs={properties.uploadAs}
            minWidth={properties.minWidth}
            minHeight={properties.minHeight}
            onFileUploaded={({ s3FileUrl }) => {
              setFieldValue(formField.id, s3FileUrl);
            }}
            onFileRemoved={() => {
              setFieldValue(formField.id, null);
            }}
            successMessage={properties.successMessage}
            downloadButtonLabel={properties.downloadButtonLabel}
            requirePDFDocs={properties.requirePDFDocs}
          />
        );
        break;
      }
      case 'file_multi': {
        fieldDOM = (
          <div>
            {Array.isArray(value) && value.length > 0 && !properties.hidePreview && (
              <div className='thumbnailContainer'>
                {value.map((s3FileUrl) => {
                  const removeS3FileUrl = () => {
                    const valueWithoutS3FileUrl = value.filter(
                      (_value) => _value !== s3FileUrl
                    );
                    setFieldValue(formField.id, valueWithoutS3FileUrl);
                  };

                  return (
                    <div key={s3FileUrl} className='p-relative'>
                      <span
                        className='FormikFieldFileMultiRemoveFileButton button white small-admin'
                        onClick={removeS3FileUrl}
                      >
                        remove
                      </span>
                      <S3FileDisplay
                        url={s3FileUrl}
                        maxHeight='280px'
                      />
                      {s3FileUrl && properties.requirePDFDocs && !isPDFFile(s3FileUrl) && (
                        <div>
                          <Text color='red' weight='bold'>
                            The document provided is not a PDF. Please upload a PDF instead, if possible.
                          </Text>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <MultiFileUploader
              totalFiles={value.length}
              maxFiles={properties.maxFiles}
              hidePreview={properties.hidePreview}
              accept={properties.fileAccept}
              value={properties.value}
              placeholder={properties.placeholder}
              filePath={properties.filePath}
              isPrivate={properties.isPrivate}
              uploadAs={properties.uploadAs}
              successMessage={properties.successMessage}
              replaceFields={properties.replaceFields}
              onFilesUploaded={(uploadResponses) => {
                const s3FileUrls = uploadResponses.map(({ s3FileUrl }) => s3FileUrl);
                const valueArray = Array.isArray(value) ? value : [];
                const newValue = properties.replaceFields
                  ? s3FileUrls
                  : [...valueArray, ...s3FileUrls];

                setFieldValue(formField.id, newValue);

                if (properties.onChange) {
                  properties.onChange(newValue);
                }
              }}
            />
          </div>
        );
        break;
      }
      case 'autocomplete': {
        const textInputFieldAttributes = getTextInputFieldAttributes({ formField, formikBag, userAgent });
        // https://www.npmjs.com/package/react-autosuggest
        const valueForMatching = value ? value.trim().toLowerCase() : '';
        const nativeFilterFunc = (choice) => {
          const lowerCaseChoice = choice.toLowerCase();
          return (
            valueForMatching.length >= properties.minCharMatchCount || 2
            && valueForMatching !== lowerCaseChoice
            && lowerCaseChoice.indexOf(valueForMatching) === 0
          );
        };
        const customFilterFunc = (choice) => {
          return properties.filterFunc({
            value: valueForMatching,
            choice: choice,
          });
        };

        const filterFunc = typeof properties.filterFunc === 'function'
          ? customFilterFunc
          : nativeFilterFunc;

        fieldDOM = (
          <Autosuggest
            suggestions={properties.choices.filter(filterFunc)}
            onSuggestionsFetchRequested={properties.onSuggestionsFetchRequested || emptyFunction}
            onSuggestionsClearRequested={() => {
              // Autosuggest complains if we don't pass in this empty function.
            }}
            getSuggestionValue={(suggestion) => suggestion}
            renderSuggestion={(suggestion) => suggestion}
            inputProps={{
              ...textInputFieldAttributes,
              autoComplete: 'off',
              value: value || '',
              onChange: (event, { newValue }) => {
                setFieldValue(formField.id, newValue);
                if (typeof textInputFieldAttributes.onChange === 'function') {
                  textInputFieldAttributes.onChange({ newValue, formikBag });
                }
              },
            }}
          />
        );
        break;
      }
      case 'star_rating': {
        fieldDOM = (
          <StarRating
            rate={value}
            onChange={(rate) => {
              setFieldValue(formField.id, rate);
              if (properties.onChange) {
                properties.onChange(rate);
              }
            }}
          />
        );
        break;
      }
      case 'tags': {
        fieldDOM = (
          <FormFieldTagList
            value={value}
            optionList={properties.choices}
            onChange={(newValue) => {
              setFieldValue(formField.id, newValue);
            }}
          />
        );
        break;
      }
      case 'hidden': {
        // No DOM or logic for hidden fields.
        break;
      }
      default: {
        const error = new Error(`Unsupported field type: "${formField.type}".`);
        error.name = 'UnsupportedFormFieldTypeError';
        error.details = {
          formField,
        };
        throw error;
      }
    }

    const containerProps = {
      className: classnames(
        'fieldsContainer input',
        `fieldType-${formField.type}`,
        properties.noMargin || formField.type === 'hidden' ? 'noMargin' : null,
        theme,
        fieldsContainerClassName,
        {
          hasError: formikBag && formikBag.errors[formField.id] && formikBag.touched[formField.id],
          active: showActiveClassName,
        },
      ),
      id: `field-${formField.id}`,
      style: { margin },
    };

    if (properties.focusInputOnClickContainer) {
      containerProps.onClick = this._onClickContainer;
    }

    const isFormFieldTypeHidden = formField.type === 'hidden';

    const innerDOM = lodashCompact([
      formField.title && !isFormFieldTypeHidden && (
        <span
          key='title'
          className={classnames('title',
            formField.titleSecondary ? 'reduceMargin' : null,
            formField.titleMultiline ? 'multiline' : null,
          )}
        >
          {formField.title}
        </span>
      ),
      formField.titleSecondary && !isFormFieldTypeHidden && (
        <span key='titleSecondary' className='titleSecondary'>{formField.titleSecondary}</span>
      ),
      formField.label && !isFormFieldTypeHidden && (
        <span key='label' className='label'>{formField.label}</span>
      ),
      formField.tooltipCopy && !isFormFieldTypeHidden && (
        <span style={{ paddingLeft: '5px' }}>
          <Tooltip
            iconName={TOOLTIP_ICON_QUESTION_MARK}
            position={
              formField.tooltipPosition
                ? formField.tooltipPosition
                : TOOLTIP_POSITION_LEFT
            }
            bgColor={
              formField.tooltipBgColor
                ? formField.tooltipBgColor
                : null
            }
            className={
              formField.tooltipClassName
                ? formField.tooltipClassName
                : null
            }
          >
            {formField.tooltipCopy}
          </Tooltip>
        </span>
      ),
      formField.subtitle && !isFormFieldTypeHidden && (
        <div key='subtitle' className='fieldSubtitle'>{formField.subtitle}</div>
      ),
      fieldDOM ? <div key='fieldDom' className='value'>{fieldDOM}</div> : null,
    ]);

    /* eslint-disable jsx-a11y/label-has-associated-control */
    return (
      <div {...containerProps}>
        {shouldWrapInLabel
          ? <label>{innerDOM}</label>
          : innerDOM
        }
        {formikBag && !isFormFieldTypeHidden && (
          <FormikErrorMessage
            id={formField.id}
            formikBag={formikBag}
          />
        )}
        {properties.widget}
      </div>
    );
    // eslint-enable jsx-a11y/label-has-associated-control
  }
}

export default FormikField;
