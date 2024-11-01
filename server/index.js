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
// 空间对应的机房，根据实际情况选择
config.zone = qiniu.zone.Zone_z2; // 华东机房

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 生成上传凭证
    const options = {
      scope: process.env.QINIU_BUCKET,
      expires: 7200
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    // 生成文件key，使用时间戳和原始文件名
    const key = `${Date.now()}-${req.file.originalname}`;

    // 上传文件
    const uploadPromise = new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, req.file.path, putExtra, (err, body, info) => {
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
    
    // 清理临时文件
    fs.unlinkSync(req.file.path);

    // 返回文件访问链接
    const fileUrl = `${process.env.QINIU_DOMAIN}/${key}`;
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