import { Helmet } from 'react-helmet-async';
import useRedirectToLandingPage from '@web/hooks/useRedirectToLandingPage';
import Modal from '@web/components/ui/Modal/Modal';
import SignupFormConnected from '@web/components/forms/SignupForm/SignupFormConnected';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  useRedirectToLandingPage();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Signup - WEB_TITLE</title>
      </Helmet>
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-bg.png)' }}
      >
        <div className="w-full">
          <Modal isOpen header={<div className="px-2 py-1">Create Account</div>}>
            <SignupFormConnected onCancel={() => navigate('/login')} />
          </Modal>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
