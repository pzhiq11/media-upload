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

// 存储上传历史的文件路径
const HISTORY_FILE = './upload-history.json';

// 读取历史记录
function readHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
}

// 保存历史记录
function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}

// 配置七牛云
const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_ACCESS_KEY,
  process.env.QINIU_SECRET_KEY
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

app.use(cors());
app.use(express.json());

// 获取上传历史的接口
app.get('/api/upload-history', (req, res) => {
  const history = readHistory();
  res.json(history);
});

// 上传文件接口
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const randomString = Math.random().toString(36).substring(2, 10);
    const date = new Date();
    const datePrefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const key = `images/${datePrefix}/${randomString}.${ext}`;

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
    const fileUrl = `${process.env.QINIU_DOMAIN}/${key}`;

    // 保存到历史记录
    const history = readHistory();
    history.unshift({
      url: fileUrl,
      key: key,
      timestamp: Date.now()
    });
    saveHistory(history);

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