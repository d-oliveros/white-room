import React from 'react';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/hooks/useBranch.js';
import { SCREEN_ID_HOME } from '#client/constants/screenIds.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';

import Link from '#client/components/Link/Link.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Text from '#client/components/Text/Text.jsx';
import Box from '#client/components/Box/Box.jsx';

const HomePage = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_HOME);
  useScrollToTop();

  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  const getPageMetadata = () => ({
    keywords: 'whiteroom, keyword',
    description: 'whiteroom home page.',
    image: 'https://whiteroom.com/images/metadata/og-house.jpg',
  });

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
        <Link to='/login'>Log In</Link>
      }

      <div>
        <button onClick={() => console.log('click')}>Button</button>
        <h3 onClick={() => global.alert('hola')}>Users</h3>
        <Link to='/user/1'>User 1</Link>
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

export default HomePage;
