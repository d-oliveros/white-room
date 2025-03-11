import { useDeleteUsersUserId } from '@namespace/api-client';
import DeleteUserForm from './DeleteUserForm';

interface DeleteUserFormConnectedProps {
  onSubmit: () => void;
  onClose: () => void;
  userId: string;
}

const DeleteUserFormConnected = ({ onSubmit, onClose, userId }: DeleteUserFormConnectedProps) => {
  const { mutate: deleteUser } = useDeleteUsersUserId({
    mutation: {
      meta: {
        resetQueries: ['/datatables/users'],
      },
    },
  });

  const handleSubmit = () => {
    deleteUser({ userId });
    onSubmit();
  };

  return <DeleteUserForm onSubmit={handleSubmit} onClose={onClose} />;
};

export default DeleteUserFormConnected;
