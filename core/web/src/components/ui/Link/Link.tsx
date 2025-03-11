import {
  type LinkProps as ReactRouterDomLinkProps,
  Link as ReactRouterDomLink,
} from 'react-router-dom';

const Link = (props: ReactRouterDomLinkProps) => {
  return (
    <ReactRouterDomLink
      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
      {...props}
    />
  );
};

export default Link;
