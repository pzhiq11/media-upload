import React, { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './RandomImage.module.css';
import { formatDate } from '@/utils/date';
import type { UploadedFile } from '@/types';

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
      
      try {
        await navigator.clipboard.writeText(result.url);
        setLoading(false);
        setGetButtonCopied(true);
        toast.success('随机图片URL已复制到剪贴板');
        
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


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>随机图片</h3>
        <button
          onClick={handleGetRandom}
          disabled={loading}
          className={`${styles.button} ${
            loading 
              ? styles.loading
              : getButtonCopied
                ? styles.copied
                : styles.default
          }`}
        >
          {loading ? '获取中...' : getButtonCopied ? '已复制' : '获取随机图片'}
        </button>
      </div>

      {randomImage && (
        <div className={styles.imageContainer}>
          <div className={styles.imageContent}>
            <img 
              src={randomImage.url} 
              alt="随机图片" 
              className={styles.image}
            />
            <div className={styles.info}>
              <div className={styles.infoHeader}>
                <p className={styles.infoTitle}>当前随机图片：</p>
                <button
                  onClick={() => handleCopy(randomImage.url)}
                  className={`${styles.copyButton} ${
                    copiedUrl ? styles.copied : styles.default
                  }`}
                >
                  {copiedUrl ? '已复制' : '复制链接'}
                </button>
              </div>
              <p className={styles.url}>{randomImage.url}</p>
              <p className={styles.timestamp}>
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