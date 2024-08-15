import PropTypes from 'prop-types';

const PageContainer = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {children}
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageContainer;
