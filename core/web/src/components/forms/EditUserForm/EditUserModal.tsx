import { useState } from 'react';
import { Label, TextInput, Checkbox } from 'flowbite-react';
import { HiTrash } from 'react-icons/hi';

import type { GetDatatablesUsers200ItemsItem } from '@namespace/api-client';
import { usePutUsersUserId } from '@namespace/api-client';
import { UserRole } from '@namespace/shared';

import Modal from '@web/components/ui/Modal/Modal';
import Button from '@web/components/ui/Button/Button';
import DeleteUserModal from '../DeleteUserForm/DeleteUserModal';
import UserProfileSection from '@web/components/ui/UserProfileSection/UserProfileSection';

type User = GetDatatablesUsers200ItemsItem;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  user: User;
}

const EditUserModal = ({ isOpen, onClose, onSubmit, user }: EditUserModalProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    roles: user.roles,
  });

  const { mutate: updateUser, isPending } = usePutUsersUserId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(
      {
        userId: user.id,
        data: formData,
      },
      {
        onSuccess: () => {
          onSubmit();
          onClose();
        },
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'isAdmin') {
      const newRoles = checked
        ? [...formData.roles, UserRole.Admin]
        : formData.roles.filter((role) => role !== UserRole.Admin);

      setFormData((prev) => ({
        ...prev,
        roles: newRoles,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isAdmin = formData.roles.includes(UserRole.Admin);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" header="Edit User">
        <div className="mb-6">
          <UserProfileSection
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            profilePictureUrl={user.profilePictureUrl}
            roles={user.roles}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <TextInput
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <TextInput
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <TextInput
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Write phone number..."
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-x-2">
              <Checkbox
                id="isAdmin"
                name="isAdmin"
                checked={isAdmin}
                onChange={handleInputChange}
              />
              <Label htmlFor="isAdmin" className="!mb-0">
                Admin user
              </Label>
            </div>
            <div className="text-sm text-gray-500">Current roles: {formData.roles.join(', ')}</div>
          </div>

          <div className="pt-4">
            <Button type="submit" color="blue" disabled={isPending} className="w-full">
              {isPending ? 'Saving...' : 'Save'}
            </Button>

            <div className="mt-4">
              <Button
                type="button"
                color="dark"
                onClick={onClose}
                className="w-full bg-gray-500 hover:bg-gray-500"
              >
                Cancel
              </Button>
            </div>

            <div className="mt-8">
              <Button
                type="button"
                color="failure"
                onClick={() => setIsDeleteModalOpen(true)}
                icon={<HiTrash className="size-5" />}
                className="w-full"
              >
                Delete
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={() => {
          setIsDeleteModalOpen(false);
          onClose();
          onSubmit();
        }}
        userId={user.id}
      />
    </>
  );
};

export default EditUserModal;
