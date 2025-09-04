/**
 * 租户API服务
 */

import { api } from '../api';
import { API_BASE_PATH, TENANT_ENDPOINTS } from '../../constants/api';
import {
  TenantCreateRequest,
  TenantCreateResponse,
  TenantResponse,
  TenantListResponse,
  TenantUpdateRequest,
} from '../../types/tenant';
import { TenantListQueryParams } from '../../types/common';

export class TenantApiService {
  private basePath = API_BASE_PATH;

  /**
   * 租户注册
   */
  async registerTenant(data: TenantCreateRequest): Promise<TenantCreateResponse> {
    return api.post(`${this.basePath}${TENANT_ENDPOINTS.REGISTER}`, data);
  }

  /**
   * 获取租户列表
   */
  async getTenantList(params?: TenantListQueryParams): Promise<TenantListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.plan_type) queryParams.append('plan_type', params.plan_type);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = `${this.basePath}${TENANT_ENDPOINTS.LIST}${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  }

  /**
   * 获取租户详情
   */
  async getTenantDetail(tenantId: string): Promise<TenantResponse> {
    return api.get(`${this.basePath}${TENANT_ENDPOINTS.DETAIL(tenantId)}`);
  }

  /**
   * 更新租户信息
   */
  async updateTenant(tenantId: string, data: TenantUpdateRequest): Promise<TenantResponse> {
    return api.put(`${this.basePath}${TENANT_ENDPOINTS.UPDATE(tenantId)}`, data);
  }

  /**
   * 删除租户
   */
  async deleteTenant(tenantId: string): Promise<void> {
    return api.delete(`${this.basePath}${TENANT_ENDPOINTS.DELETE(tenantId)}`);
  }

  /**
   * 获取当前租户信息
   */
  async getCurrentTenant(): Promise<TenantResponse> {
    return api.get(`${this.basePath}${TENANT_ENDPOINTS.ME}`);
  }

  /**
   * 批量删除租户
   */
  async batchDeleteTenants(tenantIds: string[]): Promise<void> {
    const requests = tenantIds.map(id => () => this.deleteTenant(id));
    await api.batch(requests);
  }

  /**
   * 批量更新租户状态
   */
  async batchUpdateTenantStatus(tenantIds: string[], status: string): Promise<void> {
    const requests = tenantIds.map(id => () => this.updateTenant(id, { status }));
    await api.batch(requests);
  }

  /**
   * 搜索租户
   */
  async searchTenants(keyword: string, params?: Omit<TenantListQueryParams, 'search'>): Promise<TenantListResponse> {
    return this.getTenantList({
      ...params,
      search: keyword,
    });
  }

  /**
   * 获取租户统计信息
   */
  async getTenantStats(tenantId: string): Promise<any> {
    return api.get(`${this.basePath}/tenants/${tenantId}/stats`);
  }

  /**
   * 导出租户列表
   */
  async exportTenantList(params?: TenantListQueryParams): Promise<void> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.plan_type) queryParams.append('plan_type', params.plan_type);

    const queryString = queryParams.toString();
    const url = `${this.basePath}/tenants/export${queryString ? `?${queryString}` : ''}`;
    
    return api.download(url, `tenants_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

// 创建租户API服务实例
export const tenantApi = new TenantApiService();

// 导出默认实例
export default tenantApi;
