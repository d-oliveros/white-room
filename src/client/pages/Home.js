import React, { Component } from 'react';

import { hasRoleAnonymous } from '#common/userRoles.js';

import branch from '#client/core/branch.js';
import { SCREEN_ID_HOME } from '#client/constants/screenIds';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';

import Link from '#client/components/Link/Link.js';
import Flex from '#client/components/Flex/Flex.js';
import Text from '#client/components/Text/Text.js';
import Box from '#client/components/Box/Box.js';

@withTransitionHook
@withScreenId(SCREEN_ID_HOME)
@withScrollToTop
@branch({
  currentUser: ['currentUser'],
})
class HomePage extends Component {
  static getPageMetadata = () => ({
    keywords: 'whiteroom, keyword',
    description: (
      'whiteroom home page.'
    ),
    image: 'https://whiteroom.com/images/metadata/og-house.jpg',
  })

  render() {
    const { currentUser } = this.props;

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
          <h3>Users</h3>
          <Link to='/user/1'>User 1</Link>
        </div>

        <Flex>
          <Text font='greycliff' weight='18' size='800' color='green'>
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
  }
}

export default HomePage;
