import useDispatch from '#whiteroom/client/hooks/useDispatch.js';
import signupAction from '#auth/view/actions/signup.js';
import SignupForm from './SignupForm.jsx';

const SignupFormConnected = () => {
  const dispatch = useDispatch();

  return (
    <SignupForm
      onSubmit={(formValues) => {
        return dispatch(signupAction, formValues);
      }}
    />
  );
};

export default SignupFormConnected;
