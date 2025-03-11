import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Button from '@web/components/ui/Button/Button';
import Modal from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'ui/components/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    onClose: action('Close Click'),
    children: (
      <div className="space-y-6">
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          With less than a month to go before the European Union enacts new consumer privacy laws
          for its citizens, companies around the world are updating their terms of service
          agreements to comply.
        </p>
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          The European Union's General Data Protection Regulation (G.D.P.R.) goes into effect on May
          25 and is meant to ensure a common set of data rights in the European Union. It requires
          organizations to notify users as soon as possible of high-risk data breaches that could
          personally affect them.
        </p>
      </div>
    ),
  },
};

export const WithHeader: Story = {
  args: {
    ...Default.args,
    header: 'Modal header',
  },
};

export const WithHeaderFooter: Story = {
  args: {
    ...Default.args,
    header: 'Modal header',
    footer: (
      <>
        <Button onClick={action('Accept Click')}>I accept</Button>
        <Button color="gray" onClick={action('Decline Click')}>
          Decline
        </Button>
      </>
    ),
  },
};

export const NoClose: Story = {
  args: {
    ...Default.args,
    onClose: null,
  },
};

export const NoCloseWithHeaderNoClose: Story = {
  args: {
    ...NoClose.args,
    header: 'Modal header',
  },
};

export const NoCloseWithHeaderFooter: Story = {
  args: {
    ...NoClose.args,
    header: 'Modal header',
    footer: (
      <>
        <Button onClick={action('Accept Click')}>I accept</Button>
        <Button color="gray" onClick={action('Decline Click')}>
          Decline
        </Button>
      </>
    ),
  },
};
