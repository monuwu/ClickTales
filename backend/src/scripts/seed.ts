import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clicktales.com' },
    update: {},
    create: {
      email: 'admin@clicktales.com',
      username: 'admin',
      name: 'ClickTales Admin',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash('User123!', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@clicktales.com' },
    update: {},
    create: {
      email: 'demo@clicktales.com',
      username: 'demouser',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
      isActive: true,
    },
  });

  // Create sample photos
  const samplePhotos = [
    {
      id: 'sample-photo-1',
      filename: 'sample-photo-1.jpg',
      originalName: 'My First Photo',
      mimeType: 'image/jpeg',
      size: 1024000,
      width: 1920,
      height: 1080,
      url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
      tags: ['photobooth', 'fun', 'demo'],
      isPublic: true,
      userId: demoUser.id,
    },
    {
      id: 'sample-photo-2',
      filename: 'sample-photo-2.jpg',
      originalName: 'Event Photo',
      mimeType: 'image/jpeg',
      size: 856000,
      width: 1920,
      height: 1080,
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300',
      tags: ['event', 'celebration', 'group'],
      isPublic: true,
      userId: demoUser.id,
    },
    {
      id: 'sample-photo-3',
      filename: 'sample-photo-3.jpg',
      originalName: 'Portrait Session',
      mimeType: 'image/jpeg',
      size: 945000,
      width: 1920,
      height: 1080,
      url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300',
      tags: ['portrait', 'professional', 'studio'],
      isPublic: false,
      userId: demoUser.id,
    },
  ];

  for (const photoData of samplePhotos) {
    await prisma.photo.upsert({
      where: { id: photoData.id },
      update: {},
      create: photoData,
    });
  }

  // Create sample album
  const sampleAlbum = await prisma.album.upsert({
    where: { id: 'sample-album-id' },
    update: {},
    create: {
      id: 'sample-album-id',
      title: 'Demo Event Album',
      description: 'A collection of photos from our demo event',
      isPublic: true,
      userId: demoUser.id,
    },
  });

  // Create sample photobooth session
  await prisma.photoboothSession.upsert({
    where: { id: 'sample-session-id' },
    update: {},
    create: {
      id: 'sample-session-id',
      sessionName: 'Demo Session',
      eventName: 'ClickTales Demo Event',
      location: 'Demo Studio',
      photosTaken: 3,
      settings: {
        timerDuration: 3,
        captureCount: 1,
        filterEnabled: true,
        soundEnabled: true,
      },
      userId: demoUser.id,
    },
  });

  // Create system settings
  const systemSettings = [
    {
      key: 'max_file_size',
      value: '10485760',
      description: 'Maximum file size in bytes (10MB)',
      type: 'NUMBER' as const,
    },
    {
      key: 'allowed_file_types',
      value: 'image/jpeg,image/png,image/webp,image/gif',
      description: 'Allowed file MIME types for uploads',
      type: 'STRING' as const,
    },
    {
      key: 'enable_public_registration',
      value: 'true',
      description: 'Allow public user registration',
      type: 'BOOLEAN' as const,
    },
    {
      key: 'default_photo_visibility',
      value: 'false',
      description: 'Default visibility for new photos',
      type: 'BOOLEAN' as const,
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Created:');
  console.log(`👤 Admin User: admin@clicktales.com (password: Admin123!)`);
  console.log(`👤 Demo User: demo@clicktales.com (password: User123!)`);
  console.log(`📸 ${samplePhotos.length} sample photos`);
  console.log(`📁 1 sample album`);
  console.log(`🎪 1 photobooth session`);
  console.log(`⚙️  ${systemSettings.length} system settings`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });