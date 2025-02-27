import request from '@/utils/request'
import type {
  ApiResponse,
  PunchRequest,
  MonthlyStatsRequest,
  WorkHourConfig,
  MonthlyStats,
  UpdateConfigRequest
} from '@/types/workHours'

// 工时打卡
export function punch(data: PunchRequest) {
  return request<ApiResponse<{ id: number }>>('/work-hours/punch', 'post', data)
}

// 获取月度统计
export function getMonthlyStats(params: MonthlyStatsRequest) {
  return request<ApiResponse<{ stats: MonthlyStats }>>('/work-hours/monthly-stats', 'get', params)
}

// 获取工时配置
export function getConfig() {
  return request<ApiResponse<{ config: WorkHourConfig }>>('/work-hours/config', 'get')
}

// 更新工时配置
export function updateConfig(data: UpdateConfigRequest) {
  return request<ApiResponse<{ config: WorkHourConfig }>>('/work-hours/config', 'post', data)
}

// 删除工时记录
export function deleteWorkHour(id: number) {
  return request<ApiResponse>(`/work-hours/${id}`, 'delete')
} 