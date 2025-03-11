import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Button from '@web/components/ui/Button/Button';

interface DeleteUserFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

const DeleteUserForm = ({ onSubmit, onClose }: DeleteUserFormProps) => {
  return (
    <div className="flex flex-col items-center gap-y-6 text-center">
      <HiOutlineExclamationCircle className="mx-auto size-20 text-red-600" />
      <p className="text-xl font-normal text-gray-500 dark:text-gray-400">
        Are you sure you want to delete this user?
      </p>
      <div className="flex items-center gap-x-3">
        <Button type="button" color="failure" theme={{ base: 'px-0' }} onClick={onSubmit}>
          <span className="text-base font-medium">Yes, I'm sure</span>
        </Button>
        <Button
          color="dark"
          onClick={onClose}
          theme={{ base: 'px-0' }}
          className="bg-gray-500 hover:bg-gray-500"
        >
          <span className="text-base font-medium">No, cancel</span>
        </Button>
      </div>
    </div>
  );
};

export default DeleteUserForm;
