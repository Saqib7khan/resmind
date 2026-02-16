'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { uploadResumeAction } from '@/actions/dashboard-actions';
import { motion } from 'framer-motion';

export const ResumeUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleUpload(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Only PDF, DOC, and DOCX files are allowed');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadResumeAction(formData);
      
      if (!result.success) {
        setError(result.error || 'Upload failed');
        console.error('Upload error:', result.error);
      } else {
        setSuccess(true);
        // Reset form or refresh data here
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Upload Resume</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${
            dragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-white/30'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-300">Uploading resume...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <p className="text-green-400 font-semibold">Resume uploaded successfully!</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Drag and drop your resume here, or{' '}
              <label
                htmlFor="resume-upload"
                className="text-purple-400 hover:text-purple-300 cursor-pointer font-semibold"
              >
                browse
              </label>
            </p>
            <p className="text-sm text-gray-500">PDF, DOC, DOCX (max 5MB)</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  );
};
