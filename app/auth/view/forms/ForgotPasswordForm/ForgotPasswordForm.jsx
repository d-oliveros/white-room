import PropTypes from 'prop-types';
import Form from '#ui/view/forms/Form/Form.jsx';

const formFields = [
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    properties: {
      placeholder: 'someone@whiteroom.com',
    },
    required: true,
  },
];

const ForgotPasswordForm = ({ onSubmit }) => {
  return (
    <Form
      formFields={formFields}
      onSubmit={onSubmit}
    />
  );
};

ForgotPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;
