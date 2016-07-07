import React from 'react';
import { find } from 'lodash';
import branch from 'src/client/core/branch';
import { User as UserActions } from 'src/client/actions';
import { UserEditForm } from '../components';

@branch({
  currentUser: ['currentUser'],
  users: ['users']
})
export default class UserPage extends React.Component {
  static getPageMetadata(state) {
    const currentUser = state.get('currentUser');

    return {
      pageTitle: `${currentUser.name} Page`,
      section: 'User',
      bodyClasses: 'page-home',
      canonical: process.env.APP_HOST,
      keywords: `${currentUser.name}, boilerplate`,
      description: `This is ${currentUser.name}'s page`
    };
  }

  static fetchData(nextState, tree) {
    // loads this page's user before the page loads
    return UserActions.getByPath(tree, nextState.params.userPath);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // only re-render if the user path has changed
    return nextState.params.userPath !== this.props.params.userPath;
  }

  render() {
    const { users, currentUser, params: { userPath } } = this.props;
    const user = find(users, { path: userPath });

    const isPageOwner = currentUser.id === user.id;

    return (
      <div>
        <h1>{currentUser.name}</h1>
        <span>Joined {currentUser.created}</span>

        {isPageOwner ? <UserEditForm user={user}/> : null}
      </div>
    );
  }
}
