import useBranch from '#whiteroom/client/hooks/useBranch.js';
import Footer from './Footer.jsx';

const FooterConnected = () => {
  const { appTitle } = useBranch({
    appTitle: ['client', 'env', 'APP_TITLE'],
  });

  const logoUrl = 'https://flowbite.com/images/logo.svg';

  return (
    <Footer
      logoUrl={logoUrl}
      logoLabel={appTitle}
      menu={[
        {
          title: 'Home',
          path: '/',
        },
        {
          title: 'Sandbox',
          path: '/sandbox',
        },
      ]}
    />
  );
};

export default FooterConnected;
