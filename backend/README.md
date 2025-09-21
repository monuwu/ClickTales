# ClickTales Backend API

A comprehensive backend API for the ClickTales Photobooth application built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Upload & Processing**: Image upload with optimization and cloud storage
- **Database Integration**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Image Processing**: Sharp integration for image optimization and thumbnail generation
- **Cloud Storage**: Cloudinary integration for scalable image storage
- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Handling**: Comprehensive error handling and validation
- **API Documentation**: Well-documented REST API endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## 🛠 Installation

1. **Clone the repository**:
   ```bash
   cd ClickTales/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/clicktales_db"
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed database with sample data
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── authController.ts
│   │   └── photoController.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── security.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   └── photos.ts
│   ├── services/            # Business logic services
│   │   ├── authService.ts
│   │   └── uploadService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── server.ts            # Main server file
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── uploads/                 # Local file upload directory
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Photos
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/photos` | Get all public photos | Optional |
| GET | `/api/photos/:id` | Get photo by ID | Optional |
| GET | `/api/photos/user/me` | Get current user's photos | Yes |
| POST | `/api/photos` | Upload new photo | Yes |
| PUT | `/api/photos/:id` | Update photo details | Yes |
| DELETE | `/api/photos/:id` | Delete photo | Yes |

## 📝 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Upload Photo
```bash
curl -X POST http://localhost:3001/api/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/your/image.jpg" \
  -F "tags=vacation,beach,sunset" \
  -F "isPublic=true"
```

### Get Photos with Pagination
```bash
curl "http://localhost:3001/api/photos?page=1&limit=20&sortBy=createdAt&sortOrder=desc"
```

## 🗄️ Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `username` - Username (unique)
- `name` - Display name
- `password` - Hashed password
- `avatar` - Profile picture URL
- `role` - User role (USER, ADMIN, MODERATOR)
- `isActive` - Account status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Photos Table
- `id` - Unique identifier (CUID)
- `filename` - Original filename
- `originalName` - User-provided filename
- `mimeType` - File MIME type
- `size` - File size in bytes
- `width` - Image width in pixels
- `height` - Image height in pixels
- `url` - Image URL
- `thumbnailUrl` - Thumbnail URL
- `cloudinaryPublicId` - Cloudinary public ID
- `capturedAt` - Capture timestamp
- `location` - Capture location
- `device` - Device information
- `filters` - Applied filters array
- `tags` - Photo tags array
- `isPublic` - Public visibility flag
- `isFeatured` - Featured status
- `userId` - Owner user ID
- `sessionId` - Photobooth session ID

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Essential security headers (helmet.js)
- **File Upload Security**: File type validation and size limits
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=your_production_database_url
JWT_SECRET=your_strong_production_jwt_secret
FRONTEND_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Build and Start
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring and Logging

The API includes comprehensive logging and monitoring features:

- **Morgan**: HTTP request logging
- **Error Tracking**: Structured error logging
- **Health Check**: `/health` endpoint for monitoring
- **Request IDs**: Unique request tracking

## 🔧 Development Tools

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Prisma Studio**: Database GUI (`npm run db:studio`)
- **Hot Reload**: Development server with auto-restart

## 🤝 Frontend Integration

The backend is designed to integrate seamlessly with your existing ClickTales React frontend:

1. Update your frontend's API base URL to `http://localhost:3001/api`
2. Use the authentication endpoints to implement login/register
3. Use the photos endpoints for gallery and upload functionality
4. JWT tokens are returned in the standard format expected by most frontend libraries

### Example Frontend Integration (React)

```javascript
// API service example
const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },
  
  getPhotos: async (token, params = {}) => {
    const url = new URL(`${API_BASE_URL}/photos`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **JWT Token Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration settings

3. **File Upload Issues**:
   - Check file size limits
   - Verify upload directory permissions
   - Confirm Cloudinary configuration

4. **CORS Issues**:
   - Verify FRONTEND_URL matches your frontend URL
   - Check CORS configuration in server.ts

## 📄 License

This project is licensed under the MIT License.