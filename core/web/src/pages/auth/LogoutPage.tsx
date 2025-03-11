import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePostAuthLogout } from '@namespace/api-client';
import { UserRole } from '@namespace/shared';
import useAllowedRoles from '@web/hooks/useAllowedRoles';
import Spinner from '@web/components/ui/Spinner/Spinner';

const LogoutPage = () => {
  useAllowedRoles({
    roles: [UserRole.User],
    addRedirectQueryParam: false,
  });

  const { mutate: logout } = usePostAuthLogout({
    mutation: {
      meta: {
        resetQueries: true,
      },
    },
  });

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Logout - WEB_TITLE</title>
      </Helmet>
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    </>
  );
};

export default LogoutPage;
