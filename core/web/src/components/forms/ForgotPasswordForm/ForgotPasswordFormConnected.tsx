// import useDispatch from '@web/hooks/useDispatch';
import ForgotPasswordForm from './ForgotPasswordForm';
// import signupAction from '@auth/view/actions/signup';

const ForgotPasswordFormConnected = () => {
  // const dispatch = useDispatch();

  return (
    <ForgotPasswordForm
      onSubmit={
        (/* formValues: { email: string } */) => {
          // dispatch(signupAction, formValues);
        }
      }
    />
  );
};

export default ForgotPasswordFormConnected;
