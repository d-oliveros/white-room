import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import SignupForm from './SignupForm';

const meta: Meta<typeof SignupForm> = {
  title: 'auth/forms/SignupForm',
  component: SignupForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SignupForm>;

export const Default: Story = {
  args: {
    onSubmit: action('Submit'),
  },
};
