import { supabase } from '../services/supabase'
import type { Photo, Album } from '../contexts/PhotoContext'

// Migration utility for moving localStorage data to Supabase
export class SupabaseMigration {
  // Check if user has localStorage data to migrate
  static hasLocalStorageData(): boolean {
    const photos = localStorage.getItem('clicktales_photos')
    const albums = localStorage.getItem('clicktales_albums')
    const favorites = localStorage.getItem('clicktales_favorites')
    
    return !!(photos || albums || favorites)
  }

  // Migrate localStorage photos to Supabase
  static async migratePhotos(): Promise<number> {
    const photosData = localStorage.getItem('clicktales_photos')
    if (!photosData) return 0

    try {
      const photos: Photo[] = JSON.parse(photosData)
      let migratedCount = 0

      for (const photo of photos) {
        try {
          // Skip if photo is already a data URL (would be too large for DB)
          if (photo.url.startsWith('data:')) {
            console.warn(`Skipping photo ${photo.id} - data URLs cannot be migrated directly`)
            continue
          }

          const { error } = await supabase
            .from('photos')
            .insert({
              filename: photo.filename,
              url: photo.url,
              thumbnail_url: photo.thumbnail || photo.url,
              metadata: photo.metadata || {},
              is_collage: photo.isCollage || false,
              created_at: photo.timestamp.toISOString()
            })

          if (error) {
            console.warn(`Failed to migrate photo ${photo.id}:`, error)
          } else {
            migratedCount++
          }
        } catch (err) {
          console.warn(`Error processing photo ${photo.id}:`, err)
        }
      }

      return migratedCount
    } catch (error) {
      console.error('Error migrating photos:', error)
      return 0
    }
  }

  // Migrate localStorage favorites to Supabase
  static async migrateFavorites(): Promise<number> {
    const favoritesData = localStorage.getItem('clicktales_favorites')
    if (!favoritesData) return 0

    try {
      const favoriteIds: string[] = JSON.parse(favoritesData)
      let migratedCount = 0

      // Get photo IDs that actually exist in Supabase
      const { data: existingPhotos } = await supabase
        .from('photos')
        .select('id')
        .in('id', favoriteIds)

      if (!existingPhotos) return 0

      const existingPhotoIds = existingPhotos.map(p => p.id)

      for (const photoId of favoriteIds) {
        if (!existingPhotoIds.includes(photoId)) continue

        try {
          const { error } = await supabase
            .from('favorites')
            .insert({ photo_id: photoId })

          if (error && !error.message.includes('duplicate')) {
            console.warn(`Failed to migrate favorite ${photoId}:`, error)
          } else {
            migratedCount++
          }
        } catch (err) {
          console.warn(`Error processing favorite ${photoId}:`, err)
        }
      }

      return migratedCount
    } catch (error) {
      console.error('Error migrating favorites:', error)
      return 0
    }
  }

  // Migrate localStorage albums to Supabase
  static async migrateAlbums(): Promise<number> {
    const albumsData = localStorage.getItem('clicktales_albums')
    if (!albumsData) return 0

    try {
      const albums: Album[] = JSON.parse(albumsData)
      let migratedCount = 0

      for (const album of albums) {
        try {
          // Create album
          const { data: albumData, error: albumError } = await supabase
            .from('albums')
            .insert({
              title: album.title,
              description: album.description,
              cover_photo_url: album.coverPhoto,
              created_at: album.createdAt.toISOString(),
              updated_at: album.updatedAt.toISOString()
            })
            .select()
            .single()

          if (albumError) {
            console.warn(`Failed to migrate album ${album.id}:`, albumError)
            continue
          }

          // Add photos to album if they exist
          if (album.photoIds.length > 0) {
            // Check which photos exist in Supabase
            const { data: existingPhotos } = await supabase
              .from('photos')
              .select('id')
              .in('id', album.photoIds)

            if (existingPhotos && existingPhotos.length > 0) {
              const existingPhotoIds = existingPhotos.map(p => p.id)
              const albumPhotos = album.photoIds
                .filter(photoId => existingPhotoIds.includes(photoId))
                .map((photoId, index) => ({
                  album_id: albumData.id,
                  photo_id: photoId,
                  position: index
                }))

              const { error: photosError } = await supabase
                .from('album_photos')
                .insert(albumPhotos)

              if (photosError) {
                console.warn(`Failed to migrate photos for album ${album.id}:`, photosError)
              }
            }
          }

          migratedCount++
        } catch (err) {
          console.warn(`Error processing album ${album.id}:`, err)
        }
      }

      return migratedCount
    } catch (error) {
      console.error('Error migrating albums:', error)
      return 0
    }
  }

  // Clean up localStorage after successful migration
  static clearLocalStorage(): void {
    localStorage.removeItem('clicktales_photos')
    localStorage.removeItem('clicktales_albums')
    localStorage.removeItem('clicktales_favorites')
    console.log('localStorage cleared after migration')
  }

  // Run complete migration
  static async runMigration(): Promise<{
    photos: number
    favorites: number
    albums: number
  }> {
    console.log('Starting migration from localStorage to Supabase...')

    const results = {
      photos: await this.migratePhotos(),
      favorites: await this.migrateFavorites(),
      albums: await this.migrateAlbums()
    }

    console.log('Migration completed:', results)

    // Only clear localStorage if at least some data was migrated
    if (results.photos > 0 || results.favorites > 0 || results.albums > 0) {
      this.clearLocalStorage()
    }

    return results
  }
}