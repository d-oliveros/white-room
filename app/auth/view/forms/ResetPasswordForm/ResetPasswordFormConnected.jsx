// import useDispatch from '#whiteroom/client/hooks/useDispatch.js';
import ResetPasswordForm from './ResetPasswordForm.jsx';
// import signupAction from '#auth/view/actions/signup.js';

const ResetPasswordFormConnected = () => {
  // const dispatch = useDispatch();

  return (
    <ResetPasswordForm
      // onSubmit={(formValues) => {
      onSubmit={() => {
        // dispatch(signupAction, formValues);
      }}
    />
  );
};

export default ResetPasswordFormConnected;
