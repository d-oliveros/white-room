import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LoginForm from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'auth/forms/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {
    onSubmit: action('Submit'),
  },
};
