import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Alert from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'ui/components/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    message: 'Change a few things up and try submitting again.',
  },
};

export const WithMessageBold: Story = {
  args: {
    ...Default.args,
    messageBold: 'Info alert!',
  },
};

export const WithDismiss: Story = {
  args: {
    ...WithMessageBold.args,
    onDismiss: action('Dismiss click'),
  },
};
