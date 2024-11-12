import { request } from './request';

export interface UploadedFile {
  url: string;
  key: string;
  timestamp: number;
}

export const api = {
  // 上传图片
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request.post<UploadedFile>('/upload', formData);
  },

  // 获取上传历史
  getUploadHistory: () => {
    return request.get<UploadedFile[]>('/upload-history');
  },

  // 获取随机图片
  getRandomImage: () => {
    return request.get<UploadedFile>('/random-image');
  }
};