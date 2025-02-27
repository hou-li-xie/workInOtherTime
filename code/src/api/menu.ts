import request from '@/utils/request'
import type { ApiResponse } from '@/types/login'
import type { MenuItem } from '@/types/menu'

// 获取菜单列表
export function getMenuList() {
  return request<MenuItem[]>('/menu', 'get')
} 