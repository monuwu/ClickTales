import React from "react";
import type { Album } from "../types/album";

interface PhotoAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onPhotosAssigned: (updatedAlbum: Album) => void;
}

const PhotoAssignmentModal: React.FC<PhotoAssignmentModalProps> = ({
  isOpen,
  onClose,
  album,
  onPhotosAssigned
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onPhotosAssigned(album);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Assign Photos to Album
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            
          </button>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Photo assignment feature is under development.
          </p>
          <p className="text-sm text-gray-500">Album: {album.title}</p>
          <p className="text-xs text-gray-400 mt-2">
            This feature will be available in a future update.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoAssignmentModal;
