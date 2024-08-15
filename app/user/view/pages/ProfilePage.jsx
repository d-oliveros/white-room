import { useParams } from 'react-router-dom';
import { useServiceQuery } from '#whiteroom/client/hooks/reactQuery.js';

const getUserQueryParams = (userId) => ({
  serviceId: 'user/getById',
  payload: {
    userId: parseInt(userId, 10),
  },
});

const ProfilePage = () => {
  const params = useParams();
  const getPostsQuery = useServiceQuery(getUserQueryParams(params.userId));

  return (
    <>
      <h1>This is a Profile Page.</h1>
      <span>
        {`User ${getPostsQuery.data?.id}: ${getPostsQuery.data?.firstName}`}
      </span>
    </>
  );
};

ProfilePage.fetchPageData = async ({ prefetchQuery, params }) => {
  await prefetchQuery(getUserQueryParams(params.userId));
};

export default ProfilePage;
