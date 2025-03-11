import { useState } from 'react';
import { UserRole } from '@namespace/shared';
import useCurrentUser from '@web/hooks/useCurrentUser';
import AvatarProfile from '../Avatar/AvatarProfile';

interface UserProfileSectionProps {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string | null;
}

const UserProfileSection = ({
  userId,
  firstName,
  lastName,
  email,
  profilePictureUrl,
}: UserProfileSectionProps) => {
  const { user } = useCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine if the current user can edit this profile
  const isCurrentUser = user?.id === userId;
  const isAdmin = user?.roles.includes(UserRole.Admin);
  const canEdit = isCurrentUser || isAdmin;

  const handleProfileUpdate = () => {
    // Force a refresh of the component to show the updated profile picture
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" key={refreshKey}>
      <AvatarProfile
        profilePictureUrl={profilePictureUrl || undefined}
        firstName={firstName}
        lastName={lastName}
        email={email}
        userId={userId}
        canEdit={canEdit}
        onProfilePictureUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfileSection;
