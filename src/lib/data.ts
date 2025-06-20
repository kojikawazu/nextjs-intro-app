import { PortfolioData } from '@/types/portfolio';
import portfolioData from '../../sample.json';

export function getPortfolioDataSync(): PortfolioData {
    // Synchronous version for client components
    return portfolioData as PortfolioData;
}
