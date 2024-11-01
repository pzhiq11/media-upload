import { uploadToQiniu, readHistory, saveHistory } from '../services/upload.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.error('没有上传文件', 400);
    }

    const userId = req.headers['x-user-id'] || 'anonymous';
    const result = await uploadToQiniu(req.file);
    const timestamp = Date.now();
    
    // 保存到历史记录
    const history = readHistory(userId);
    history.unshift({
      ...result,
      timestamp
    });
    saveHistory(userId, history);

    res.success({
      ...result,
      timestamp
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadHistory = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const history = readHistory(userId);
    res.success(history);
  } catch (error) {
    next(error);
  }
}; 