import type { GetDatatablesUsers200ItemsItem } from '@namespace/api-client';

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TextInput } from 'flowbite-react';
import { HiPlus, HiPencil, HiUsers } from 'react-icons/hi';

import { capitalize } from '@namespace/util';
import { useGetDatatablesUsers } from '@namespace/api-client';
import { UserRole } from '@namespace/shared';
import useAllowedRoles from '@web/hooks/useAllowedRoles';

import AvatarProfile from '@web/components/ui/Avatar/AvatarProfile';
import Table from '@web/components/ui/Table/Table';
import Modal from '@web/components/ui/Modal/Modal';
import Button from '@web/components/ui/Button/Button';
import CreateUserFormConnected from '@web/components/forms/SignupForm/CreateUserFormConnected';
import EditUserModal from '@web/components/forms/EditUserForm/EditUserModal';

const AdminUsersPage = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<GetDatatablesUsers200ItemsItem | null>(null);

  useAllowedRoles({
    roles: [UserRole.Admin],
    redirectUrl: '/login',
  });

  const { data, isLoading, refetch } = useGetDatatablesUsers({
    count: 100,
  });

  const users = data?.data?.items ?? [];

  const handleUserUpdate = () => {
    refetch();
    setEditingUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
  });

  return (
    <>
      <Helmet>
        <title>Users - WEB_TITLE</title>
      </Helmet>
      <h1 className="my-6 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        Users Management
      </h1>
      <div className="mt-2 rounded-lg border border-[#F0F0F0] bg-white">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="mr-4 flex items-center gap-2 text-xl font-bold">
                <HiUsers className="size-6 text-gray-600" />
                User List
              </h2>
              <Button
                onClick={() => setIsAddUserModalOpen(true)}
                color="none"
                className="!bg-[#17A14E] !text-white hover:!bg-[#138235]"
                icon={<HiPlus className="text-xl" />}
              >
                Add user
              </Button>
            </div>
            <div className="relative mt-1 min-w-[220px]">
              <TextInput
                id="users-search"
                name="users-search"
                placeholder="Search for users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            <Table
              headers={['Name', 'Roles', 'Phone', '']}
              rows={
                isLoading
                  ? [['Loading...']]
                  : filteredUsers.map((user) => [
                      <div className="flex items-center px-1">
                        <AvatarProfile
                          profilePictureUrl={user.profilePictureUrl as string}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          email={user.email}
                        />
                      </div>,
                      <div className="px-1 text-sm">
                        {user.roles
                          .filter((role) => role !== UserRole.User)
                          .map((role) => capitalize(role))
                          .join(', ')}
                      </div>,
                      <div className="px-1 text-sm">{user.phone}</div>,
                      <div className="flex justify-center px-1">
                        <Button
                          size="xs"
                          color="gray"
                          className="p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUser(user);
                          }}
                          icon={<HiPencil className="size-4" />}
                        >
                          Edit user
                        </Button>
                      </div>,
                    ])
              }
              onRowClick={(rowIndex) => {
                if (!isLoading) {
                  const user = filteredUsers[rowIndex];
                  setEditingUser(user);
                }
              }}
            />
          </div>
        )}
      </div>
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        size="md"
        header={<div className="px-2 py-1">Add new user</div>}
      >
        <CreateUserFormConnected
          onSubmit={() => {
            setIsAddUserModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsAddUserModalOpen(false)}
        />
      </Modal>
      {editingUser && (
        <EditUserModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUserUpdate}
          user={editingUser}
        />
      )}
    </>
  );
};

export default AdminUsersPage;
