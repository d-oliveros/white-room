import Button from './Button.jsx';

export default {
  title: 'Button',
  component: Button,
};

export const Default = {
  args: {
    disabled: false,
    onClick: () => console.log('Click'),
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
