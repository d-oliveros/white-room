import { Link as ReactRouterDomLink } from 'react-router-dom';

const Link = (props) => {
  return (
     <ReactRouterDomLink
      className="font-medium text-blue-600 text-sm dark:text-blue-500 hover:underline"
      {...props}
    />
  );
};

export default Link;
