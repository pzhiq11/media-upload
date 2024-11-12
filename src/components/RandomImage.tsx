import React, { useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type { UploadedFile } from '../lib/api';

const RandomImage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [randomImage, setRandomImage] = useState<UploadedFile | null>(null);
  const [getButtonCopied, setGetButtonCopied] = useState(false);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success('链接已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      toast.error('复制失败');
    }
  };

  const handleGetRandom = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await api.getRandomImage();
      setRandomImage(result);
      
      // 自动复制并显示状态变化
      try {
        await navigator.clipboard.writeText(result.url);
        setLoading(false);
        setGetButtonCopied(true);
        toast.success('随机图片URL已复制到剪贴板');
        
        // 2秒后恢复按钮原始状态
        setTimeout(() => {
          setGetButtonCopied(false);
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        toast.error('复制失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('获取随机图片失败:', error);
      toast.error('获取随机图片失败');
      setLoading(false);
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
    <div className="mb-8 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">随机图片</h3>
        <button
          onClick={handleGetRandom}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded transition-colors duration-200 
            ${loading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : getButtonCopied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {loading ? '获取中...' : getButtonCopied ? '已复制' : '获取随机图片'}
        </button>
      </div>

      {randomImage && (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <img 
              src={randomImage.url} 
              alt="随机图片" 
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-700">当前随机图片：</p>
                <button
                  onClick={() => handleCopy(randomImage.url)}
                  className={`px-3 py-1 text-sm border rounded transition-colors duration-200 ${
                    copiedUrl
                      ? 'bg-green-500 text-white border-green-500'
                      : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {copiedUrl ? '已复制' : '复制链接'}
                </button>
              </div>
              <p className="text-sm text-gray-500 truncate">{randomImage.url}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(randomImage.timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomImage;