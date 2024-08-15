import { action } from '@storybook/addon-actions';
import Alert from './Alert.jsx';

export default {
  title: 'ui/components/Alert',
  component: Alert,
};

export const Default = {
  args: {
    message: 'Change a few things up and try submitting again.',
  },
};

export const WithMessageBold = {
  args: {
    ...Default.args,
    messageBold: 'Info alert!',
  },
};

export const WithDismiss = {
  args: {
    ...WithMessageBold.args,
    onDismiss: action('Dismiss click'),
  },
};
