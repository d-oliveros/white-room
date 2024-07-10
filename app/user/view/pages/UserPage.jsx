import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import useBranch from '#white-room/client/hooks/useBranch.js';
import sleepAsync from '#white-room/util/sleepAsync.js';

// import UserActions from '#white-room/client/actions/User/index.jsx';

// const UserPage = ({ pageData, isTransitioning }) => {
//   const params = useParams();
//
//   const { user } = useBranch({
//     user: ['usersById', params.userId],
//   });
//
//   if (isTransitioning) {
//     return (
//       <div className='loading-gif' />
//     );
//   }
//
//   return (
//     <div>
//       <h1>This is a Profile Page.</h1>
//       <span>{`User: ${user.firstName}`}</span>
//     </div>
//   );
// };

const UserPage = ({ user, isTransitioning }) => {
  console.log(isTransitioning);
  if (isTransitioning) {
    return (
      <div className='loading-gif' />
    );
  }

  console.log('WAS RENDERED', user, isTransitioning);

  return (
    <>
      <h1>This is a Profile Page.</h1>
      <span>{`User: ${user.firstName}`}</span>
    </>
  );
};

// UserPage.fetchPageData = async ({ dispatch, params }) => {
//   await dispatch(UserActions.getBy, { id: parseInt(params.userId, 10) });
// };

// UserPage.fetchPageData = ({ dispatch, params }) => Promise.all([
//   dispatch(UserActions.getBy, { id: parseInt(params.userId, 10) }),
// ]);

UserPage.fetchPageData = async ({ dispatch, params, isNotFound }) => {
  await sleepAsync(1500);
  const pageData = {
    user: {
      id: 1,
      firstName: 'David',
    },
  };

  if (!pageData.user) {
    isNotFound();
  }

  return pageData;
};

// UserPage.fetchPageData = async ({ dispatch, params, isNotFound }) => {
//   await sleepAsync(3000);
//   isNotFound();
//
//   return {
//     user,
//   };
// };

export default UserPage;
