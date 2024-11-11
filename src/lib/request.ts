interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

class RequestError extends Error {
  code: number;
  
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

const BASE_URL = '/api';

const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

async function fetchCore<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        'x-user-id': getUserId(),
      },
    });
    
    if (!response.ok) {
      throw new RequestError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }
    
    const result = await response.json() as ApiResponse<T>;
    
    // 处理业务错误
    if (result.code !== 200) {
      throw new RequestError(result.message, result.code);
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof RequestError) {
      throw error;
    }
    console.error('Request error:', error);
    throw new RequestError(
      error instanceof Error ? error.message : '网络请求失败',
      -1
    );
  }
}

export const request = {
  get: <T>(url: string, options?: RequestInit) => 
    fetchCore<T>(url, { ...options, method: 'GET' }),
    
  post: <T>(url: string, data?: FormData | Record<string, unknown>, options?: RequestInit) =>
    fetchCore<T>(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: {
        ...options?.headers,
        ...(!(data instanceof FormData) && {
          'Content-Type': 'application/json'
        })
      }
    }),
};

export { RequestError }; 