// 工时记录
export interface WorkHourRecord {
  id: number
  workDate: string
  hours: number
  hourlyRate: number
  workType: 'regular' | 'overtime'
  income: number
}

// 月度统计
export interface MonthlyStats {
  totalHours: number
  regularHours: number
  overtimeHours: number
  totalIncome: number
  regularIncome: number
  overtimeIncome: number
  avgHourlyRate: number
  workDays: number
  dailyStats: Record<string, {
    hours: number
    income: number
    workType: 'regular' | 'overtime'
    hourlyRate: number
  }>
}

// 工时配置
export interface WorkHourConfig {
  defaultHours: number
  defaultHourlyRate: number
  overtimeRate: number
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// API请求类型
export interface PunchRequest {
  workDate: string
  hours: number
  hourlyRate: number
  workType: 'regular' | 'overtime'
}

export interface MonthlyStatsRequest {
  year: number
  month: number
}

export interface UpdateConfigRequest {
  defaultHours: number
  defaultHourlyRate: number
  overtimeRate: number
} 