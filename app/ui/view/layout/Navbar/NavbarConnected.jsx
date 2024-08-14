import useBranch from '#white-room/client/hooks/useBranch.js';
import Navbar from './Navbar.jsx';

const NavbarConnected = () => {
  const { appTitle, currentUser } = useBranch({
    appTitle: ['app', 'env', 'APP_TITLE'],
    currentUser: ['currentUser'],
  });

  const logoUrl = 'https://flowbite.com/images/logo.svg';

  return (
    <Navbar
      logoUrl={logoUrl}
      logoLabel={appTitle}
      avatarImageUrl={currentUser.profileImage}
      userName={`${currentUser.firstName} ${currentUser.lastName}`}
      userEmail={currentUser.email}
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
      dropdownMenu={[
        {
          title: 'Settings',
          path: '/user/settings',
        },
        {
          divider: true,
        },
        {
          title: 'Log Out',
          path: '/logout',
        },
      ]}
    />
  );
};

export default NavbarConnected;
