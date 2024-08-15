import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import logger from '#whiteroom/logger.js';
import useDispatch from '#whiteroom/client/hooks/useDispatch.js';
import logoutAction from '#auth/view/actions/logout.js';
import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';
import anonymousUser from '#user/constants/anonymousUser.js';
import Spinner from '#ui/view/components/Spinner/Spinner.jsx';

const LogoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logoutAction)
      .then(() => {
        navigate(getUserLandingPage(anonymousUser))
      })
      .catch((error) => {
        logger.error(error);
      });
  }, [dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner />
    </div>
  );
 };

LogoutPage.getMetadata = () => ({
  title: 'Logout - Whiteroom',
});

export default LogoutPage;
