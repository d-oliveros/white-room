import useAllowedRoles from '#whiteroom/client/hooks/useAllowedRoles.js';

import {
  ROLE_ADMIN,
} from '#user/constants/roles.js';

const AdminDashboardPage = () => {
  useAllowedRoles({
    roles: [ROLE_ADMIN],
    redirectUrl: '/',
  });

  return (
    <>
      <h1>This is the Admin page.</h1>
    </>
  );
};

export default AdminDashboardPage;
