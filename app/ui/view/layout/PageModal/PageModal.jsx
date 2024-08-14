import PropTypes from 'prop-types';
import Modal from '#ui/view/components/Modal/Modal.jsx';

const PageModal = ({ title, backgroundUrl, children }) => {
  return (
   <div
      className="w-full h-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : null}
    >
      <Modal isOpen header={title}>
        {children}
      </Modal>
    </div>
  );
};

PageModal.propTypes = {
  title: PropTypes.string,
  backgroundUrl: PropTypes.string,
  children: PropTypes.node,
};

export default PageModal;
