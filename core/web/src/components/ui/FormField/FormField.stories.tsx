import type { Meta, StoryObj } from '@storybook/react';
import FormField from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'ui/forms/FormField',
  component: FormField,
  parameters: {
    withReactHookForm: true,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Text: Story = {
  args: {
    formField: {
      id: 'firstName',
      title: 'First name',
      type: 'short_text',
      properties: {
        placeholder: 'Write here...',
      },
      required: true,
    },
  },
};

export const Email: Story = {
  args: {
    formField: {
      id: 'email',
      title: 'Email',
      type: 'email',
      properties: {
        placeholder: 'someone@there.com',
      },
      required: true,
    },
  },
};

export const Password: Story = {
  args: {
    formField: {
      id: 'password',
      title: 'Password',
      type: 'password',
      properties: {
        placeholder: 'Write here...',
      },
      required: true,
    },
  },
};

export const Checkbox: Story = {
  args: {
    formField: {
      id: 'rememberMe',
      title: 'Remember me',
      type: 'checkbox',
    },
  },
};
