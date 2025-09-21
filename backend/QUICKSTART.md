# ClickTales Backend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites Check
```bash
node --version  # Should be v18+
npm --version   # Should be v8+
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/)

### 2. Database Setup (PostgreSQL)

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (varies by OS)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Create database
createdb clicktales_db
```

**Option B: Docker PostgreSQL**
```bash
docker run --name clicktales-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=clicktales_db \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud Database (Recommended for production)**
- [Supabase](https://supabase.com/) - Free PostgreSQL with additional features
- [Railway](https://railway.app/) - Simple cloud PostgreSQL
- [PlanetScale](https://planetscale.com/) - MySQL alternative

### 3. Backend Setup
```bash
# Navigate to backend directory
cd ClickTales/backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 4. Configure Environment Variables
Edit the `.env` file with your settings:

```env
# Basic Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database (Update with your database URL)
DATABASE_URL="postgresql://username:password@localhost:5432/clicktales_db"

# JWT Security (Generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-123456789

# Optional: Cloudinary (for cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Database Initialization
```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### 6. Start the Server
```bash
npm run dev
```

You should see:
```
🚀 ClickTales API Server is running!
📍 Environment: development
🌐 Server: http://localhost:3001
📖 API Docs: http://localhost:3001/api
❤️  Health Check: http://localhost:3001/health
```

### 7. Test the API
Open your browser and visit:
- Health Check: http://localhost:3001/health
- API Documentation: http://localhost:3001/api

Or use curl:
```bash
curl http://localhost:3001/health
```

## 🔗 Frontend Integration

Update your frontend's API configuration to connect to the backend:

**In your React frontend:**
1. Create or update your API service file (e.g., `src/services/api.ts`):

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};

export const photoAPI = {
  getPhotos: async (token?: string) => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/photos`, { headers });
    return response.json();
  }
};
```

2. Update your existing contexts/services to use the real API instead of mock data.

## 🧪 Testing the Setup

### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "password": "SecurePass123"
  }'

# Login with the user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Test Photos Endpoint
```bash
# Get public photos (no auth required)
curl http://localhost:3001/api/photos

# Get photos with authentication
curl http://localhost:3001/api/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚡ Development Tips

1. **Database GUI**: Run `npm run db:studio` to open Prisma Studio for visual database management

2. **Logs**: The server logs all requests in development mode

3. **Auto-restart**: The dev server automatically restarts when you change files

4. **Environment**: Switch between environments by changing `NODE_ENV` in your `.env` file

## 🔧 Common Issues & Solutions

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### Issue: JWT Token Error
```
Error: JWT secret not provided
```
**Solution**: Set JWT_SECRET in your `.env` file

### Issue: CORS Error in Frontend
```
Access to fetch has been blocked by CORS policy
```
**Solution**: Ensure FRONTEND_URL in `.env` matches your frontend URL

### Issue: File Upload Error
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```
**Solution**: Ensure the `uploads/` directory exists (it should be created automatically)

## 🚀 Production Deployment

When ready for production:

1. **Set Production Environment**:
   ```env
   NODE_ENV=production
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_strong_production_secret
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Build and Start**:
   ```bash
   npm run build
   npm start
   ```

3. **Use Process Manager** (recommended):
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start dist/server.js --name "clicktales-api"
   pm2 startup
   pm2 save
   ```

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints at http://localhost:3001/api
- Check the server logs for error messages
- Ensure all environment variables are correctly set

Your ClickTales backend is now ready to power your photobooth application! 🎉