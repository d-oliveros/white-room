import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import Form from '@web/components/ui/Form/Form';

const formFields: FormFieldType[] = [
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'someone@there.com',
    },
    required: true,
  },
];

interface ForgotPasswordFormProps {
  onSubmit: (data: { email: string }) => void;
}

const ForgotPasswordForm = ({ onSubmit }: ForgotPasswordFormProps) => {
  return <Form formFields={formFields} onSubmit={onSubmit} />;
};

export default ForgotPasswordForm;
