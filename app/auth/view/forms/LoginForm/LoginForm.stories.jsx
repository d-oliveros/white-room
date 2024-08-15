import { action } from '@storybook/addon-actions';
import LoginForm from './LoginForm.jsx';

export default {
  title: 'auth/forms/LoginForm',
  component: LoginForm,
};

export const Default = {
  args: {
    onSubmit: action('Submit'),
  },
};
