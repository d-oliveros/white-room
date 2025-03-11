import { Helmet } from 'react-helmet-async';
import useRedirectToLandingPage from '@web/hooks/useRedirectToLandingPage';
import PageModal from '@web/components/layout/PageModal/PageModal';
import ForgotPasswordFormConnected from '@web/components/forms/ForgotPasswordForm/ForgotPasswordFormConnected';

const ForgotPasswordPage = () => {
  useRedirectToLandingPage();

  return (
    <>
      <Helmet>
        <title>Reset Password - WEB_TITLE</title>
      </Helmet>
      <PageModal
        title="Forgot Password"
        backgroundUrl="/images/hero-bg.png"
        showLogo
        footerLinkUrl="/login"
        footerLinkLabel="Back"
      >
        <ForgotPasswordFormConnected />
      </PageModal>
    </>
  );
};

export default ForgotPasswordPage;
