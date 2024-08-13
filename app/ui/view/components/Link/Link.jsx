import { Link as ReactRouterDomLink } from 'react-router-dom';

const Link = (props) => {
  console.log(props);
  return (
     <ReactRouterDomLink
      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
      {...props}
    />
  );
};

export default Link;
