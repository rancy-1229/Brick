/**
 * 认证API服务
 */

import { api } from '../api';
import { API_BASE_PATH, USER_ENDPOINTS } from '../../constants/api';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
  UserProfileResponse,
  UserUpdateRequest,
  ChangePasswordRequest,
} from '../../types/user';

export class AuthApiService {
  private basePath = API_BASE_PATH;

  /**
   * 用户登录 - 注意：后端暂未实现认证API
   */
  async login(_data: UserLoginRequest): Promise<UserLoginResponse> {
    // TODO: 后端认证API实现后启用
    throw new Error('认证API暂未实现，请等待后端开发完成');
    
    // const response = await api.post(`${this.basePath}${USER_ENDPOINTS.LOGIN}`, data);
    // 
    // // 保存token到localStorage
    // if (response.data?.access_token) {
    //   localStorage.setItem('access_token', response.data.access_token);
    //   localStorage.setItem('refresh_token', response.data.refresh_token);
    // }
    // 
    // return response;
  }

  /**
   * 用户注册 - 注意：后端暂未实现认证API
   */
  async register(_data: UserRegisterRequest): Promise<UserRegisterResponse> {
    // TODO: 后端认证API实现后启用
    throw new Error('认证API暂未实现，请等待后端开发完成');
    
    // return api.post(`${this.basePath}${USER_ENDPOINTS.REGISTER}`, data);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${this.basePath}${USER_ENDPOINTS.LOGOUT}`);
    } finally {
      // 清除本地存储的token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(): Promise<UserProfileResponse> {
    return api.get(`${this.basePath}${USER_ENDPOINTS.PROFILE}`);
  }

  /**
   * 更新用户信息
   */
  async updateUserProfile(data: UserUpdateRequest): Promise<UserProfileResponse> {
    return api.put(`${this.basePath}${USER_ENDPOINTS.PROFILE}`, data);
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return api.post(`${this.basePath}/auth/change-password`, data);
  }

  /**
   * 刷新token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post(`${this.basePath}${USER_ENDPOINTS.REFRESH}`, {
      refresh_token: refreshToken,
    });

    // 更新token
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  }

  /**
   * 检查token是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 忘记密码
   */
  async forgotPassword(email: string): Promise<void> {
    return api.post(`${this.basePath}/auth/forgot-password`, { email });
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post(`${this.basePath}/auth/reset-password`, {
      token,
      password: newPassword,
    });
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<void> {
    return api.post(`${this.basePath}/auth/verify-email`, { token });
  }

  /**
   * 重新发送验证邮件
   */
  async resendVerificationEmail(): Promise<void> {
    return api.post(`${this.basePath}/auth/resend-verification`);
  }
}

// 创建认证API服务实例
export const authApi = new AuthApiService();

// 导出默认实例
export default authApi;
