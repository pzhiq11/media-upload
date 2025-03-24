import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { responseHandler } from './middleware/response.js';
import { errorHandler } from './middleware/error.js';
import { uploadRouter } from './routes/upload.js';
import { initDb } from './models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 初始化数据库
await initDb();

app.use(cors());
app.use(express.json());
app.use(responseHandler);

// 静态文件服务
app.use(express.static(join(__dirname, '../dist')));

// API 路由
app.use('/api', uploadRouter);

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const protocol = NODE_ENV === 'production' ? 'https' : 'http';

app.listen(PORT, () => {
  console.log(`环境: ${NODE_ENV}`);
  console.log(`应用访问地址: ${protocol}://localhost:${PORT} \n 端口: ${PORT}` );
  // console.log(`随机图片URL接口: ${protocol}://${host}:${PORT}/api/random-url`);
});