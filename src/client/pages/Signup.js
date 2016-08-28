import React, { PropTypes } from 'react';
import branch from '../core/branch';
import { Auth as AuthActions } from '../actions';

@branch({
  currentUser: ['currentUser']
})
export default class SignupPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static getPageMetadata() {
    return {
      pageTitle: 'White Room - Signup',
      section: 'Signup',
      description: 'Signup through this page.'
    };
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      name: '',
      email: '',
      password: ''
    };

    if (!props.currentUser.roles.anonymous) {
      context.router.push('/');
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  signup(e) {
    e.preventDefault();
    const { name, email, password } = this.state;
    this.props.dispatch(AuthActions.signup, { name, email, password });
  }

  render() {
    const { name, email, password } = this.state;

    return (
      <div className='column'>
        <div className='row'>
          <div className='medium-8 medium-offset-2 columns'>

            <h4>Signup</h4>

            <form onSubmit={::this.signup}>

              <label htmlFor='name'>Name</label>
              <input
                type='text'
                name='name'
                id='name'
                onChange={::this.handleChange}
                value={name}
                placeholder='Name'
              />

              <label htmlFor='email'>Email</label>
              <input
                type='text'
                name='email'
                id='email'
                onChange={::this.handleChange}
                value={email}
                placeholder='Email'
              />

              <label htmlFor='password'>Password</label>
              <input
                type='password'
                name='password'
                id='password'
                onChange={::this.handleChange}
                value={password}
                placeholder='Password'
              />

              <button type='submit' className='button'>Signup</button>
            </form>

            <div>
              <h3>OAuth Signup</h3>
              <span>todo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
