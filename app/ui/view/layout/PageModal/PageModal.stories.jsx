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
    backgroundUrl: 'https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg',
  },
};

export const WithFooterLink = {
  args: {
    ...Default.args,
    footerLinkUrl: '/forgot-password',
    footerLinkLabel: 'Forgot password?',
  },
};
