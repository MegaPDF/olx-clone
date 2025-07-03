// Upload server actions
'use server';

import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { env } from '../env';
import type { FormSubmissionResult } from '../types';

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION
});

export async function uploadImageAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        errors: [{ field: 'file', message: 'No file provided' }]
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        errors: [{ field: 'file', message: 'Invalid file type' }]
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        errors: [{ field: 'file', message: 'File size too large' }]
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `images/${uuidv4()}-${file.name}`;

    const uploadParams = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read' as AWS.S3.ObjectCannedACL
    };

    const result = await s3.upload(uploadParams).promise();

    const url = env.AWS_CLOUDFRONT_URL 
      ? `${env.AWS_CLOUDFRONT_URL}/${key}`
      : result.Location;

    return {
      success: true,
      data: {
        url,
        key,
        size: file.size,
        type: file.type,
        name: file.name
      }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Upload failed' }]
    };
  }
}

export async function uploadMultipleImagesAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return {
        success: false,
        errors: [{ field: 'files', message: 'No files provided' }]
      };
    }

    if (files.length > 10) {
      return {
        success: false,
        errors: [{ field: 'files', message: 'Maximum 10 files allowed' }]
      };
    }

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `images/${uuidv4()}-${file.name}`;

      const uploadParams = {
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read' as AWS.S3.ObjectCannedACL
      };

      const result = await s3.upload(uploadParams).promise();

      const url = env.AWS_CLOUDFRONT_URL 
        ? `${env.AWS_CLOUDFRONT_URL}/${key}`
        : result.Location;

      return {
        url,
        key,
        size: file.size,
        type: file.type,
        originalName: file.name
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return {
      success: true,
      data: uploadedFiles
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Upload failed' }]
    };
  }
}

export async function deleteImageAction(
  key: string
): Promise<FormSubmissionResult> {
  try {
    const deleteParams = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();

    return {
      success: true,
      data: { message: 'Image deleted successfully' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Delete failed' }]
    };
  }
}
