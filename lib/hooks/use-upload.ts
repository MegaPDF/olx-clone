// File upload hook
import { useState, useCallback } from 'react';
import type { UploadProgress, UploadedFile } from '../types';

export function useUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const uploadId = Math.random().toString(36).substring(7);
    
    // Add to uploads list
    setUploads(prev => [...prev, {
      file,
      progress: 0,
      status: 'pending'
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploads(prev => prev.map(upload => 
              upload.file === file 
                ? { ...upload, progress, status: 'uploading' }
                : upload
            ));
          }
        });

        // Success
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              setUploads(prev => prev.map(upload => 
                upload.file === file 
                  ? { ...upload, progress: 100, status: 'completed', url: response.data.url }
                  : upload
              ));
              resolve(response.data);
            } else {
              throw new Error(response.error?.message || 'Upload failed');
            }
          } else {
            throw new Error('Upload failed');
          }
        });

        // Error
        xhr.addEventListener('error', () => {
          const error = 'Upload failed';
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'error', error }
              : upload
          ));
          reject(new Error(error));
        });

        xhr.open('POST', '/api/upload/image');
        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploads(prev => prev.map(upload => 
        upload.file === file 
          ? { ...upload, status: 'error', error: errorMessage }
          : upload
      ));
      throw error;
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    const uploadPromises = files.map(file => uploadFile(file));
    return Promise.all(uploadPromises);
  }, [uploadFile]);

  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const isUploading = uploads.some(upload => upload.status === 'uploading');
  const completedUploads = uploads.filter(upload => upload.status === 'completed');
  const failedUploads = uploads.filter(upload => upload.status === 'error');

  return {
    uploads,
    uploadFile,
    uploadMultipleFiles,
    removeUpload,
    clearUploads,
    isUploading,
    completedUploads,
    failedUploads
  };
}
