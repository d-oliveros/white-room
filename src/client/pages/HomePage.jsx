import React from 'react';
import { useNavigate } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/hooks/useBranch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';

import Link from '#client/components/Link/Link.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Text from '#client/components/Text/Text.jsx';
import Box from '#client/components/Box/Box.jsx';

const Homepage = ({ isTransitioning, user }) => {
  const navigate = useNavigate();

  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  return (
    <Box width='80%' margin='0 auto'>
      <h1>Home Page</h1>

      {isTransitioning && (
        <div className='loading-gif' />
      )}
      <p>Hello! Thanks for visiting.</p>

      <p>Serverside user: {user?.id || 'Loading...'}</p>

      <p>You are {hasRoleAnonymous(currentUser.roles) ? 'Anonymous' : currentUser.firstName}.</p>

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

Homepage.fetchPageData = async ({ dispatch, params }) => {
  await dispatch(({ state }) => { state.set(['anew'], true); });

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

  return {
    user: {
      id: 1,
    },
  };
};

export default Homepage;
