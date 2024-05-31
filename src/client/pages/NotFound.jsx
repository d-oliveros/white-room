import React, { Component } from 'react';

import { SCREEN_ID_NOT_FOUND } from '#client/constants/screenIds';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';

@withTransitionHook
@withScreenId(SCREEN_ID_NOT_FOUND)
@withScrollToTop
class NotFound extends Component {
  render() {
    return (
      <div>
        <h1>Whoops, that page doesn't exist</h1>
      </div>
    );
  }
}

export default NotFound;
