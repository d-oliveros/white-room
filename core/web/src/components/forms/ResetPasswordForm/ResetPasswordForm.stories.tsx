import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ResetPasswordForm from './ResetPasswordForm';

const meta: Meta<typeof ResetPasswordForm> = {
  title: 'auth/forms/ResetPasswordForm',
  component: ResetPasswordForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResetPasswordForm>;

export const Default: Story = {
  args: {
    onSubmit: action('Submit'),
  },
};
