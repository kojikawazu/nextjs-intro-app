import { PortfolioData } from '@/types/portfolio';
import portfolioData from '../../sample.json';
import { getPortfolioDataFromGCS } from './gcs';

// Server-side only function for API routes
export async function getPortfolioDataServer(): Promise<PortfolioData> {
    // In development, use local sample.json
    if (process.env.NODE_ENV === 'development' && !process.env.FORCE_GCS) {
        return portfolioData as PortfolioData;
    }

    try {
        const gcsData = await getPortfolioDataFromGCS();
        return gcsData;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to fetch from GCS, falling back to local data:', error);
        }
        return portfolioData as PortfolioData;
    }
}
