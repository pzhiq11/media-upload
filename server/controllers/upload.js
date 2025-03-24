import {
  uploadToQiniu,
  saveUploadHistory,
  uploadHistoryList,
} from "../services/upload.js";
import fetch from "node-fetch";

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.error("没有上传文件", 400);
    }

    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.error("用户未认证", 401);
    }

    let uploadResult;
    try {
      uploadResult = await uploadToQiniu(req.file);
    } catch (error) {
      console.error("七牛云上传失败:", error);
      return res.error("文件上传失败", 500);
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
      console.error("保存历史记录失败:", error);
      res.success({
        ...uploadResult,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUploadHistory = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.error("用户未认证", 401);
    }

    try {
      const history = await uploadHistoryList(userId);
      res.success(history);
    } catch (error) {
      console.error("获取历史记录失败:", error);
      res.success([]);
    }
  } catch (error) {
    next(error);
  }
};

// 添加新的控制器方法
export const getRandomImage = async (req, res, next) => {
  try {
    let userId = req.headers["x-user-id"];
    if (!userId) {
      userId = "public_user";
    }

    try {
      const history = await uploadHistoryList(userId);
      if (history.length === 0) {
        const width = Math.min(
          Math.max(parseInt(req.query?.width) || 400, 1),
          2000
        );
        const height = Math.min(
          Math.max(parseInt(req.query?.height) || 400, 1),
          2000
        );
        const picsumImage = await getPicsumImage(width, height);
        if (picsumImage) {
          return res.success({ url: picsumImage, timestamp: Date.now() });
        }
        return res.error("暂无图片", 404);
      }

      const randomIndex = Math.floor(Math.random() * history.length);
      const randomImage = history[randomIndex];

      res.success(randomImage);
    } catch (error) {
      console.error("获取随机图片失败:", error);
      res.error("获取随机图片失败");
    }
  } catch (error) {
    next(error);
  }
};

export const getPicsumImage = async (width = 400, height = 400) => {
  try {
    const picsumUrl = `https://picsum.photos/${width}/${height}`;
    const picsumResponse = await fetch(picsumUrl);
    return picsumResponse?.ok ? picsumResponse?.url : null;
  } catch (error) {
    console.error("获取外部随机图片失败:", error);
    return null;
  }
};

export const getRandomImageUrl = async (req, res, next) => {
  try {
    let userId = req.headers["x-user-id"];
    if (!userId) {
      userId = "public_user";
    }

    try {
      const history = await uploadHistoryList(userId);
      if (history.length > 0) {
        // 如果有历史图片，随机返回一张
        const randomIndex = Math.floor(Math.random() * history.length);
        const randomImage = history[randomIndex];

        const acceptHeader = req.headers.accept || "";
        if (
          acceptHeader.includes("text/html") ||
          acceptHeader.includes("image/")
        ) {
          return res.redirect(randomImage.url);
        } else {
          res.setHeader("Content-Type", "text/plain");
          return res.send(randomImage.url);
        }
      }

      const width = Math.min(
        Math.max(parseInt(req.query.width) || 400, 1),
        2000
      );
      const height = Math.min(
        Math.max(parseInt(req.query.height) || 400, 1),
        2000
      );
      const picsumImage = await getPicsumImage(width, height);
      if (picsumImage) {
        const acceptHeader = req.headers.accept || "";
        if (
          acceptHeader.includes("text/html") ||
          acceptHeader.includes("image/")
        ) {
          return res.redirect(picsumImage);
        } else {
          res.setHeader("Content-Type", "text/plain");
          return res.send(picsumImage);
        }
      }

      return res.error("暂无图片", 404);
    } catch (error) {
      console.error("获取随机图片URL失败:", error);
      res.error("获取随机图片URL失败");
    }
  } catch (error) {
    next(error);
  }
};
