import { action } from '@storybook/addon-actions';
import { useForm, FormProvider } from 'react-hook-form';
import PropTypes from 'prop-types';
import FormField from './FormField.jsx';

const StorybookFormProvider = ({ children }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(action('[React Hooks Form] Submit'))}
      >
        {children}
      </form>
    </FormProvider>
  );
};

StorybookFormProvider.propTypes = {
  children: PropTypes.node,
}

const withStorybookForm = () => {
  const StoryWithForm = (Story) => {
    return (
      <StorybookFormProvider>
        <Story />
      </StorybookFormProvider>
    );
  };
  return StoryWithForm;
};

export default {
  title: 'FormField',
  component: FormField,
  decorators: [withStorybookForm()],
};

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
