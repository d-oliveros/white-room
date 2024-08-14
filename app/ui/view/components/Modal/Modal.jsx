import PropTypes from 'prop-types';
import { Modal as FlowbiteModal } from 'flowbite-react';

const Modal = ({ size = 'md', isOpen = true, onClose, header, footer, children }) => {
  // Hide the close button if no onClose function is provided.
  const theme = onClose ? null : {
    header: {
      close: {
        base: 'hidden',
      },
    },
  };

  return (
    <FlowbiteModal show={isOpen} popup={!header && onClose} size={size} onClose={onClose} theme={theme}>
      {(header || onClose) &&
        <FlowbiteModal.Header>
          {header}
        </FlowbiteModal.Header>
      }
      <FlowbiteModal.Body>
        {children}
      </FlowbiteModal.Body>
      {footer &&
        <FlowbiteModal.Footer>
          {footer}
        </FlowbiteModal.Footer>
      }
    </FlowbiteModal>
  );
};

Modal.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default Modal;
