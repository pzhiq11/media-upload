import qiniu from 'qiniu';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('media-upload');
  }
  return db;
}

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

export const readHistory = async (userId) => {
  try {
    const db = await connectDB();
    const history = await db.collection('history')
      .findOne({ userId }, { projection: { _id: 0, files: 1 } });
    return history?.files || [];
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
};

export const saveHistory = async (userId, files) => {
  try {
    const db = await connectDB();
    await db.collection('history').updateOne(
      { userId },
      { $set: { files } },
      { upsert: true }
    );
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}; 