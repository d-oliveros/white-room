import { Helmet } from 'react-helmet-async';
import { UserRole } from '@namespace/shared';
import useAllowedRoles from '@web/hooks/useAllowedRoles';

const AdminDashboardPage = () => {
  useAllowedRoles({
    roles: [UserRole.Admin],
    redirectUrl: '/',
  });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - WEB_TITLE</title>
      </Helmet>
      <h1>This is the Admin page.</h1>
    </>
  );
};

export default AdminDashboardPage;
