// import useDispatch from '#whiteroom/client/hooks/useDispatch.js';
import ForgotPasswordForm from './ForgotPasswordForm.jsx';
// import signupAction from '#auth/view/actions/signup.js';

const ForgotPasswordFormConnected = () => {
  // const dispatch = useDispatch();

  return (
    <ForgotPasswordForm
      onSubmit={(/* formValues */) => {
        // dispatch(signupAction, formValues);
      }}
    />
  );
};

export default ForgotPasswordFormConnected;
