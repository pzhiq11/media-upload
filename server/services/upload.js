import qiniu from 'qiniu';
import fs from 'fs';

const HISTORY_FILE = './upload-history.json';

// 七牛云配置
const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_ACCESS_KEY,
  process.env.QINIU_SECRET_KEY
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

// 确保历史记录文件存在
const ensureHistoryFile = () => {
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({}), 'utf8');
  }
};

export const uploadToQiniu = (file) => {
  return new Promise((resolve, reject) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const key = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    const options = {
      scope: process.env.QINIU_BUCKET,
      expires: 7200
    };
    
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    formUploader.putFile(uploadToken, key, file.path, putExtra, (err, body, info) => {
      // 清理临时文件
      fs.unlinkSync(file.path);
      
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
  });
};

export const readHistory = (userId) => {
  try {
    ensureHistoryFile();
    const content = fs.readFileSync(HISTORY_FILE, 'utf8');
    // 处理空文件的情况
    if (!content.trim()) {
      return [];
    }
    const allHistory = JSON.parse(content);
    return allHistory[userId] || [];
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
};

export const saveHistory = (userId, userHistory) => {
  try {
    ensureHistoryFile();
    let allHistory = {};
    const content = fs.readFileSync(HISTORY_FILE, 'utf8');
    
    // 处理空文件的情况
    if (content.trim()) {
      allHistory = JSON.parse(content);
    }
    
    // 更新指定用户的历史记录
    allHistory[userId] = userHistory;
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(allHistory, null, 2));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}; 