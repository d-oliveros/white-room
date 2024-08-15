import PropTypes from 'prop-types';
import Modal from '#ui/view/components/Modal/Modal.jsx';
import Link from '#ui/view/components/Link/Link.jsx';

const PageModal = ({ title, backgroundUrl, footerLinkUrl, footerLinkLabel, children }) => {
  return (
   <div
      className="w-full h-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : null}
    >
      <Modal isOpen header={title}>
        {children}
        {footerLinkUrl && footerLinkLabel &&
          <div className="mt-4 text-center">
            <Link to={footerLinkUrl}>
              {footerLinkLabel}
            </Link>
          </div>
        }
      </Modal>
    </div>
  );
};

PageModal.propTypes = {
  title: PropTypes.string,
  backgroundUrl: PropTypes.string,
  footerLinkUrl: PropTypes.string,
  footerLinkLabel: PropTypes.string,
  children: PropTypes.node,
};

export default PageModal;
