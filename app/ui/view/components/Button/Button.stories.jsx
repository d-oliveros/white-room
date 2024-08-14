import { action } from '@storybook/addon-actions';
import Button from './Button.jsx';

export default {
  title: 'ui/components/Button',
  component: Button,
};

export const Default = {
  args: {
    disabled: false,
    onClick: action('Click'),
    children: 'Button',
  },
};

export const SignIn = {
  args: {
    ...Default.args,
    children: 'Sign In',
  },
};

export const Disabled = {
  args: {
    disabled: true,
    children: 'Button',
  },
};
