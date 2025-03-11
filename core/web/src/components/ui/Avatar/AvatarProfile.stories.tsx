import type { Meta, StoryObj } from '@storybook/react';
import AvatarProfile from './AvatarProfile';

const meta: Meta<typeof AvatarProfile> = {
  title: 'ui/components/AvatarProfile',
  component: AvatarProfile,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AvatarProfile>;

export const Default: Story = {
  args: {
    profilePictureUrl: 'https://i.pravatar.cc/50',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
};

export const WithLongName: Story = {
  args: {
    ...Default.args,
    firstName: 'Christopher',
    lastName: 'Bartholomew',
  },
};

export const WithLongEmail: Story = {
  args: {
    ...Default.args,
    email: 'christopher.bartholomew@verylongdomainname.com',
  },
};
