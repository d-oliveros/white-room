import { useState, useRef } from 'react';
import Avatar from './Avatar';
import ProfilePictureUploadModal from './ProfilePictureUploadModal';

interface AvatarProfileProps {
  profilePictureUrl?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  userId?: string;
  canEdit?: boolean;
  onProfilePictureUpdate?: () => void;
}

const AvatarProfile = ({
  profilePictureUrl,
  firstName,
  lastName,
  email,
  userId,
  canEdit = false,
  onProfilePictureUpdate,
}: AvatarProfileProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (!canEdit) return;
    // Directly trigger the file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // Open the modal to confirm upload after file is selected
    setIsUploadModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <div
          className="relative"
          onMouseEnter={() => canEdit && setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleAvatarClick}
        >
          <Avatar img={profilePictureUrl || undefined} rounded size="md" />
          {canEdit && isHovering && (
            <div
              className={[
                'absolute inset-0 flex cursor-pointer items-center justify-center',
                'rounded-full bg-black/50 text-white transition-all duration-200',
              ].join(' ')}
            >
              <span className="text-xs font-medium">Edit</span>
            </div>
          )}
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="font-medium dark:text-white">
          <div className="text-sm text-gray-900 dark:text-gray-300">{`${firstName} ${lastName}`}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
        </div>
      </div>

      {canEdit && userId && (
        <ProfilePictureUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedFile(null);
          }}
          userId={userId}
          selectedFile={selectedFile}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            onProfilePictureUpdate?.();
          }}
        />
      )}
    </>
  );
};

export default AvatarProfile;
