import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Form from '@web/components/ui/Form/Form';
import { Text, Email, Password, Checkbox } from '@web/components/ui/FormField/FormField.stories';
import PageModal from './PageModal';

const formFieldsList = [
  Text.args?.formField,
  Email.args?.formField,
  Password.args?.formField,
  Checkbox.args?.formField,
].filter((field): field is NonNullable<typeof field> => field !== undefined);

const meta: Meta<typeof PageModal> = {
  title: 'ui/layout/PageModal',
  component: PageModal,
};

export default meta;
type Story = StoryObj<typeof PageModal>;

export const Default: Story = {
  args: {
    title: 'Sign in to see your dashboard',
    children: <Form formFields={formFieldsList} onSubmit={action('Submit')} />,
  },
};

export const WithBackground: Story = {
  args: {
    ...Default.args,
    backgroundUrl: 'https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg',
  },
};

export const WithFooterLink: Story = {
  args: {
    ...Default.args,
    footerLinkUrl: '/forgot-password',
    footerLinkLabel: 'Forgot password?',
  },
};
