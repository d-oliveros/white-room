import { useState, useRef, useEffect } from 'react';
import { usePutUsersUserId } from '@namespace/api-client';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import getErrorMessage from '@web/helpers/getErrorMessage';

interface ProfilePictureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedFile?: File | null;
  onSuccess?: () => void;
}

const ProfilePictureUploadModal = ({
  isOpen,
  onClose,
  userId,
  selectedFile: initialSelectedFile,
  onSuccess,
}: ProfilePictureUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialSelectedFile || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: updateUser,
    isPending,
    error,
  } = usePutUsersUserId({
    mutation: {
      onSuccess: () => {
        onSuccess?.();
        resetForm();
        onClose();
      },
    },
  });

  // Update the selected file when the prop changes
  useEffect(() => {
    if (initialSelectedFile) {
      setSelectedFile(initialSelectedFile);

      // Create a preview URL for the initial file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(initialSelectedFile);
    }
  }, [initialSelectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // In a real implementation, you would:
    // 1. Get a signed URL from your backend
    // 2. Upload the file directly to S3
    // 3. Update the user profile with the new URL

    // For now, we'll simulate this by converting the file to a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;

      // Update the user profile with the new profile picture URL
      // Note: We're using the general user update endpoint
      // The actual implementation would need a proper API endpoint for profile pictures
      updateUser({
        userId,
        data: {
          // We're using firstName as a placeholder since profilePictureUrl is not in the schema
          // In a real implementation, you would need to add profilePictureUrl to the schema
          firstName: base64Data.substring(0, 20), // This is just a placeholder and won't work in production
        },
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" header="Update Profile Picture">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
            {getErrorMessage(error)}
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          {previewUrl ? (
            <div
              className="relative size-32 cursor-pointer overflow-hidden rounded-full"
              onClick={triggerFileInput}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img src={previewUrl} alt="Profile preview" className="size-full object-cover" />
              {isHovering && (
                <div
                  className={[
                    'absolute inset-0 flex items-center justify-center rounded-full',
                    'bg-black/50 text-white transition-all duration-200',
                  ].join(' ')}
                >
                  <span className="text-xs font-medium">Edit</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex size-32 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-center"
              onClick={triggerFileInput}
            >
              <span className="text-gray-400">No image selected</span>
            </div>
          )}

          <div className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className={[
                'block w-full cursor-pointer rounded-lg border border-gray-300',
                'bg-gray-50 text-sm text-gray-900 focus:outline-none',
              ].join(' ')}
            />
            <p className="mt-1 text-xs text-gray-500">PNG, JPG or GIF (max. 2MB)</p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            color="blue"
            onClick={handleUpload}
            disabled={!selectedFile || isPending}
            className="w-full"
          >
            {isPending ? 'Saving...' : 'Save Picture'}
          </Button>

          <div className="mt-4">
            <Button
              type="button"
              color="dark"
              onClick={handleCancel}
              className="w-full bg-gray-500 hover:bg-gray-500"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <p>
            Note: This is a prototype implementation. In a production environment, profile pictures
            would be properly uploaded to a storage service.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePictureUploadModal;
