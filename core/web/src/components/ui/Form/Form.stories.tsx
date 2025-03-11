import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Button from '@web/components/ui/Button/Button';
import { Text, Email, Password, Checkbox } from '@web/components/ui/FormField/FormField.stories';
import Form from './Form';

const formFieldsList = [
  Text.args?.formField,
  Email.args?.formField,
  Password.args?.formField,
  Checkbox.args?.formField,
].filter((field): field is NonNullable<typeof field> => field !== undefined);

const meta: Meta<typeof Form> = {
  title: 'ui/forms/Form',
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const WithFormFields: Story = {
  args: {
    onSubmit: action('Submit'),
    formFields: formFieldsList,
  },
};

export const WithDefaults: Story = {
  args: {
    ...WithFormFields.args,
    defaultValues: {
      firstName: 'David Oliveros',
      email: 'default_email@dotnet.com',
      rememberMe: true,
    },
  },
};

export const WithChildren: Story = {
  args: {
    onSubmit: action('Submit'),
    children: (
      <span>
        Custom children content.
        <Button type="submit">Submit</Button>
      </span>
    ),
  },
};
