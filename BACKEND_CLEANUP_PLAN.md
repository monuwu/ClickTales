# Backend Cleanup Plan

The current `/backend` folder contains a full Express API with:
- JWT authentication (redundant with Supabase Auth)
- Photo CRUD operations (now handled by Supabase directly)  
- File upload handling (now handled by Supabase Storage)
- Database management with Prisma (replaced by Supabase)

## What to keep:
- Basic health check endpoint
- Webhook endpoints (for Supabase webhooks if needed)
- Any custom business logic that can't be handled client-side

## What to remove/simplify:
- All authentication routes (replaced by Supabase Auth)
- All photo/album CRUD routes (handled by Supabase directly)
- Prisma setup and database schema
- File upload middleware and storage
- JWT token management

## Next Steps:
1. Create minimal Express server with health check
2. Remove Prisma dependencies and database setup
3. Clean up package.json dependencies
4. Update any remaining frontend API calls to use Supabase directly

This will reduce the backend from ~20 files to ~3 files, focusing only on essential server-side logic that can't be handled by Supabase directly.