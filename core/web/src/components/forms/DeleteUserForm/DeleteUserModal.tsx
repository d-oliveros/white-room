import Modal from '@web/components/ui/Modal/Modal';
import DeleteUserFormConnected from './DeleteUserFormConnected';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userId: string;
}

const DeleteUserModal = ({ isOpen, onClose, onSubmit, userId }: DeleteUserModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" header="Delete user">
      <DeleteUserFormConnected onSubmit={onSubmit} onClose={onClose} userId={userId} />
    </Modal>
  );
};

export default DeleteUserModal;
