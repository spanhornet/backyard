// Express
import { Request, Response } from 'express';

// Logo.dev Service
import { getLogoDevService } from '../services/logodev.service';

export class CompaniesController {
  /**
   * Search for companies by name
   * Returns a list of matching companies with their logos and domains
   */
  static async searchCompanies(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: 'Invalid query parameter',
          message: 'Query parameter is required and must be a string'
        });
      }

      if (query.trim().length < 2) {
        return res.status(400).json({
          error: 'Query too short',
          message: 'Query must be at least 2 characters long'
        });
      }

      const logoDevService = getLogoDevService();
      const companies = await logoDevService.searchCompanies(query);

      return res.status(200).json({
        success: true,
        query: query,
        count: companies.length,
        companies
      });

    } catch (error) {
      console.error('Search companies error:', error);

      if (error instanceof Error && error.message.includes('not initialized')) {
        return res.status(500).json({
          error: 'Service unavailable',
          message: 'Logo.dev service is not properly configured'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while searching companies'
      });
    }
  }

  /**
   * Get company information by domain
   * Returns company details including logo URL
   */
  static async getCompanyByDomain(req: Request, res: Response) {
    try {
      const { domain } = req.params;

      if (!domain) {
        return res.status(400).json({
          error: 'Invalid domain parameter',
          message: 'Domain parameter is required'
        });
      }

      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({
          error: 'Invalid domain format',
          message: 'Please provide a valid domain (e.g., example.com)'
        });
      }

      const logoDevService = getLogoDevService();
      const company = await logoDevService.getCompanyByDomain(domain);

      if (!company) {
        return res.status(404).json({
          error: 'Company not found',
          message: 'No company found for this domain'
        });
      }

      return res.status(200).json({
        success: true,
        company
      });

    } catch (error) {
      console.error('Get company by domain error:', error);

      if (error instanceof Error && error.message.includes('not initialized')) {
        return res.status(500).json({
          error: 'Service unavailable',
          message: 'Logo.dev service is not properly configured'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching company'
      });
    }
  }

  /**
   * Get logo URL for a company domain
   * Returns the direct URL to the company's logo
   */
  static async getLogoUrl(req: Request, res: Response) {
    try {
      const { domain } = req.params;
      const { size, format } = req.query;

      if (!domain) {
        return res.status(400).json({
          error: 'Invalid domain parameter',
          message: 'Domain parameter is required'
        });
      }

      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({
          error: 'Invalid domain format',
          message: 'Please provide a valid domain (e.g., example.com)'
        });
      }

      // Validate size if provided
      let sizeNum: number | undefined;
      if (size) {
        sizeNum = parseInt(size as string, 10);
        if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 1000) {
          return res.status(400).json({
            error: 'Invalid size parameter',
            message: 'Size must be a number between 1 and 1000'
          });
        }
      }

      // Validate format if provided
      if (format && format !== 'png' && format !== 'jpg') {
        return res.status(400).json({
          error: 'Invalid format parameter',
          message: 'Format must be either "png" or "jpg"'
        });
      }

      const logoDevService = getLogoDevService();
      const logoUrl = logoDevService.getLogoUrl(domain, {
        size: sizeNum,
        format: format as 'png' | 'jpg' | undefined
      });

      return res.status(200).json({
        success: true,
        domain,
        logoUrl
      });

    } catch (error) {
      console.error('Get logo URL error:', error);

      if (error instanceof Error && error.message.includes('not initialized')) {
        return res.status(500).json({
          error: 'Service unavailable',
          message: 'Logo.dev service is not properly configured'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while getting logo URL'
      });
    }
  }
}

