import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import FormField from '#ui/view/forms/FormField/FormField.jsx';
import FormFieldGroup from '#ui/view/forms/FormFieldGroup/FormFieldGroup.jsx';
import Alert from '#ui/view/components/Alert/Alert.jsx';
import Button from '#ui/view/components/Button/Button.jsx';

const Form = ({ onSubmit, defaultValues = {}, mode = 'onBlur', formFields, children }) => {
  const [submissionError, setSubmissionError] = useState(null);
  const methods = useForm({
    defaultValues,
    mode,
  });

  const handleSubmit = onSubmit ? methods.handleSubmit(onSubmit) : null;

  const onSubmitHandled = async (...args) => {
    setSubmissionError(null);
    if (handleSubmit) {
      try {
        const onSubmitResult = await handleSubmit(...args);
        return onSubmitResult;
      }
      catch (error) {
        setSubmissionError(error);
      }
    }
  }

  console.log('Form submissionError: ' + submissionError);
  console.log('Form errors', methods.formState.errors);
  console.log(methods);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmitHandled}>
        {children}
        {formFields &&
          <FormFieldGroup formFields={formFields}>
            {onSubmit &&
              <Button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting
                  ? 'Please wait...'
                  : 'Submit'
                }
              </Button>
            }

            {submissionError &&
              <Alert
                message={submissionError.message || String(submissionError)}
                onDismiss={() => setSubmissionError(null)}
              />
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
