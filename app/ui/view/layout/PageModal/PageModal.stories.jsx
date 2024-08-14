import { action } from '@storybook/addon-actions';
import FormFieldStories from '#ui/view/forms/FormField/FormField.stories.jsx';
import Form from '#ui/view/forms/Form/Form.jsx';
import PageModal from './PageModal.jsx';

export default {
  title: 'ui/components/PageModal',
  component: PageModal,
};

export const Default = {
  args: {
    title: 'Sign in to our platform',
    children: (
      <Form formFields={FormFieldStories.formFieldsList} onSubmit={action('Submit')} />
    ),
  },
};
