import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import type { SubmitHandler } from 'react-hook-form';
import Form from '@web/components/ui/Form/Form';
import Button from '@web/components/ui/Button/Button';

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const formFields: FormFieldType[] = [
  {
    id: 'firstName',
    title: 'First name',
    type: 'short_text',
    properties: {
      placeholder: 'Write first name...',
    },
    validations: ['required'],
  },
  {
    id: 'lastName',
    title: 'Last name',
    type: 'short_text',
    properties: {
      placeholder: 'Write last name...',
    },
    validations: ['required'],
  },
  {
    id: 'phone',
    title: 'Phone',
    type: 'phone',
    properties: {
      placeholder: 'Write phone number...',
    },
    validations: ['required'],
  },
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'Write email address...',
    },
    validations: ['required'],
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    properties: {
      placeholder: 'Write password...',
    },
    validations: ['required'],
  },
];

interface SignupFormProps {
  onSubmit: SubmitHandler<SignupFormValues>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
}

const SignupForm = ({ onSubmit, onCancel, isLoading, error }: SignupFormProps) => {
  return (
    <div className="space-y-4 px-6">
      <Form<SignupFormValues>
        formFields={formFields}
        defaultValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
        }}
        isLoading={isLoading}
        error={error}
        onSubmit={onSubmit}
        submitText="Create Account"
        hideDefaultSubmit
        footer={() => (
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              color="blue"
              disabled={isLoading}
              isProcessing={isLoading}
              className="w-full"
            >
              {isLoading ? 'Please wait...' : 'Create Account'}
            </Button>

            {onCancel && (
              <div className="mt-6">
                <Button
                  type="button"
                  color="dark"
                  onClick={onCancel}
                  className="w-full bg-gray-500 hover:bg-gray-500"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SignupForm;
