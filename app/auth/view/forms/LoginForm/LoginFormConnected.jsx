import useDispatch from '#whiteroom/client/hooks/useDispatch.js';
import LoginForm from './LoginForm.jsx';
import loginAction from '#auth/view/actions/login.js';

const LoginFormConnected = () => {
  const dispatch = useDispatch();

  return (
    <LoginForm
      onSubmit={(formValues) => {
        return dispatch(loginAction, formValues);
      }}
    />
  );
};

export default LoginFormConnected;
