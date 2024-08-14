import withStorybookFormProvider from '#white-room/client/helpers/withStorybookFormProvider.jsx';
import Button from '#ui/view/components/Button/Button.jsx';
import FormFieldStories from '#ui/view/forms/FormField/FormField.stories.jsx';
import FormFieldGroup from './FormFieldGroup.jsx';

export default {
  title: 'ui/forms/FormFieldGroup',
  component: FormFieldGroup,
  decorators: [withStorybookFormProvider()],
};

export const Default = {
  args: {
    formFields: FormFieldStories.formFieldsList,
  },
};

export const WithSubmit = {
  args: {
    ...Default.args,
    children: (
      <Button type='submit'>
        Submit
      </Button>
    ),
  },
};
