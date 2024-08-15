import PropTypes from 'prop-types';
import Form from '#ui/view/forms/Form/Form.jsx';

const formFields = [
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'someone@whiteroom.com',
      autocomplete: 'username',
    },
    required: true,
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    properties: {
      placeholder: 'Write here...',
      autocomplete: 'current-password',
    },
    required: true,
  },
];

const LoginForm = ({ onSubmit }) => {
  return (
    <Form
      formFields={formFields}
      onSubmit={onSubmit}
    />
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default LoginForm;
