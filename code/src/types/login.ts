// 通用响应类型
export interface ApiResponse<T = any> {
  message: string
  data: T
} 