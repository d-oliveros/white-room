import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useServiceMutation from '#white-room/client/hooks/useServiceMutation.js';

import { hasRoleAnonymous } from '#user/constants/roles.js';
import sleepAsync from '#white-room/util/sleepAsync.js';
import logger from '#white-room/logger.js';

import useBranch from '#white-room/client/hooks/useBranch.js';
// import useDispatch from '#white-room/client/hooks/useDispatch.js';

import Link from '#app/view/components/Link/Link.jsx';

import './pages.css';

const debug = logger.createDebug('Homepage');

const Homepage = ({ user }) => {
  console.log('Rendering Homepage.jsx');

  const getPostsQuery = useQuery({
    queryKey: ['post/getList'],
  });

  const createPostMutation = useServiceMutation({
    serviceId: 'post/create',
  });

  const currentUser = useBranch('currentUser');
  const navigate = useNavigate();

  logger.info('Rendering Homepage.jsx');

  debug({ user });

  return (
    <div width='80%' style={{ margin: '0 auto' }}>
      <h1 styleName='testing'>Home Page</h1>

      <h1 className='text-3xl font-bold underline'>
        Hello world!
      </h1>

      {getPostsQuery.data?.map((post) => (
        <div key={post.id}>
          <h4>{post.title}</h4>
          <p>{post.content || ''}</p>
        </div>
      ))}

      {createPostMutation.data &&
        <p>NEW POST IS {JSON.stringify(createPostMutation.data, null, 2)}</p>
      }

      <p>
        Hello! Thanks for visiting.
        Serverside user: {user?.id || 'Loading...'}
        Your user roles: {currentUser.roles}
      </p>

      <p>
        You are {hasRoleAnonymous(currentUser.roles)
          ? '--'
          : currentUser.firstName}
      </p>

      {!hasRoleAnonymous(currentUser.roles) &&
        <Link to='/logout'>Log out</Link>
      }

      {hasRoleAnonymous(currentUser.roles) &&
        <>
          <Link to='/login'>Log In</Link>

          <button onClick={() => navigate('/login')}>
            Redirect to Login
          </button>
        </>
      }

      <div>
        <button
          onClick={() => createPostMutation.mutate({
            title: 'My new post',
            content2: 'This is a new post',
          })}
        >
          Create Post
        </button>

        {createPostMutation.error && (
          <pre>{createPostMutation.error.stack}</pre>
        )}

        <h3>Users</h3>
        <Link to='/user/1'>User 1</Link>
        <Link to='/user/51231'>User NonExistant</Link>
        <Link to='/t1e1e12'>Link NonExistant</Link>
      </div>

      <span font='greycliff' size='18' weight='800' color='green'>
        Hello! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque gravida sem ac
        tellus auctor, eget interdum erat sagittis. Sed rutrum erat et tortor venenatis
        ullamcorper ut in augue. Sed sed metus erat. Sed mauris enim, condimentum ac pulvinar
        eu, egestas imperdiet orci. Etiam tempus risus eu lacus tincidunt accumsan. Ut consequat
        massa sed eros facilisis dictum nec sit amet lorem. Sed lacinia risus ut efficitur
        vulputate. Donec elementum nisl eget nibh condimentum dapibus. Cras aliquam quis augue
        eget posuere. Phasellus orci enim, luctus ac laoreet vitae, tincidunt eget lacus.
      </span>
    </div>
  );
};

Homepage.getMetadata = ({ state, params }) => ({
  pageTitle: 'Homepage | White Room',
});

Homepage.fetchPageData = async ({ apiClient, queryClient, state, params }) => {
  // await sleepAsync(process.browser ? 3000 : 0);
  console.log('Sleeeeeping');
  await sleepAsync(400);

  // Returns a 404 code.
  //
  // return new Response('', {
  //   status: 404,
  // });

  // return redirect('/login');

  // await dispatch(({ state }) => { state.set(['anew'], true); });

  // const data = await dispatch(requestApi, {
  //   action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  //   payload: {
  //     true: true,
  //   },
  //   // cache: true,
  // });

  // Example of a redirection.
  // await dispatch(({ navigate }) => navigate('/login'));

  // Example of loading data
  // Mounts automatically to params?
  // dispatch(UserActions.loadById, { id: params.id });

  // fetchPageData redirections

  console.log('WAKE UP!');
  return {
    user: {
      id: 1,
    },
  };
};

export default Homepage;
