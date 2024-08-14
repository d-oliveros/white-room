import PropTypes from 'prop-types';
import Modal from '#ui/view/components/Modal/Modal.jsx';

const PageModal = ({ title, children }) => {
  return (
    <Modal isOpen header={title}>
      {children}
    </Modal>
  );
};

PageModal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

export default PageModal;
