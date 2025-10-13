import type { Album, CreateAlbumData, UpdateAlbumData } from "../types/album";

interface AlbumsResponse {
  data: {
    albums: Album[];
    pagination: {
      currentPage: number;
      hasNext: boolean;
      total: number;
    };
  };
}

interface AlbumResponse {
  data: Album;
}

interface GetAlbumsParams {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
}

export const albumService = {
  async getAlbums(params: GetAlbumsParams = {}): Promise<AlbumsResponse> {
    return {
      data: {
        albums: [],
        pagination: {
          currentPage: params.page || 1,
          hasNext: false,
          total: 0
        }
      }
    };
  },

  async createAlbum(albumData: CreateAlbumData): Promise<AlbumResponse> {
    const album: Album = {
      id: Math.random().toString(36).substr(2, 9),
      title: albumData.title,
      description: albumData.description,
      isPublic: albumData.isPublic || false,
      userId: "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photos: [],
      _count: { photos: 0 }
    };
    return { data: album };
  },

  async updateAlbum(albumId: string, albumData: UpdateAlbumData): Promise<AlbumResponse> {
    const album: Album = {
      id: albumId,
      title: albumData.title || "Updated Album",
      description: albumData.description,
      isPublic: albumData.isPublic || false,
      userId: "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverPhotoId: albumData.coverPhotoId,
      photos: [],
      _count: { photos: 0 }
    };
    return { data: album };
  },

  async deleteAlbum(albumId: string): Promise<void> {
    console.log(`Deleting album ${albumId}`);
  }
};
