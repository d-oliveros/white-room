import type { Meta, StoryObj } from '@storybook/react';
import Button from '@web/components/ui/Button/Button';
import { Text, Email, Password, Checkbox } from '@web/components/ui/FormField/FormField.stories';
import FormFieldGroup from './FormFieldGroup';

const formFieldsList = [
  Text.args?.formField,
  Email.args?.formField,
  Password.args?.formField,
  Checkbox.args?.formField,
].filter((field): field is NonNullable<typeof field> => field !== undefined);

const meta: Meta<typeof FormFieldGroup> = {
  title: 'ui/forms/FormFieldGroup',
  component: FormFieldGroup,
  parameters: {
    withReactHookForm: true,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormFieldGroup>;

export const Default: Story = {
  args: {
    formFields: formFieldsList,
  },
};

export const WithSubmit: Story = {
  args: {
    ...Default.args,
    children: <Button type="submit">Submit</Button>,
  },
};
