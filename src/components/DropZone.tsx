import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isUploading: boolean;
}

export function DropZone({ onFileSelect, isDragging, setIsDragging, isUploading }: DropZoneProps) {
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files?.[0]) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect, setIsDragging]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-200 flex flex-col items-center justify-center p-6 text-center
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        disabled={isUploading}
      />
      <Upload className={`w-12 h-12 mb-4 ${isUploading ? 'animate-bounce' : ''} text-gray-400`} />
      <p className="mb-2 text-lg font-semibold text-gray-700">
        {isUploading ? '上传中...' : '拖拽图片到这里，或点击选择'}
      </p>
      <p className="text-sm text-gray-500">
        支持格式：JPG、PNG、GIF（最大 10MB）
      </p>
    </div>
  );
}