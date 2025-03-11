import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { AiOutlineLoading } from 'react-icons/ai';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'ui/components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    disabled: false,
    onClick: action('Click'),
    children: 'Button',
  },
};

export const SignIn: Story = {
  args: {
    ...Default.args,
    children: 'Sign In',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Button',
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isProcessing: true,
    processingSpinner: <AiOutlineLoading className="size-6 animate-spin" />,
  },
};
