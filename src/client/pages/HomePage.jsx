import React from 'react';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/hooks/useBranch.js';
import useDispatch from '#client/hooks/useDispatch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';

import Link from '#client/components/Link/Link.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Text from '#client/components/Text/Text.jsx';
import Box from '#client/components/Box/Box.jsx';

const HomePage = () => {
  const isTransitioning = useTransitionHook(HomePage);
  const dispatch = useDispatch();

  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  if (isTransitioning) {
    return (
      <div className='loading-gif' />
    );
  }

  return (
    <Box width='80%' margin='0 auto'>
      <h1>Home Page</h1>
      <p>Hello! Thanks for visiting.</p>

      {!hasRoleAnonymous(currentUser.roles) &&
        <>
          <p>{`You are ${currentUser.firstName}.`}</p>
          <Link to='/logout'>Log out</Link>
        </>
      }

      {hasRoleAnonymous(currentUser.roles) &&
        <>
          <Link to='/login'>Log In</Link>

          <span onClick={() => dispatch(({ navigate }) => navigate('/login'))}>
            Redirect to Login
          </span>
        </>
      }

      <div>
        <button onClick={() => console.log('click')}>Button</button>
        <h3>Users</h3>
        <Link to='/profile/1'>User 1</Link>
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

HomePage.getMetadata = ({ state, params }) => ({
  pageTitle: 'Homepage | White Room',
});

HomePage.fetchPageData = async ({ dispatch, params }) => {
  // Example of setting state.
  await dispatch(({ state }) => { state.set(['anew'], true); });

  // Example of a redirection.
  // await dispatch(({ navigate }) => navigate('/login'));

  // Example of loading data
  // Mounts automatically to params?
  // dispatch(UserActions.loadById, { id: params.id });

  // fetchPageData redirections
};

export default HomePage;
