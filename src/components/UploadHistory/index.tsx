import React, { useState } from 'react';
import styles from './UploadHistory.module.css';
import { formatDate } from '@/utils/date';
import type { UploadHistoryProps } from './types';

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



  return (
    <div className={styles.container}>
      <h3 className={styles.title}>上传历史</h3>
      <div className={styles.list}>
        {files.map((file) => (
          <div key={`${file.key}-${file.timestamp}`} className={styles.item}>
            <div className={styles.itemContent}>
              <img 
                src={file.url} 
                alt="预览" 
                className={styles.image}
              />
              <div className={styles.info}>
                <p className={styles.url}>{file.url}</p>
                <p className={styles.timestamp}>
                  {formatDate(file.timestamp)}
                </p>
              </div>
              <button
                onClick={() => handleCopy(file.url, file.key)}
                className={`${styles.copyButton} ${
                  copiedId === file.key ? styles.copied : styles.default
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