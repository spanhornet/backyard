// Express
import express, { Request, Response, NextFunction } from 'express';

// CORS
import cors from 'cors';

// Cookie Parser
import cookieParser from 'cookie-parser';

// Morgan
import morgan from 'morgan';

// Database
import { databaseConnection } from '@repo/database';

// Cloudflare R2
import { initializeR2Service } from './services/r2.service';

// Routes
import usersRouter from './routes/users.route';
import profilesRouter from './routes/profiles.route';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('dev')); // HTTP request logger
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/profiles', profilesRouter);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Hello, world!', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();

  // Log detailed error information
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`❌ ERROR [${timestamp}]`);
  console.error(`📍 Route: ${req.method} ${req.path}`);
  console.error(`📝 Message: ${err.message}`);
  console.error(`🔍 Stack Trace:`);
  console.error(err.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    const connectionString = process.env.MONGODB_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error('MONGODB_CONNECTION_STRING is not set');
    }

    // Connect to database
    await databaseConnection.connect({
      uri: connectionString,
    });
    console.log('✅ Database connected successfully');

    // Initialize Cloudflare R2 service
    const r2Config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      bucketName: process.env.CLOUDFLARE_BUCKET_NAME!,
      publicUrl: process.env.CLOUDFLARE_PUBLIC_URL!,
    };

    // Validate required environment variables
    if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName || !r2Config.publicUrl) {
      throw new Error('Missing required Cloudflare R2 environment variables');
    }

    // Initialize Cloudflare R2 service
    const r2Service = initializeR2Service(r2Config);

    // Test the connection to make sure it actually works
    await r2Service.validateConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
