import qiniu from 'qiniu';
import fs from 'fs';
import UploadHistory from '../models/upload.js';

// 七牛云配置
const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_ACCESS_KEY,
  process.env.QINIU_SECRET_KEY
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

export const uploadToQiniu = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('文件不存在'));
      return;
    }

    try {
      const ext = file.originalname.split('.').pop().toLowerCase();
      const key = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const options = {
        scope: process.env.QINIU_BUCKET,
        expires: 7200
      };
      
      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(mac);

      formUploader.putFile(uploadToken, key, file.path, putExtra, (err, body, info) => {
        // 确保临时文件被清理
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.error('清理临时文件失败:', error);
        }
        
        if (err) {
          reject(err);
          return;
        }
        
        if (info.statusCode === 200) {
          resolve({
            url: `${process.env.QINIU_DOMAIN}/${key}`,
            key
          });
        } else {
          reject(new Error('上传失败'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export async function saveUploadHistory(userId, url, key) {
  if (!userId || !url || !key) {
    throw new Error('参数不完整');
  }

  try {
    const timestamp = Date.now();
    
    const record = await UploadHistory.create({
      userId,
      url,
      key,
      timestamp
    });

    if (!record) {
      throw new Error('保存历史记录失败');
    }

    return {
      url: record.url,
      key: record.key,
      timestamp: record.timestamp
    };
  } catch (error) {
    console.error('保存上传历史失败:', error);
    throw new Error('保存上传历史失败');
  }
}

export async function uploadHistoryList(userId) {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  try {
    const records = await UploadHistory.findAll({
      where: {
        userId
      },
      order: [
        ['timestamp', 'DESC']
      ],
      attributes: ['url', 'key', 'timestamp']
    });

    return records.map(record => ({
      url: record.url,
      key: record.key,
      timestamp: record.timestamp
    }));
  } catch (error) {
    console.error('获取上传历史失败:', error);
    // 返回空数组作为兜底
    return [];
  }
} 