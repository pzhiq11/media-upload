import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import UploadHistory from './components/UploadHistory';
import RandomImage from './components/RandomImage';
import { api } from './lib/api';
import type { UploadedFile } from './types';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUploadSuccess = (file: UploadedFile) => {
    setUploadedFiles((prev) => [file, ...prev]);
    setIsUploading(false);
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <h1 className='text-2xl font-bold mb-6'>图片上传</h1>
      <DropZone
        onUploadStart={() => setIsUploading(true)}
        onUploadSuccess={handleUploadSuccess}
        disabled={isUploading}
      />
      <RandomImage />
      <UploadHistory files={uploadedFiles} />
    </div>
  );
}

export default App;
