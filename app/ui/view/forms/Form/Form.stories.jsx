import { action } from '@storybook/addon-actions';
import Button from '#ui/view/components/Button/Button.jsx';
import FormFieldStories from '#ui/view/forms/FormField/FormField.stories.jsx';
import Form from './Form.jsx';

export default {
  title: 'ui/forms/Form',
  component: Form,
};

export const WithFormFields = {
  args: {
    onSubmit: action('Submit'),
    formFields: FormFieldStories.formFieldsList,
  },
};

export const WithDefaults = {
  args: {
    ...WithFormFields.args,
    defaultValues: {
      firstName: 'David Oliveros',
      email: 'default_email@dotnet.com',
      rememberMe: true,
    },
  },
};

export const WithChildren = {
  args: {
    onSubmit: action('Submit'),
    children: (
      <span>
        Custom children content.
        <Button type='submit'>
          Submit
        </Button>
      </span>
    ),
  },
};
