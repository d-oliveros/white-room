import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ForgotPasswordForm from './ForgotPasswordForm';

const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'auth/forms/ForgotPasswordForm',
  component: ForgotPasswordForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordForm>;

export const Default: Story = {
  args: {
    onSubmit: action('Submit'),
  },
};
