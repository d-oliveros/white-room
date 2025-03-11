import { Helmet } from 'react-helmet-async';
import useRedirectToLandingPage from '@web/hooks/useRedirectToLandingPage';
import PageModal from '@web/components/layout/PageModal/PageModal';
import ResetPasswordFormConnected from '@web/components/forms/ResetPasswordForm/ResetPasswordFormConnected';

const ResetPasswordPage = () => {
  useRedirectToLandingPage();

  return (
    <>
      <Helmet>
        <title>Reset Password - WEB_TITLE</title>
      </Helmet>
      <PageModal title="Reset Password" backgroundUrl="/images/hero-bg.png" showLogo>
        <ResetPasswordFormConnected />
      </PageModal>
    </>
  );
};

export default ResetPasswordPage;
