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

const BASE_URL = 'http://localhost:3000/api';

async function fetchCore<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });
    
    const result = await response.json();
    
    if (typeof result.code === 'undefined') {
      return result as T;
    }
    
    const apiResponse = result as ApiResponse<T>;
    if (apiResponse.code !== 0) {
      throw new RequestError(apiResponse.message, apiResponse.code);
    }
    
    return apiResponse.data;
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