// Express
import { Router, type Router as RouterType } from 'express';

import { FilesController, uploadMiddleware } from '../controllers/files.controller';

const router: RouterType = Router();

/**
 * POST /files/upload-file
 * Upload file endpoint - accepts images (jpg, jpeg, png, gif, webp, svg) and documents (pdf, doc, docx)
 * 
 * Responses:
 * - 201: File uploaded successfully
 * - 400: Invalid request (no file/invalid file type)
 * - 500: Internal server error
 */
router.post('/upload-file', uploadMiddleware, FilesController.uploadFile);

/**
 * DELETE /files/delete-file/:key
 * Delete file endpoint - removes file from R2 by key
 *
 * Responses:
 * - 200: File deleted successfully
 * - 400: Invalid request (missing key)
 * - 404: File not found
 * - 500: Internal server error
 */
router.delete('/delete-file/:key', FilesController.deleteFile);

/**
 * GET /files/get-file-url/:key
 * Get file URL endpoint - returns the public URL for a file by key
 *
 * Responses:
 * - 200: File URL retrieved successfully
 * - 400: Invalid request (missing key)
 * - 500: Internal server error
 */
router.get('get-file-url/:key', FilesController.getFileUrl);

export default router;