import Card from './Card.jsx';

export default {
  title: 'ui/components/Card',
  component: Card,
};

export const Default = {
  args: {
    children: (
      <>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Noteworthy technology acquisitions 2021
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so far,
          in reverse chronological order.
        </p>
      </>
    ),
  },
};

export const WithHref = {
  args: {
    ...Default.args,
    href: 'https://google.com',
  },
};
