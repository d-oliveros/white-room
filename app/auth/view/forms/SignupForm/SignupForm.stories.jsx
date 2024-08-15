import { action } from '@storybook/addon-actions';
import SignupForm from './SignupForm.jsx';

export default {
  title: 'auth/forms/SignupForm',
  component: SignupForm,
};

export const Default = {
  args: {
    onSubmit: action('Submit'),
  },
};
