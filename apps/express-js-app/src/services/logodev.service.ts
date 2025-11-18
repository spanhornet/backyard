// Types
export interface LogoDevCompanyResult {
  name: string;
  domain: string;
  logo?: string;
  description?: string;
}

export interface LogoDevSearchResponse {
  results: LogoDevCompanyResult[];
}

export class LogoDevService {
  private readonly apiUrl = 'https://img.logo.dev';
  private readonly secretKey: string;
  private readonly publishableKey: string;

  constructor(secretKey: string, publishableKey: string) {
    this.secretKey = secretKey;
    this.publishableKey = publishableKey;
  }

  /**
   * Search for companies by name
   * Returns a list of matching companies with their logos and domains
   */
  async searchCompanies(query: string): Promise<LogoDevCompanyResult[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    try {
      // Logo.dev autocomplete/search endpoint
      const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization if secret key is available
      if (this.secretKey) {
        headers['Authorization'] = `Bearer ${this.secretKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Logo.dev API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the response to match our interface
      const results: LogoDevCompanyResult[] = data.map((company: any) => ({
        name: company.name,
        domain: company.domain,
        logo: this.getLogoUrl(company.domain, { size: 128, format: 'png' }),
        description: company.description || undefined,
      }));

      return results;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search companies: ${error.message}`);
      }
      throw new Error('Failed to search companies: Unknown error');
    }
  }

  /**
   * Get company information by domain
   * Returns company details including logo URL
   */
  async getCompanyByDomain(domain: string): Promise<LogoDevCompanyResult | null> {
    if (!domain || domain.trim().length === 0) {
      throw new Error('Domain is required');
    }

    try {
      // Construct logo URL using Logo.dev format with token
      const logoUrl = this.getLogoUrl(domain, { size: 128, format: 'png' });

      // Return basic company info with logo URL
      // Logo.dev will serve the logo directly from this URL
      return {
        name: domain,
        domain: domain,
        logo: logoUrl,
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get company by domain: ${error.message}`);
      }
      throw new Error('Failed to get company by domain: Unknown error');
    }
  }

  /**
   * Get logo URL for a company domain
   * Returns the direct URL to the company's logo
   */
  getLogoUrl(domain: string, options: { size?: number; format?: 'png' | 'jpg' } = {}): string {
    const { size, format = 'png' } = options;

    let url = `${this.apiUrl}/${domain}`;

    const params: string[] = [];

    if (size) {
      params.push(`size=${size}`);
    }

    if (format) {
      params.push(`format=${format}`);
    }

    // Add token for authenticated requests if available
    if (this.publishableKey) {
      params.push(`token=${this.publishableKey}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return url;
  }

  /**
   * Get the publishable key (safe to expose to frontend)
   */
  getPublishableKey(): string {
    return this.publishableKey;
  }
}

// Singleton pattern
let instance: LogoDevService | null = null;

export function initializeLogoDevService(secretKey: string, publishableKey: string): LogoDevService {
  instance = new LogoDevService(secretKey, publishableKey);
  return instance;
}

export function getLogoDevService(): LogoDevService {
  if (!instance) throw new Error('LogoDev service not initialized');
  return instance;
}

