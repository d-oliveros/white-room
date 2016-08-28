import React from 'react';
import { IndexLink, Link } from 'react-router';
import { Auth as AuthActions } from '../actions';
import branch from '../core/branch';
import Logo from './Logo';

@branch({
  currentUser: ['currentUser']
})
export default class NavBar extends React.Component {
  handleLogout = () => {
    this.props.dispatch(AuthActions.logout);
  };

  render() {
    const { currentUser } = this.props;

    return (
      <div id='navbar' className='top-bar'>
        <div className='top-bar-title'>
          <Logo/>
        </div>
        <div className='top-bar-left'>
          <ul className='menu'>
            <li><IndexLink to='/' activeClassName='active'>Home</IndexLink></li>
            <li><Link to='/contact' activeClassName='active'>Contact</Link></li>
          </ul>
        </div>

        <div className='top-bar-right'>
          {currentUser.roles.anonymous
            ?
            <ul className='menu'>
              <li><Link to='/login' activeClassName='active'>Log in</Link></li>
              <li><Link to='/signup' activeClassName='active'>Sign up</Link></li>
            </ul>
            :
            <ul className='menu'>
              <li>
                <Link to={`/user/${currentUser.path}`} activeClassName='active'>
                  My Account
                </Link>
              </li>
              <li>
                <a onClick={this.handleLogout}>
                  Log Out
                </a>
              </li>
            </ul>
          }
        </div>
      </div>
    );
  }
}
