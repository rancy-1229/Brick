/**
 * 通用类型定义
 */

// 基础响应类型
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  pages: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// 列表查询参数
export interface ListQueryParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 租户列表查询参数
export interface TenantListQueryParams extends ListQueryParams {
  status?: string;
  plan_type?: string;
}

// 选项类型
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// 表格列配置
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: T) => boolean;
}

// 表单字段配置
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'switch';
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  rules?: Array<{
    required?: boolean;
    message?: string;
    pattern?: RegExp;
    min?: number;
    max?: number;
  }>;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
}

// 用户权限
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// 路由元信息
export interface RouteMeta {
  title: string;
  requiresAuth?: boolean;
  role?: string;
  permissions?: Permission[];
  hidden?: boolean;
  icon?: React.ReactNode;
}
