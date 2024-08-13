import PropTypes from 'prop-types';

const Button = ({ disabled = false, type = 'submit', onClick, children }) => {
  return (
     <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['submit', 'button']),
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export default Button;
