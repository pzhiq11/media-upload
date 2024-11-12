import React, { useState } from 'react';

interface UploadedFile {
  url: string;
  key: string;
  timestamp: number;
}

interface UploadHistoryProps {
  files: UploadedFile[];
}

const UploadHistory: React.FC<UploadHistoryProps> = ({ files }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(Number(timestamp));
      if (isNaN(date.getTime())) {
        return '未知时间';
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '未知时间';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">上传历史</h3>
      <div className="space-y-3">
        {files.map((file) => (
          <div key={`${file.key}-${file.timestamp}`} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <img 
                src={file.url} 
                alt="预览" 
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 truncate">{file.url}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(file.timestamp)}
                </p>
              </div>
              <button
                onClick={() => handleCopy(file.url, file.key)}
                className={`px-3 py-1 text-sm border rounded transition-colors duration-200 ${
                  copiedId === file.key
                    ? 'bg-green-500 text-white border-green-500'
                    : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                }`}
              >
                {copiedId === file.key ? '已复制' : '复制链接'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;