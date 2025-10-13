# Backend Setup Guide for ClickTales

This guide will walk you through setting up the backend server and database for your ClickTales application.

## Prerequisites

Before you begin, make sure you have installed:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** 
- **PostgreSQL** (version 14 or higher)

## Step 1: Set Up PostgreSQL Database

### Option A: Local PostgreSQL Installation
1. Install PostgreSQL from [postgresql.org](https://postgresql.org/download/)
2. Create a new database:
```sql
CREATE DATABASE clicktales_db;
CREATE USER clicktales_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE clicktales_db TO clicktales_user;
```

### Option B: Docker PostgreSQL (Recommended for Development)
Create a `docker-compose.yml` file in your backend directory:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clicktales_db
      POSTGRES_USER: clicktales_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run: `docker-compose up -d`

### Option C: Cloud Database (Production)
- **Supabase**: Free PostgreSQL hosting with easy setup
- **Railway**: Simple deployment with PostgreSQL
- **Neon**: Serverless PostgreSQL
- **AWS RDS**: Enterprise-grade PostgreSQL

## Step 2: Install Backend Dependencies

Navigate to your backend directory and install all required packages:

```bash
cd backend
npm install
```

This will install all the packages defined in your `package.json`:
- Express.js with TypeScript
- Prisma ORM with PostgreSQL adapter
- Authentication libraries (bcrypt, jsonwebtoken)
- File upload handling (multer, sharp)
- Cloud storage (cloudinary)
- Security middleware (helmet, cors, rate limiting)

## Step 3: Environment Configuration

Create a `.env` file in your backend directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://clicktales_user:your_secure_password@localhost:5432/clicktales_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-characters"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-min-32-characters"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Cloudinary Configuration (for image storage)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# File Upload Configuration
MAX_FILE_SIZE="10485760"  # 10MB in bytes
UPLOAD_DIR="./uploads"

# Security Configuration
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"  # per window

# Email Configuration (Optional - for notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

### Getting Cloudinary Credentials (Free Image Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Paste them into your `.env` file

## Step 4: Database Schema Setup

Initialize and deploy your database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database with sample data
npx prisma db seed
```

If you want to view your database in a GUI:
```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to browse your data.

## Step 5: Start the Backend Server

Development mode with auto-reload:
```bash
npm run dev
```

Production build and start:
```bash
npm run build
npm start
```

Your backend will be running at `http://localhost:3001`

## Step 6: Frontend Environment Configuration

Create a `.env` file in your frontend directory:

```env
# Backend API URL
REACT_APP_API_URL="http://localhost:3001/api"

# Development flag
REACT_APP_NODE_ENV="development"
```

## Step 7: Test the Integration

1. **Start the backend**: `npm run dev` (from backend directory)
2. **Start the frontend**: `npm run dev` (from frontend directory)
3. **Open your browser**: Go to `http://localhost:5173`
4. **Test authentication**: Try registering a new user or logging in

## API Endpoints Overview

Your backend provides these main endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/change-password` - Change password

### Photos
- `GET /api/photos` - Get all public photos (paginated)
- `GET /api/photos/user/me` - Get current user's photos
- `POST /api/photos` - Upload new photo
- `GET /api/photos/:id` - Get specific photo
- `PUT /api/photos/:id` - Update photo metadata
- `DELETE /api/photos/:id` - Delete photo

### System
- `GET /api/health` - Health check endpoint
- `GET /api` - API documentation

## Troubleshooting

### Database Connection Issues
- Check that PostgreSQL is running
- Verify your `DATABASE_URL` in `.env`
- Ensure the database and user exist
- Check firewall settings

### File Upload Issues
- Make sure the `uploads` directory exists
- Check file permissions
- Verify Cloudinary credentials if using cloud storage

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running on the specified ports

### Authentication Issues
- Verify JWT secrets are properly set
- Check that tokens aren't being blocked by browser security
- Ensure cookies/localStorage are working

### Development Tips
- Use `npx prisma studio` to inspect your database
- Check the backend logs for detailed error messages
- Use browser dev tools to inspect network requests
- The API documentation is available at `http://localhost:3001/api`

## Next Steps

Once your backend is running:

1. **Test all features**: Registration, login, photo upload, photo viewing
2. **Set up production deployment**: Consider Railway, Render, or Vercel
3. **Add additional features**: Albums, collages, admin panel
4. **Implement advanced features**: Real-time updates, push notifications
5. **Add monitoring**: Error tracking, performance monitoring

## Production Deployment

For production deployment, you'll need to:

1. **Choose a hosting provider**: Railway, Render, Heroku, AWS, etc.
2. **Set up environment variables** on your hosting platform
3. **Configure a production database**: Managed PostgreSQL service
4. **Set up domain and SSL**: For secure HTTPS connections
5. **Configure CI/CD**: Automated deployments from your git repository

Your backend is now fully integrated with your frontend and ready for production use!