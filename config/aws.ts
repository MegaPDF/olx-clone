import { env } from '../lib/env';
type Region = string;

interface AWSConfig {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: Region;
  s3: {
    bucketName: string;
    cloudFrontUrl?: string;
    signedUrlExpiration: number;
    uploadLimits: {
      maxFileSize: number;
      allowedMimeTypes: string[];
      maxFilesPerUpload: number;
    };
    folders: {
      images: string;
      documents: string;
      avatars: string;
      temp: string;
    };
  };
  ses?: {
    region: Region;
    fromEmail: string;
    fromName: string;
  };
}

export const awsConfig: AWSConfig = {
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  },
  region: env.AWS_REGION as Region,
  s3: {
    bucketName: env.AWS_S3_BUCKET_NAME,
    cloudFrontUrl: env.AWS_CLOUDFRONT_URL,
    signedUrlExpiration: 3600, // 1 hour
    uploadLimits: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'text/plain'
      ],
      maxFilesPerUpload: 10
    },
    folders: {
      images: 'images',
      documents: 'documents',
      avatars: 'avatars',
      temp: 'temp'
    }
  },
  ses: env.EMAIL_PROVIDER === 'ses' ? {
    region: env.AWS_REGION as Region,
    fromEmail: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME
  } : undefined
};

// S3 bucket policies and CORS configuration
export const s3BucketConfig = {
  cors: {
    CORSRules: [
      {
        AllowedOrigins: [env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'],
        AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        AllowedHeaders: ['*'],
        MaxAgeSeconds: 3000
      }
    ]
  },
  publicReadPolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${awsConfig.s3.bucketName}/images/*`
      }
    ]
  }
};

// Image processing configurations
export const imageProcessingConfig = {
  thumbnails: {
    small: { width: 150, height: 150, quality: 80 },
    medium: { width: 300, height: 300, quality: 85 },
    large: { width: 800, height: 600, quality: 90 }
  },
  formats: {
    jpeg: { quality: 85 },
    webp: { quality: 80 },
    png: { compressionLevel: 6 }
  }
};