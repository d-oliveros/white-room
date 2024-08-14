import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import FormField from '#ui/view/forms/FormField/FormField.jsx';
import FormFieldGroup from '#ui/view/forms/FormFieldGroup/FormFieldGroup.jsx';
import Button from '#ui/view/components/Button/Button.jsx';

const Form = ({ onSubmit, defaultValues = {}, mode = 'onSubmit', formFields, children }) => {
  const methods = useForm({
    defaultValues,
    mode,
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : null}>
        {children}
        {formFields &&
          <FormFieldGroup formFields={formFields}>
            {onSubmit &&
              <Button type="submit">
                Submit
              </Button>
            }
          </FormFieldGroup>
        }
      </form>
    </FormProvider>
  );
};

Form.propTypes = {
  formFields: PropTypes.arrayOf(FormField.propTypes.formField),
  onSubmit: PropTypes.func,
  children: PropTypes.node,
  defaultValues: PropTypes.object,
  mode: PropTypes.oneOf([
    'onChange',
    'onBlur',
    'onSubmit',
    'onTouched',
    'all',
  ]),
};

export default Form;
