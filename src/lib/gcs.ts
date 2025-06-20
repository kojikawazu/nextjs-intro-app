import { Storage } from '@google-cloud/storage';

// Google Cloud Storage configuration
const storage = new Storage({
    // In Cloud Run, use Application Default Credentials (ADC)
    // No explicit credentials needed when running on Google Cloud
    ...(process.env.GOOGLE_CLOUD_PROJECT_ID && {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    }),
    // Only use explicit credentials in development or if ADC is not available
    ...(process.env.NODE_ENV === 'development' && process.env.GOOGLE_APPLICATION_CREDENTIALS && {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    }),
    // Alternative: Use service account key JSON for non-GCP environments
    ...(process.env.GOOGLE_CLOUD_PRIVATE_KEY && {
        credentials: {
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        },
    }),
});

const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME || 'intro_k_pri_bucket';
const jsonPath = process.env.GCS_JSON_PATH || 'json/navbar_intro.json';

export async function getPortfolioDataFromGCS() {
    try {
        console.log(`GCS: Attempting to fetch from bucket: ${bucketName}, file: ${jsonPath}`);
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(jsonPath);

        // Check if file exists
        console.log('GCS: Checking if file exists...');
        const [exists] = await file.exists();
        if (!exists) {
            console.error(`GCS: File ${jsonPath} not found in bucket ${bucketName}`);
            throw new Error(`File ${jsonPath} not found in bucket ${bucketName}`);
        }
        console.log('GCS: File exists, downloading...');

        // Download file content
        const [content] = await file.download();
        console.log('GCS: File downloaded, parsing JSON...');
        const portfolioData = JSON.parse(content.toString());
        console.log('GCS: Successfully parsed portfolio data');

        return portfolioData;
    } catch (error) {
        console.error('GCS Error fetching portfolio data:', error);
        console.error('GCS Error details:', {
            bucketName,
            jsonPath,
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            hasCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PRIVATE_KEY)
        });
        throw new Error(
            `Failed to fetch portfolio data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}

export async function testGCSConnection() {
    try {
        const bucket = storage.bucket(bucketName);
        const [exists] = await bucket.exists();

        if (!exists) {
            throw new Error(`Bucket ${bucketName} does not exist or is not accessible`);
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Successfully connected to GCS bucket: ${bucketName}`);
        }
        return true;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ GCS connection test failed:', error);
        }
        return false;
    }
}
