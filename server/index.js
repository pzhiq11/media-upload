import express from 'express';
import cors from 'cors';
import multer from 'multer';
import qiniu from 'qiniu';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// 配置七牛云
const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_ACCESS_KEY,
  process.env.QINIU_SECRET_KEY
);

const config = new qiniu.conf.Config();
// config.zone = qiniu.zone.Zone_z0; // 华东机房
// config.zone = qiniu.zone.Zone_z1; // 华北机房
config.zone = qiniu.zone.Zone_z2; // 华南机房
// config.zone = qiniu.zone.Zone_na0; // 北美机房

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 获取文件扩展名
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    // 生成随机字符串作为文件名
    const randomString = Math.random().toString(36).substring(2, 10);
    // 规范的文件命名格式：yyyy-mm-dd/random-string.ext
    const date = new Date();
    const datePrefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const key = `images/${datePrefix}/${randomString}.${ext}`;

    // 生成上传凭证
    const options = {
      scope: process.env.QINIU_BUCKET,
      expires: 7200
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    if (!uploadToken) {
      throw new Error('Failed to generate upload token');
    }

    const uploadPromise = new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, req.file.path, putExtra, (err, body, info) => {
        console.log('response',err, body, info);
        if (err) {
          reject(err);
        }
        if (info.statusCode === 200) {
          resolve(body);
        } else {
          reject(new Error('上传失败'));
        }
      });
    });

    const result = await uploadPromise;
    fs.unlinkSync(req.file.path);
    const fileUrl = `${process.env.QINIU_DOMAIN}/images/${datePrefix}/${randomString}.${ext}`;
    res.json({
      url: fileUrl,
      key: key
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});