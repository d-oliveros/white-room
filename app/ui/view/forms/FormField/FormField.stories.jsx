import withStorybookFormProvider from '#whiteroom/client/helpers/withStorybookFormProvider.jsx';
import FormField from './FormField.jsx';

export const Text = {
  args: {
    formField: {
      id: 'firstName',
      title: 'First name',
      type: 'text',
      properties: {
        placeholder: 'Write here...',
      },
      required: true,
    },
  },
};

export const Email = {
  args: {
    formField: {
      id: 'email',
      title: 'Email',
      type: 'email',
      properties: {
        placeholder: 'someone@whiteroom.com',
      },
      required: true,
    },
  },
};

export const Password = {
  args: {
    formField: {
      id: 'password',
      title: 'Password',
      type: 'password',
      properties: {
        placeholder: 'Write here...',
      },
      required: true,
    },
  },
};

export const Checkbox = {
  args: {
    formField: {
      id: 'rememberMe',
      title: 'Remember me',
      type: 'checkbox',
    },
  }
};

export default {
  title: 'ui/forms/FormField',
  component: FormField,
  decorators: [withStorybookFormProvider()],
  formFieldsList: [
    Text.args.formField,
    Email.args.formField,
    Password.args.formField,
    Checkbox.args.formField,
  ],
};
