import PropTypes from 'prop-types';
import Form from '#ui/view/forms/Form/Form.jsx';

const formFields = [
  {
    id: 'firstName',
    title: 'First name',
    type: 'text',
    properties: {
      placeholder: 'Write here...',
    },
    validations: ['required'],
  },
  {
    id: 'lastName',
    title: 'Last name',
    type: 'text',
    properties: {
      placeholder: 'Write here...',
    },
    validations: ['required'],
  },
  {
    id: 'phone',
    title: 'Phone',
    type: 'phone',
     properties: {
      placeholder: '1235551234',
     },
    validations: ['required'],
  },
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'someone@whiteroom.com',
    },
    validations: ['required'],
  },
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    properties: {
      placeholder: 'Write here...',
    },
    validations: ['required'],
  },
];

const SignupForm = ({ onSubmit }) => {
  return (
    <Form
      formFields={formFields}
      onSubmit={onSubmit}
    />
  );
};

SignupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SignupForm;
