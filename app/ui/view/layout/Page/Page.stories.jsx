import { action } from '@storybook/addon-actions';
import FormFieldStories from '#ui/view/forms/FormField/FormField.stories.jsx';
import Form from '#ui/view/forms/Form/Form.jsx';
import Page from './Page.jsx';

export default {
  title: 'ui/layout/Page',
  component: Page,
};

export const Default = {
  args: {
    children: (
      <Form
        formFields={FormFieldStories.formFieldsList}
        onSubmit={action('Submit')}
      />
    ),
  },
};
