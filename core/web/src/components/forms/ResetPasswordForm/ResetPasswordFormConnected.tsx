// import useDispatch from '@web/hooks/useDispatch';
import ResetPasswordForm from './ResetPasswordForm';
// import signupAction from '@auth/view/actions/signup';

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
