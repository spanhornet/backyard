// Express
import { Router, type Router as RouterType } from 'express';

import { CompaniesController } from '../controllers/companies.controller';

const router: RouterType = Router();

/**
 * GET /companies/search
 * Search for companies by name
 * Query Parameters:
 * - query: string (required) - Company name to search for
 * 
 * Responses:
 * - 200: List of matching companies with logos and domains
 * - 400: Invalid request (missing/invalid query parameter)
 * - 500: Internal server error
 */
router.get('/search', CompaniesController.searchCompanies);

/**
 * GET /companies/:domain
 * Get company information by domain
 * URL Parameters:
 * - domain: string (required) - Company domain (e.g., google.com)
 * 
 * Responses:
 * - 200: Company information with logo URL
 * - 400: Invalid request (missing/invalid domain)
 * - 404: Company not found
 * - 500: Internal server error
 */
router.get('/:domain', CompaniesController.getCompanyByDomain);

/**
 * GET /companies/:domain/logo
 * Get logo URL for a company domain
 * URL Parameters:
 * - domain: string (required) - Company domain (e.g., google.com)
 * Query Parameters:
 * - size: number (optional) - Logo size in pixels (1-1000)
 * - format: string (optional) - Logo format ('png' or 'jpg')
 * 
 * Responses:
 * - 200: Logo URL for the specified domain
 * - 400: Invalid request (missing/invalid parameters)
 * - 500: Internal server error
 */
router.get('/:domain/logo', CompaniesController.getLogoUrl);

export default router;

