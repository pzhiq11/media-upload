import React, { useState, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { DropZone } from './components/DropZone';
import { ImagePreview } from './components/ImagePreview';
import { UploadStatus } from './components/UploadStatus';
import { uploadImage } from './lib/api';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const { url } = await uploadImage(file);
      setUploadedUrl(url);
      toast.success('图片上传成功！');
    } catch (error) {
      toast.error('图片上传失败');
      setSelectedImage(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemove = useCallback(() => {
    setSelectedImage(null);
    setUploadedUrl(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ImageIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">图片上传</h1>
          </div>
          <p className="text-gray-600">
            上传图片并获取可分享的链接
          </p>
        </div>

        <div className="space-y-6">
          {!selectedImage ? (
            <DropZone
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              isUploading={isUploading}
            />
          ) : (
            <>
              <ImagePreview
                imageUrl={selectedImage}
                onRemove={handleRemove}
              />
              {uploadedUrl && <UploadStatus imageUrl={uploadedUrl} />}
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>支持格式：JPG、PNG、GIF • 最大文件大小：10MB</p>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;