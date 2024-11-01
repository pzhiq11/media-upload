import React, { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadImage } from '../lib/api';

interface DropZoneProps {
  onUploadStart: () => void;
  onUploadSuccess: (url: string, publicId: string) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onUploadStart, onUploadSuccess, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onFileSelect = useCallback((
    async (file: File) => {
      if (disabled) return;
      onUploadStart();
      setIsUploading(true);
      try {
        const response = await uploadImage(file);
        onUploadSuccess(response.url, response.publicId);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  ),[disabled, onUploadStart, onUploadSuccess]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files?.[0]) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`relative w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      <Upload className={`w-12 h-12 mb-4 ${isUploading ? 'animate-bounce' : ''} text-gray-400`} />
      <p className="mb-2 text-lg font-semibold text-gray-700">
        {isUploading ? '上传中...' : '拖拽图片到这里，或点击选择'}
      </p>
      <p className="text-sm text-gray-500">
        支持格式：JPG、PNG、GIF（最大 10MB）
      </p>
      {disabled && (
        <p className="text-sm text-gray-500 mt-2">正在上传中，请等待...</p>
      )}
    </div>
  );
}

export default DropZone;