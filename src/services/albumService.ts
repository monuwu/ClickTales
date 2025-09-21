import type { 
  CreateAlbumData, 
  UpdateAlbumData, 
  AlbumAPIResponse, 
  AlbumsListResponse,
  PhotosResponse 
} from '../types/album';

const API_BASE_URL = '/api';

class AlbumService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'An error occurred' 
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get all albums for the current user
   */
  async getAlbums(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isPublic?: boolean;
  }): Promise<AlbumsListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isPublic !== undefined) searchParams.set('isPublic', params.isPublic.toString());

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/albums${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<AlbumsListResponse>(response);
  }

  /**
   * Get a specific album by ID
   */
  async getAlbumById(albumId: string): Promise<AlbumAPIResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<AlbumAPIResponse>(response);
  }

  /**
   * Create a new album
   */
  async createAlbum(albumData: CreateAlbumData): Promise<AlbumAPIResponse> {
    const response = await fetch(`${API_BASE_URL}/albums`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(albumData)
    });

    return this.handleResponse<AlbumAPIResponse>(response);
  }

  /**
   * Update an existing album
   */
  async updateAlbum(albumId: string, albumData: UpdateAlbumData): Promise<AlbumAPIResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(albumData)
    });

    return this.handleResponse<AlbumAPIResponse>(response);
  }

  /**
   * Delete an album
   */
  async deleteAlbum(albumId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Add photos to an album
   */
  async addPhotosToAlbum(albumId: string, photoIds: string[]): Promise<AlbumAPIResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}/photos`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ photoIds })
    });

    return this.handleResponse<AlbumAPIResponse>(response);
  }

  /**
   * Remove photos from an album
   */
  async removePhotosFromAlbum(albumId: string, photoIds: string[]): Promise<AlbumAPIResponse> {
    const response = await fetch(`${API_BASE_URL}/albums/${albumId}/photos`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ photoIds })
    });

    return this.handleResponse<AlbumAPIResponse>(response);
  }

  /**
   * Get available photos that can be added to albums
   */
  async getAvailablePhotos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    excludeAlbumId?: string;
  }): Promise<PhotosResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.excludeAlbumId) searchParams.set('excludeAlbum', params.excludeAlbumId);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/photos${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<PhotosResponse>(response);
  }

  /**
   * Set album cover photo
   */
  async setCoverPhoto(albumId: string, photoId: string): Promise<AlbumAPIResponse> {
    return this.updateAlbum(albumId, { coverPhotoId: photoId });
  }

  /**
   * Remove album cover photo
   */
  async removeCoverPhoto(albumId: string): Promise<AlbumAPIResponse> {
    return this.updateAlbum(albumId, { coverPhotoId: undefined });
  }
}

// Export singleton instance
export const albumService = new AlbumService();
export default albumService;