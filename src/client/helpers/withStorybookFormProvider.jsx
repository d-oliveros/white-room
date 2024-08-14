import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { action } from '@storybook/addon-actions';

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

const withStorybookFormProvider = () => {
  const StoryWithForm = (Story) => {
    return (
      <StorybookFormProvider>
        <Story />
      </StorybookFormProvider>
    );
  };
  return StoryWithForm;
};

export default withStorybookFormProvider;
