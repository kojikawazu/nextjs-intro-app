import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/lib/data-server';

export async function GET() {
    try {
        const portfolioData = await getPortfolioDataServer();

        return NextResponse.json(portfolioData, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching portfolio data:', error);
        }

        return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
    }
}
