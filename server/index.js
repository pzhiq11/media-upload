import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { responseHandler } from './middleware/response.js';
import { errorHandler } from './middleware/error.js';
import { uploadRouter } from './routes/upload.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(responseHandler);

// 路由
app.use('/api', uploadRouter);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});