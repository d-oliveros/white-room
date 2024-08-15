import PropTypes from 'prop-types';
import PageContainer from '#ui/view/layout/PageContainer/PageContainer.jsx';
import NavbarConnected from '#ui/view/layout/Navbar/NavbarConnected.jsx';
import FooterConnected from '#ui/view/layout/Footer/FooterConnected.jsx';

const Page = ({ children }) => {
  return (
    <div className="w-full h-full">
      <header>
        <NavbarConnected />
      </header>
      <main>
        <div style={{ minHeight: 'calc(100vh - 225px)' }}>
          <PageContainer>
            {children}
          </PageContainer>
        </div>
      </main>
      <FooterConnected />
    </div>
  );
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Page;
