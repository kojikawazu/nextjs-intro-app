import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/lib/data-server';

export async function GET() {
    try {
        console.log('API: Starting portfolio data fetch...');
        const portfolioData = await getPortfolioDataServer();
        console.log('API: Successfully fetched portfolio data');

        return NextResponse.json(portfolioData, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('API Error fetching portfolio data:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json({ 
            error: 'Failed to fetch portfolio data',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
