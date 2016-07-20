/* eslint-disable max-len */
import React from 'react';
import { Link } from 'react-router';
import branch from '../core/branch';

@branch({
  currentUser: ['currentUser']
})

export default class HomePage extends React.Component {
  static getPageMetadata() {
    return {
      pageTitle: 'White Room',
      section: 'Home',
      bodyClasses: 'page-home',
      canonical: process.env.APP_HOST,
      keywords: 'some, keywords',
      description: 'Site description here.'
    };
  }

  render() {
    const { currentUser } = this.props;

    return (
      <div className='column'>
        <div className='row'>
          <h1 className='center'>White Room</h1>

          <div className='medium-4 columns'>
            <h3>Heading</h3>
            <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
          </div>

          <div className='medium-4 columns'>
            <h3>Heading</h3>
            <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
          </div>

          <div className='medium-4 columns'>
            <h3>Heading</h3>
            <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
          </div>

        </div>
        <div className='row'>
          <div className='columns'>
            <h3>My Account</h3>

            {currentUser.roles.anonymous
              ?
              <div>
                <span>Please, <Link to='/login'>login</Link> or <Link to='/signup'>signup</Link>.</span>
              </div>

              :
              <div>
                <h4>{`You are logged in as ${currentUser.name || currentUser.email}!`}</h4>
                <Link to={`/user/${currentUser.path}`}>Go to your profile page</Link>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}
