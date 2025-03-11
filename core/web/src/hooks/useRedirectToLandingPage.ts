import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCurrentUser from '@web/hooks/useCurrentUser';
import getUserLandingPage from '@web/helpers/getUserLandingPage';

export default function useRedirectToLandingPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      navigate(getUserLandingPage(user));
    }
  }, [user, isLoading, navigate]);
}
