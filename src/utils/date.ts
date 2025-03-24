export const formatDate = (timestamp: number) => {
  try {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) {
      return '未知时间';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '未知时间';
  }
}; 