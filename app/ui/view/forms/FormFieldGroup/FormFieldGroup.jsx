import PropTypes from 'prop-types';
import FormField from '#ui/view/forms/FormField/FormField.jsx';

const FormFieldGroup = ({ formFields, children }) => {
  return (
    <div className="flex max-w-md flex-col gap-4">
      {formFields.map((formField) => (
        <div key={formField.id}>
          <FormField formField={formField} />
        </div>
      ))}
      {children}
    </div>
  );
};

FormFieldGroup.propTypes = {
  formFields: PropTypes.arrayOf(FormField.propTypes.formField),
  children: PropTypes.node,
};

export default FormFieldGroup;
