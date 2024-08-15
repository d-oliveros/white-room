import PropTypes from 'prop-types';
import Form from '#ui/view/forms/Form/Form.jsx';

const formFields = [
  {
    id: 'password',
    title: 'Password',
    type: 'password',
    properties: {
      placeholder: 'Write here...',
    },
    required: true,
  },
];

const ResetPasswordForm = ({ onSubmit }) => {
  return (
    <Form
      formFields={formFields}
      onSubmit={onSubmit}
    />
  );
};

ResetPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default ResetPasswordForm;
