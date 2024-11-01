import React from 'react';
import { Link, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadStatusProps {
  imageUrl: string;
}

export function UploadStatus({ imageUrl }: UploadStatusProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('链接已复制到剪贴板！');
    } catch (error) {
      toast.error('复制链接失败');
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 truncate font-mono text-sm text-gray-600">
          {imageUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <Link className="w-4 h-4" />
          复制链接
        </button>
      </div>
    </div>
  );
}