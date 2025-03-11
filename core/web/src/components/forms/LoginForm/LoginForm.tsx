import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import type { SubmitHandler } from 'react-hook-form';
import Form from '@web/components/ui/Form/Form';

type LoginFormValues = {
  email: string;
  password: string;
};

const loginFormFields: FormFieldType[] = [
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'someone@there.com',
      autocomplete: 'username',
    },
    validations: ['required'],
  },
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

interface LoginFormProps {
  onSubmit: SubmitHandler<LoginFormValues>;
  isLoading?: boolean;
  error?: string;
}

const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  return (
    <Form<LoginFormValues>
      formFields={loginFormFields}
      onSubmit={onSubmit}
      isLoading={isLoading}
      error={error}
      submitText="Log In"
    />
  );
};

export default LoginForm;
