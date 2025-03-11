import type { Meta, StoryObj } from '@storybook/react';
import Table from './Table';

const meta: Meta<typeof Table> = {
  title: 'ui/components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    headers: ['Name', 'Age', 'City'],
    rows: [
      ['John Doe', '30', 'New York'],
      ['Jane Smith', '25', 'Los Angeles'],
      ['Bob Johnson', '35', 'Chicago'],
    ],
  },
};

export const WithCustomStyles: Story = {
  args: {
    ...Default.args,
    striped: true,
  },
};

export const EmptyTable: Story = {
  args: {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [],
  },
};

export const LongTable: Story = {
  args: {
    headers: ['ID', 'Name', 'Email', 'Role'],
    rows: Array(20)
      .fill(null)
      .map((_, index) => [
        `${index + 1}`,
        `User ${index + 1}`,
        `user${index + 1}@example.com`,
        index % 2 === 0 ? 'Admin' : 'User',
      ]),
  },
};
