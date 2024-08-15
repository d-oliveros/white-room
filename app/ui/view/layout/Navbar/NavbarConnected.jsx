import { hasRoleAnonymous } from '#user/constants/roles.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import Navbar from './Navbar.jsx';

const NavbarConnected = () => {
  const { appTitle, currentUser } = useBranch({
    appTitle: ['client', 'env', 'APP_TITLE'],
    currentUser: ['currentUser'],
  });

  const isAnonymous = hasRoleAnonymous(currentUser.roles);

  const logoUrl = 'https://flowbite.com/images/logo.svg';

  return (
    <Navbar
      logoUrl={logoUrl}
      logoLabel={appTitle}
      // avatarImageUrl={currentUser.profileImage}
      avatarImageUrl={isAnonymous ? null : 'https://i.pravatar.cc/50'}
      userName={isAnonymous ? null : `${currentUser.firstName} ${currentUser.lastName}`}
      userEmail={currentUser?.email}
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
      dropdownMenu={isAnonymous
        ? [
          {
            title: 'Log In',
            path: '/login',
          },
        ]
        : [
          {
            title: 'Settings',
            path: `/user/${currentUser.id}`,
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
