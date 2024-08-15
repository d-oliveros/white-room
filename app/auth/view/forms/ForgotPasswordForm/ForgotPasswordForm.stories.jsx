import { action } from '@storybook/addon-actions';
import ForgotPasswordForm from './ForgotPasswordForm.jsx';

export default {
  title: 'auth/forms/ForgotPasswordForm',
  component: ForgotPasswordForm,
};

export const Default = {
  args: {
    onSubmit: action('Submit'),
  },
};
