import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import photoRoutes from './routes/photos';
import albumRoutes from './routes/albums';
import sessionRoutes from './routes/sessions';
import collageRoutes from './routes/collages';
import settingsRoutes from './routes/settings';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ClickTales API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/collages', collageRoutes);
app.use('/api/settings', settingsRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ClickTales API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'POST /api/auth/change-password',
        logout: 'POST /api/auth/logout'
      },
      photos: {
        getAll: 'GET /api/photos',
        getById: 'GET /api/photos/:id',
        getUserPhotos: 'GET /api/photos/user/me',
        update: 'PUT /api/photos/:id',
        delete: 'DELETE /api/photos/:id'
      },
      albums: {
        getAll: 'GET /api/albums',
        getById: 'GET /api/albums/:id',
        create: 'POST /api/albums',
        update: 'PUT /api/albums/:id',
        delete: 'DELETE /api/albums/:id',
        addPhotos: 'POST /api/albums/:id/photos',
        removePhotos: 'DELETE /api/albums/:id/photos',
        reorderPhotos: 'PUT /api/albums/:id/photos/reorder'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Handle 404 routes
app.use('*', notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 ClickTales API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server: http://localhost:${PORT}
📖 API Docs: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/health
  `);
});

export default app;