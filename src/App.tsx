import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import UploadHistory from './components/UploadHistory';
import { api } from './lib/api';

interface UploadedFile {
  url: string;
  key: string;
  timestamp: number;
}

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getUploadHistory();
        setUploadedFiles(history);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleUploadSuccess = (url: string, key: string) => {
    const newFile = {
      url,
      key,
      timestamp: Date.now(),
    };
    setUploadedFiles(prev => [newFile, ...prev]);
    setIsUploading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">图片上传</h1>
      <DropZone 
        onUploadStart={() => setIsUploading(true)}
        onUploadSuccess={handleUploadSuccess}
        disabled={isUploading}
      />
      <UploadHistory files={uploadedFiles} />
    </div>
  );
}

export default App;