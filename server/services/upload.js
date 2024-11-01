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

export const readHistory = () => {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
    return [];
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
};

export const saveHistory = (history) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}; 