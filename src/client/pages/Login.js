import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import branch from '../core/branch';
import { Auth as AuthActions } from '../actions';

@branch({
  currentUser: ['currentUser']
})
export default class LoginPage extends React.Component {
  static getPageMetadata() {
    return {
      pageTitle: 'White Room - Login',
      section: 'Login',
      bodyClasses: ['some-body-class', 'another-body-class'],
      description: 'Login through this page.'
    };
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      email: '',
      password: '',
      notFound: false
    };

    this.login = ::this.login;
    this.handleChange = ::this.handleChange;

    if (!props.currentUser.roles.anonymous) {
      context.router.push('/');
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  login(e) {
    e.preventDefault();
    const { email, password } = this.state;
    this.props.dispatch(AuthActions.login, { email, password });
  }

  render() {
    const { email, password } = this.state;

    return (
      <div className='column'>
        <div className='row'>
          <div className='medium-8 medium-offset-2 columns'>

            <h4>Log In</h4>

            <form onSubmit={this.login}>
              <label htmlFor='email'>Email</label>
              <input
                type='text'
                name='email'
                id='email'
                onChange={this.handleChange}
                value={email}
                placeholder='Email'
              />
              <label htmlFor='password'>Password</label>
              <input
                type='password'
                name='password'
                id='password'
                onChange={this.handleChange}
                value={password}
                placeholder='Password'
              />
              <p>
                <Link to='/password-reset'>Forgot your password?</Link>
              </p>
              <button type='submit' className='button'>Log in</button>
            </form>


            <div>
              <h3>OAuth Login</h3>
              <span>todo</span>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
