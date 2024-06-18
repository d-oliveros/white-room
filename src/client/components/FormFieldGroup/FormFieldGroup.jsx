import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import FormikField from '#client/components/FormikField/FormikField.jsx';
import Text from '#client/components/Text.jsx';

export const FORM_FIELD_GROUP_THEME_RENTAL_APPLICATION_LIST = 'rentalApplicationList';
export const FORM_FIELD_GROUP_THEME_RENTAL_APPLICATION_GROUP = 'rentalApplicationGroup';

const FormFieldGroup = ({
  title,
  label,
  subtitle,
  formFields,
  formikBag,
  theme = FORM_FIELD_GROUP_THEME_RENTAL_APPLICATION_LIST,
}) => {
  if (formFields.length === 0) {
    return null;
  }

  return (
    <div className={classnames('FormFieldGroup', theme)}>
      {title && (
        <div className='FormFieldGroupTitle'>
          {title}
          {label && (
            <Text>
              {` ${label}`}
            </Text>
          )}
          {subtitle}
        </div>
      )}
      <div className='FormFieldGroupContent'>
        {formFields.map((formField) => (
          <>
            <FormikField key={formField.id} formField={formField} formikBag={formikBag} />
            {formField.properties?.rentalApplicationFooter && (
              formField.properties.rentalApplicationFooter
            )}
          </>
        ))}
      </div>
    </div>
  );
};

FormFieldGroup.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  subtitle: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  formFields: PropTypes.array.isRequired,
  formikBag: PropTypes.object.isRequired,
  theme: PropTypes.oneOf([
    FORM_FIELD_GROUP_THEME_RENTAL_APPLICATION_LIST,
    FORM_FIELD_GROUP_THEME_RENTAL_APPLICATION_GROUP,
  ]),
};

export default FormFieldGroup;
