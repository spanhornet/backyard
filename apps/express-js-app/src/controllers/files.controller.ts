
// Express
import { NextFunction, Request, Response } from 'express';

// Multer
import multer from 'multer';

// Cloudflare R2
import { getR2Service } from '../services/r2.service';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, next);
};

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar'
];

export class FilesController {
  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file provided',
          message: 'Please select a file to upload'
        });
      }

      // Get the file extension
      const extension = req.file.originalname.toLowerCase().split('.').pop() || '';

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
        });
      }

      // Get the Cloudflare R2 service
      const r2Service = getR2Service();

      // Upload the file to Cloudflare R2
      const result = await r2Service.uploadFile(req.file.buffer, req.file.originalname);

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          key: result.key,
          url: result.url,
          size: result.size,
          contentType: result.contentType,
          originalName: req.file.originalname
        }
      });

    } catch (error) {
      console.error('Upload file error:', error);

      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      const statusCode = message.includes('Invalid') ? 400 : 500;

      return res.status(statusCode).json({
        error: statusCode === 400 ? 'Validation error' : 'Internal server error',
        message
      });
    }
  }

  static async deleteFile(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          error: 'File key is required',
          message: 'Please provide a file key to delete'
        });
      }

      // Get the Cloudflare R2 service
      const r2Service = getR2Service();

      const exists = await r2Service.fileExists(key);
      if (!exists) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The specified file does not exist'
        });
      }

      // Delete the file from Cloudflare R2
      await r2Service.deleteFile(key);

      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        key
      });

    } catch (error) {
      console.error('Delete file error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }

  static async getFileUrl(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          error: 'File key is required',
          message: 'Please provide a file key'
        });
      }

      // Get the Cloudflare R2 service
      const r2Service = getR2Service();

      // Get the file URL
      const url = r2Service.getFileUrl(key);

      return res.status(200).json({
        success: true,
        key,
        url
      });

    } catch (error) {
      console.error('Get file URL error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }
}