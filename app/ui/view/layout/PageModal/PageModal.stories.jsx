import { action } from '@storybook/addon-actions';
import FormFieldStories from '#ui/view/forms/FormField/FormField.stories.jsx';
import Form from '#ui/view/forms/Form/Form.jsx';
import PageModal from './PageModal.jsx';

export default {
  title: 'ui/layout/PageModal',
  component: PageModal,
};

export const Default = {
  args: {
    title: 'Sign in to see your dashboard',
    children: (
      <Form
        formFields={FormFieldStories.formFieldsList}
        onSubmit={action('Submit')}
      />
    ),
  },
};

export const WithBackground = {
  args: {
    ...Default.args,
    backgroundUrl: 'https://us.123rf.com/450wm/arignx/arignx1611/arignx161100010/68039628-clear-transparent-sea-water-summer-beach-natural-marine-background.jpg?ver=6', // eslint-disable-line max-len
  },
};
