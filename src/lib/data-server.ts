import { PortfolioData } from '@/types/portfolio';
import { getPortfolioDataFromGCS } from './gcs';

// Conditional import for development only
let portfolioData: PortfolioData | null = null;
if (process.env.NODE_ENV === 'development') {
    try {
        portfolioData = require('../../sample.json');
    } catch (error) {
        console.warn('sample.json not found, will use GCS only');
    }
}

// Server-side only function for API routes
export async function getPortfolioDataServer(): Promise<PortfolioData> {
    // In development, use local sample.json if available
    if (process.env.NODE_ENV === 'development' && !process.env.FORCE_GCS && portfolioData) {
        return portfolioData;
    }

    try {
        const gcsData = await getPortfolioDataFromGCS();
        return gcsData;
    } catch (error) {
        if (process.env.NODE_ENV === 'development' && portfolioData) {
            console.warn('Failed to fetch from GCS, falling back to local data:', error);
            return portfolioData;
        }
        throw error;
    }
}
