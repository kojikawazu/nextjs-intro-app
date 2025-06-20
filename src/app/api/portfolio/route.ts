import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/lib/data-server';

export async function GET() {
    try {
        console.log('API: Starting portfolio data fetch...');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('GCS_PRIVATE_BUCKET_NAME:', process.env.GCS_PRIVATE_BUCKET_NAME);
        console.log('GCS_JSON_PATH:', process.env.GCS_JSON_PATH);
        console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
        
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
