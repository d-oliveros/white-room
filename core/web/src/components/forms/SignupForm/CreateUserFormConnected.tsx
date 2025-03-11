import type { PostAuthSignup200 } from '@namespace/api-client';
import { usePostAuthSignup } from '@namespace/api-client';
import getErrorMessage from '@web/helpers/getErrorMessage';
import SignupForm from './SignupForm';

interface CreateUserFormConnectedProps {
  onSubmit: (user: PostAuthSignup200) => void;
  onCancel?: () => void;
}

const CreateUserFormConnected = ({ onSubmit, onCancel }: CreateUserFormConnectedProps) => {
  const {
    mutate: createUser,
    isPending,
    error,
  } = usePostAuthSignup({
    mutation: {
      meta: {
        resetQueries: ['/auth'],
      },
      onSuccess: (x) => {
        onSubmit(x?.data);
      },
    },
  });

  return (
    <SignupForm
      onSubmit={(formValues) => {
        createUser({
          data: {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            phone: formValues.phone,
            password: formValues.password,
          },
        });
      }}
      onCancel={onCancel}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
};

export default CreateUserFormConnected;
