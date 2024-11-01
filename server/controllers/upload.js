import { uploadToQiniu, readHistory, saveHistory } from '../services/upload.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.error('没有上传文件', 400);
    }

    const result = await uploadToQiniu(req.file);
    
    // 保存到历史记录
    const history = readHistory();
    history.unshift({
      ...result,
      timestamp: Date.now()
    });
    saveHistory(history);

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getUploadHistory = async (req, res, next) => {
  try {
    const history = readHistory();
    res.success(history);
  } catch (error) {
    next(error);
  }
}; 