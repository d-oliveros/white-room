import { usePostAuthLogin } from '@namespace/api-client';
import getErrorMessage from '@web/helpers/getErrorMessage';
import LoginForm from './LoginForm';

const LoginFormConnected = () => {
  const {
    mutate: login,
    error,
    isPending,
  } = usePostAuthLogin({
    mutation: {
      meta: {
        resetQueries: true,
      },
    },
  });

  return (
    <LoginForm
      onSubmit={(values) => {
        login({ data: values });
      }}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
};

export default LoginFormConnected;
