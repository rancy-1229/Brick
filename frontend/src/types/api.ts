/**
 * API相关类型定义
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// API请求配置
export interface ApiRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  retry?: number;
  timeout?: number;
}

// API响应拦截器配置
export interface ApiResponseInterceptor {
  onSuccess?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onError?: (error: any) => Promise<never>;
}

// API错误信息
export interface ApiError {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  details?: any;
}

// 请求拦截器配置
export interface RequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onRequestError?: (error: any) => Promise<never>;
}

// 上传文件配置
export interface UploadConfig {
  url: string;
  file: File;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

// 下载文件配置
export interface DownloadConfig {
  url: string;
  filename?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

// 批量操作配置
export interface BatchOperationConfig<T = any> {
  items: T[];
  operation: string;
  onProgress?: (completed: number, total: number) => void;
  onSuccess?: (results: any[]) => void;
  onError?: (error: any) => void;
}

// API客户端配置
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retry: number;
  retryDelay: number;
  headers?: Record<string, string>;
  interceptors?: {
    request?: RequestInterceptor;
    response?: ApiResponseInterceptor;
  };
}

// 缓存配置
export interface CacheConfig {
  key: string;
  ttl: number; // 生存时间（秒）
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

// 请求缓存
export interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}
