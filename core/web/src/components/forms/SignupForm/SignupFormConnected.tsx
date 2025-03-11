import { usePostAuthSignup } from '@namespace/api-client';
import getErrorMessage from '@web/helpers/getErrorMessage';
import SignupForm from './SignupForm';

interface SignupFormConnectedProps {
  onCancel?: () => void;
}

const SignupFormConnected = ({ onCancel }: SignupFormConnectedProps) => {
  const {
    mutate: signup,
    error,
    isPending,
  } = usePostAuthSignup({
    mutation: {
      meta: {
        resetQueries: true,
      },
    },
  });

  return (
    <SignupForm
      onSubmit={(values) => {
        signup({ data: values });
      }}
      onCancel={onCancel}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
};

export default SignupFormConnected;
