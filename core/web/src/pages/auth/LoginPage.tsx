import { Helmet } from 'react-helmet-async';
import useRedirectToLandingPage from '@web/hooks/useRedirectToLandingPage';
import PageModal from '@web/components/layout/PageModal/PageModal';
import LoginFormConnected from '@web/components/forms/LoginForm/LoginFormConnected';

const LoginPage = () => {
  useRedirectToLandingPage();

  return (
    <>
      <Helmet>
        <title>Login - WEB_TITLE</title>
      </Helmet>
      <PageModal
        title="Login"
        backgroundUrl="/images/hero-bg.png"
        showLogo
        // </>footerLinkUrl="/signup"
        // </>footerLinkLabel="Sign Up"
      >
        <LoginFormConnected />
      </PageModal>
    </>
  );
};

export default LoginPage;
