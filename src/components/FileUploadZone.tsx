'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatementPreview from './StatementPreview';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  uploadId?: string;
}

interface FileUploadZoneProps {
  onFileUploaded?: (uploadId: string) => void;
  maxFileSize?: number; // bytes
}

export default function FileUploadZone({ 
  onFileUploaded, 
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewUploadId, setPreviewUploadId] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => e.message).join(', ');
        addFileWithError(file, errorMessages);
      });
    }

    // Handle accepted files
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: maxFileSize,
    multiple: true
  });

  const addFileWithError = (file: File, errorMessage: string) => {
    const fileId = generateFileId();
    setUploadedFiles(prev => [...prev, {
      id: fileId,
      file,
      status: 'error',
      progress: 0,
      errorMessage
    }]);
  };

  const uploadFile = async (file: File) => {
    const fileId = generateFileId();
    
    // Add file to list with uploading status
    setUploadedFiles(prev => [...prev, {
      id: fileId,
      file,
      status: 'uploading',
      progress: 50
    }]);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update file status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'processing', progress: 100, uploadId: result.uploadId }
          : f
      ));

      // Start processing the file
      await processFile(fileId, result.uploadId);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', errorMessage: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  };

  const processFile = async (fileId: string, uploadId: string) => {
    try {
      const response = await fetch(`/api/process/${uploadId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      // Update file status to completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed' }
          : f
      ));

      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded(uploadId);
      }

    } catch (error) {
      console.error('Processing error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', errorMessage: error instanceof Error ? error.message : 'Processing failed' }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const viewPreview = (uploadId: string) => {
    setPreviewUploadId(uploadId);
  };

  const downloadCSV = (uploadId: string) => {
    const link = document.createElement('a');
    link.href = `/api/download/${uploadId}?format=csv`;
    link.download = `mobile-money-statement-${uploadId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateFileId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
    }
  };

  // If showing preview, render preview component
  if (previewUploadId) {
    return (
      <StatementPreview 
        uploadId={previewUploadId}
        onClose={() => setPreviewUploadId(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-lg text-blue-600 font-medium">Drop your PDF files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Upload MTN Mobile Money or Airtel Money statements
            </p>
            <p className="text-xs text-gray-400">
              Max file size: {formatFileSize(maxFileSize)} • PDF files only
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploadedFile.status)}
                      <span className="text-sm text-gray-600">
                        {getStatusText(uploadedFile.status)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {uploadedFile.status === 'error' && uploadedFile.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600">{uploadedFile.errorMessage}</p>
                  </div>
                )}

                {/* Success Actions */}
                {uploadedFile.status === 'completed' && uploadedFile.uploadId && (
                  <div className="mt-3 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewPreview(uploadedFile.uploadId!)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => downloadCSV(uploadedFile.uploadId!)}
                    >
                      Download CSV
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}