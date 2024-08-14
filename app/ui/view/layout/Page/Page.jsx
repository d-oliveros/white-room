import PropTypes from 'prop-types';
import NavbarConnected from '#ui/view/layout/Navbar/NavbarConnected.jsx';
import FooterConnected from '#ui/view/layout/Footer/FooterConnected.jsx';

const Page = ({ children }) => {
  return (
    <div>
      <NavbarConnected />
      {children}
      <FooterConnected />
    </div>
  );
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Page;
