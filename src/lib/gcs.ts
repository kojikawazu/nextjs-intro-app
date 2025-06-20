import { Storage } from '@google-cloud/storage';

// Google Cloud Storage configuration
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // Alternative: Use service account key JSON for production
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
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(jsonPath);

        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error(`File ${jsonPath} not found in bucket ${bucketName}`);
        }

        // Download file content
        const [content] = await file.download();
        const portfolioData = JSON.parse(content.toString());

        return portfolioData;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching portfolio data from GCS:', error);
        }
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
