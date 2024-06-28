import React from 'react';
import { useNavigate } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';
import sleepAsync from '#common/util/sleepAsync.js';

import useBranch from '#client/hooks/useBranch.js';

import Link from '#client/components/Link/Link.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Text from '#client/components/Text/Text.jsx';
import Box from '#client/components/Box/Box.jsx';

const Homepage = ({ user }) => {
  console.log('Rendering Homepage.jsx');
  const currentUser = useBranch('currentUser');
  const navigate = useNavigate();

  console.log({ currentUser, user, navigate });

  return (
    <Box width='80%' margin='0 auto'>
      <h1>Home Page</h1>

      <p>
        Hello! Thaasdnks for visiting.
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

          <span onClick={() => navigate('/login')}>
            Redirect to Login
          </span>
        </>
      }

      <div>
        <button onClick={() => console.log('click')}>Button</button>
        <h3>Users</h3>
        <Link to='/profile/1'>User 1</Link>
        <Link to='/profile/51231'>User NonExistant</Link>
        <Link to='/t1e1e12'>Link NonExistant</Link>
      </div>

      <Flex>
        <Text font='greycliff' size='18' weight='800' color='green'>
          Hello! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque gravida sem ac
          tellus auctor, eget interdum erat sagittis. Sed rutrum erat et tortor venenatis
          ullamcorper ut in augue. Sed sed metus erat. Sed mauris enim, condimentum ac pulvinar
          eu, egestas imperdiet orci. Etiam tempus risus eu lacus tincidunt accumsan. Ut consequat
          massa sed eros facilisis dictum nec sit amet lorem. Sed lacinia risus ut efficitur
          vulputate. Donec elementum nisl eget nibh condimentum dapibus. Cras aliquam quis augue
          eget posuere. Phasellus orci enim, luctus ac laoreet vitae, tincidunt eget lacus.
        </Text>
      </Flex>
    </Box>
  );
};

Homepage.getMetadata = ({ state, params }) => ({
  pageTitle: 'Homepage | White Room',
});

Homepage.fetchPageData = async ({ apiClient, queryClient, store, params }) => {
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
