import React from 'react';

import useTransitionHook from '#client/hooks/useTransitionHook.js';
import UserActions from '#client/actions/User/index.jsx';

const ProfilePage = () => {
  const isTransitioning = useTransitionHook(ProfilePage);

  const params = useParams();
  const { user } = useBranch({
    user: ['usersById', params.userId],
  });

  if (isTransitioning) {
    return null;
  }

  return (
    <div>
      <h1>This is a Profile Page.</h1>
      <span>{`User: ${user.name}`}</span>
    </div>
  );
};

// ProfilePage.fetchPageData = async ({ dispatch, params }) => {
//   await dispatch(UserActions.getBy, { id: parseInt(params.userId, 10) });
// };

ProfilePage.fetchPageData = ({ dispatch, params }) => Promise.all([
  dispatch(UserActions.getBy, { id: parseInt(params.userId, 10) }),
]);

export default ProfilePage;
