// Album management types
export interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhotoId?: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  photos?: AlbumPhoto[];
  _count?: {
    photos: number;
  };
}

export interface AlbumPhoto {
  id: string;
  albumId: string;
  photoId: string;
  order: number;
  photo?: Photo;
}

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  isProcessed: boolean;
  isFeatured: boolean;
  userId: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumData {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateAlbumData extends Partial<CreateAlbumData> {
  coverPhotoId?: string;
}

export interface AlbumAPIResponse {
  success: boolean;
  message: string;
  data: Album;
}

export interface AlbumsListResponse {
  success: boolean;
  message: string;
  data: {
    albums: Album[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PhotosResponse {
  success: boolean;
  message: string;
  data: {
    photos: Photo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface AlbumManagerProps {
  className?: string;
  onAlbumSelect?: (album: Album) => void;
  onAlbumCreate?: (album: Album) => void;
  onAlbumUpdate?: (album: Album) => void;
  onAlbumDelete?: (albumId: string) => void;
}

export interface AlbumCardProps {
  album: Album;
  onEdit: (album: Album) => void;
  onDelete: (albumId: string) => void;
  onView: (album: Album) => void;
  isLoading?: boolean;
}

export interface AlbumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlbumData) => Promise<void>;
  album?: Album;
  isLoading?: boolean;
}

export interface AlbumDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onEdit: (album: Album) => void;
  onDelete: (albumId: string) => void;
  onAssignPhotos: (album: Album) => void;
}

export interface PhotoAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onPhotosAssigned: (album: Album) => void;
}

export interface PhotoSelectionGridProps {
  photos: Photo[];
  selectedPhotos: Set<string>;
  onPhotoToggle: (photoId: string) => void;
  isLoading?: boolean;
}