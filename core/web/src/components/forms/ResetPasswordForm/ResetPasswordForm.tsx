import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import Form from '@web/components/ui/Form/Form';

const formFields: FormFieldType[] = [
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    properties: {
      placeholder: 'Write password...',
      autocomplete: 'current-password',
    },
    validations: ['required'],
  },
];

interface ResetPasswordFormProps {
  onSubmit: (formData: { password: string }) => void;
}

const ResetPasswordForm = ({ onSubmit }: ResetPasswordFormProps) => {
  return <Form formFields={formFields} onSubmit={onSubmit} />;
};

export default ResetPasswordForm;
