import { uploadToQiniu, saveUploadHistory, uploadHistoryList } from '../services/upload.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.error('没有上传文件', 400);
    }

    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.error('用户未认证', 401);
    }

    let uploadResult;
    try {
      uploadResult = await uploadToQiniu(req.file);
    } catch (error) {
      console.error('七牛云上传失败:', error);
      return res.error('文件上传失败', 500);
    }
    
    try {
      const result = await saveUploadHistory(
        userId, 
        uploadResult.url, 
        uploadResult.key
      );
      res.success(result);
    } catch (error) {
      // 即使保存历史失败,也返回上传成功的结果
      console.error('保存历史记录失败:', error);
      res.success({
        ...uploadResult,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUploadHistory = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.error('用户未认证', 401);
    }

    try {
      const history = await uploadHistoryList(userId);
      res.success(history);
    } catch (error) {
      console.error('获取历史记录失败:', error);
      res.success([]); // 兜底返回空数组
    }
  } catch (error) {
    next(error);
  }
};

// 添加新的控制器方法
export const getRandomImage = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.error('用户未认证', 401);
    }

    try {
      const history = await uploadHistoryList(userId);
      if (history.length === 0) {
        return res.error('暂无图片', 404);
      }
      
      // 随机选择一张图片
      const randomIndex = Math.floor(Math.random() * history.length);
      const randomImage = history[randomIndex];
      
      res.success(randomImage);
    } catch (error) {
      console.error('获取随机图片失败:', error);
      res.error('获取随机图片失败');
    }
  } catch (error) {
    next(error);
  }
}; 