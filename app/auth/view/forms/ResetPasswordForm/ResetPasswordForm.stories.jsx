import { action } from '@storybook/addon-actions';
import ResetPasswordForm from './ResetPasswordForm.jsx';

export default {
  title: 'auth/forms/ResetPasswordForm',
  component: ResetPasswordForm,
};

export const Default = {
  args: {
    onSubmit: action('Submit'),
  },
};
