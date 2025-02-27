<template>
  <div class="man-hour">
    <el-row :gutter="16">
      <!-- 左侧区域 -->
      <el-col :span="16">
        <el-card class="summary-card">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">总工时</div>
                <div class="value">{{ monthlyStats.totalHours }}h</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">正班工时</div>
                <div class="value">{{ monthlyStats.regularHours }}h</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">加班工时</div>
                <div class="value">{{ monthlyStats.overtimeHours }}h</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">本月收入</div>
                <div class="value">¥{{ monthlyStats.totalIncome }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="calendar-card">
          <template #header>
            <div class="calendar-header">
              <div class="month-selector">
                <el-button @click="previousMonth">
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
                <el-button @click="nextMonth">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
              <div class="actions">
                <el-button type="primary" @click="handlePunch">
                  打卡
                </el-button>
              </div>
            </div>
          </template>

          <div class="calendar">
            <div class="calendar-header-row">
              <div v-for="day in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="day" class="calendar-cell header">
                {{ day }}
              </div>
            </div>
            <div class="calendar-body">
              <div v-for="(week, weekIndex) in calendar" :key="weekIndex" class="calendar-row">
                <div v-for="(day, dayIndex) in week" :key="`${weekIndex}-${dayIndex}`" 
                     :class="['calendar-cell', { 
                       'current-month': day.currentMonth, 
                       'today': day.isToday,
                       'selected': isSelectedDate(day.date),
                       'has-solar-term': day.solarTerm,
                       'empty-cell': !day.currentMonth
                     }]"
                     @click="day.currentMonth && selectDate(day)">
                  <template v-if="day.currentMonth">
                    <div class="date-number">{{ day.dayOfMonth }}</div>
                    <div v-if="day.lunar" class="lunar-day">{{ day.lunar.day }}</div>
                    <div v-if="day.lunar?.festival" class="lunar-festival">{{ day.lunar.festival }}</div>
                    <div v-if="day.solarTerm" class="solar-term">{{ day.solarTerm }}</div>
                    <div v-if="day.workHours" class="work-info">
                      <div class="work-hours">{{ day.workHours }}h</div>
                      <div class="income">¥{{ day.income }}</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧区域 -->
      <el-col :span="8">
        <!-- 工时分析 -->
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <span>工时分析</span>
            </div>
          </template>
          <div class="analysis-content">
            <div class="analysis-item">
              <div class="label">平均时薪</div>
              <div class="value">¥{{ monthlyStats.avgHourlyRate.toFixed(2) }}</div>
            </div>
            <div class="analysis-item">
              <div class="label">工作天数</div>
              <div class="value">{{ monthlyStats.workDays }}天</div>
            </div>
            <div class="analysis-item">
              <div class="label">日均工时</div>
              <div class="value">{{ (monthlyStats.totalHours / (monthlyStats.workDays || 1)).toFixed(1) }}h</div>
            </div>
            <div class="analysis-item">
              <div class="label">日均收入</div>
              <div class="value">¥{{ (monthlyStats.totalIncome / (monthlyStats.workDays || 1)).toFixed(2) }}</div>
            </div>
          </div>
        </el-card>

        <!-- 近期打卡记录 -->
        <el-card class="recent-records-card">
          <template #header>
            <div class="card-header">
              <span>近期打卡记录</span>
            </div>
          </template>
          <div class="recent-records">
            <el-timeline>
              <el-timeline-item
                v-for="date in Object.keys(monthlyStats.dailyStats).slice(-5).reverse()"
                :key="date"
                :timestamp="formatDate(new Date(date))"
                placement="top"
                type="primary"
              >
                <div class="record-item">
                  <div class="record-info">
                    <span class="hours">{{ monthlyStats.dailyStats[date].hours }}小时</span>
                    <span class="income">¥{{ monthlyStats.dailyStats[date].income }}</span>
                  </div>
                  <div class="record-type">
                    {{ monthlyStats.dailyStats[date].workType === 'regular' ? '正班' : '加班' }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="punchDialogVisible" title="工时打卡" width="400px">
      <el-form :model="punchForm" label-width="100px">
        <el-form-item label="打卡日期">
          <div class="selected-date">{{ formatDate(selectedDate) }}</div>
        </el-form-item>
        <el-form-item label="班次">
          <el-radio-group v-model="punchForm.shift" @change="handleShiftChange">
            <el-radio-button label="day">白班</el-radio-button>
            <el-radio-button label="night">夜班</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工作时长">
          <el-input-number v-model="punchForm.hours" :min="0" :max="24" :precision="1" />
        </el-form-item>
        <el-form-item label="时薪">
          <el-input-number v-model="punchForm.hourlyRate" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="工作类型">
          <el-select v-model="punchForm.type">
            <el-option label="正班" value="regular" />
            <el-option label="加班" value="overtime" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="punchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPunch">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Lunar } from 'lunar-typescript'
import * as workHoursApi from '../../api/workHours'
import type { MonthlyStats } from '../../types/workHours'

// 状态数据
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 月度统计数据
const monthlyStats = ref<MonthlyStats>({
  totalHours: 0,
  regularHours: 0,
  overtimeHours: 0,
  totalIncome: 0,
  regularIncome: 0,
  overtimeIncome: 0,
  avgHourlyRate: 0,
  workDays: 0,
  dailyStats: {}
})

// 日历数据
interface CalendarDay {
  date: Date
  dayOfMonth: number
  currentMonth: boolean
  isToday: boolean
  workHours?: number
  income?: number
  solarTerm?: string
  lunar?: {
    day: string
    festival?: string
  }
}

// 添加节气数据和计算函数
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
]

// 2024年节气数据（实际项目中建议使用专业天文历法库）
const SOLAR_TERMS_2024 = {
  '小寒': '2024-01-06',
  '大寒': '2024-01-20',
  '立春': '2024-02-04',
  '雨水': '2024-02-19',
  '惊蛰': '2024-03-05',
  '春分': '2024-03-20',
  '清明': '2024-04-04',
  '谷雨': '2024-04-20',
  '立夏': '2024-05-05',
  '小满': '2024-05-21',
  '芒种': '2024-06-06',
  '夏至': '2024-06-21',
  '小暑': '2024-07-07',
  '大暑': '2024-07-23',
  '立秋': '2024-08-07',
  '处暑': '2024-08-23',
  '白露': '2024-09-07',
  '秋分': '2024-09-22',
  '寒露': '2024-10-08',
  '霜降': '2024-10-23',
  '立冬': '2024-11-07',
  '小雪': '2024-11-22',
  '大雪': '2024-12-07',
  '冬至': '2024-12-21',
}

const getSolarTerm = (date: Date): string | undefined => {
  const dateStr = date.toISOString().split('T')[0]
  for (const [term, termDate] of Object.entries(SOLAR_TERMS_2024)) {
    if (termDate === dateStr) {
      return term
    }
  }
  return undefined
}

// 农历转换函数
const getLunarInfo = (date: Date) => {
  const lunar = Lunar.fromDate(date)
  const day = lunar.getDayInChinese()
  let festival = lunar.getFestivals()[0]
  
  // 如果是初一，显示月份
  if (lunar.getDay() === 1) {
    return {
      day: lunar.getMonthInChinese() + '月',
      festival
    }
  }
  
  return {
    day,
    festival
  }
}

// 日期格式化工具函数
const formatDateToISO = (date: Date): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const calendar = computed<CalendarDay[][]>(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []
  
  // 填充第一周的空白天数
  let firstDayOfWeek = firstDay.getDay() || 7
  for (let i = 1; i < firstDayOfWeek; i++) {
    const prevDate = new Date(year, month, 1)
    prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i))
    currentWeek.push({
      date: prevDate,
      dayOfMonth: prevDate.getDate(),
      currentMonth: false,
      isToday: false
    })
  }
  
  // 填充当月天数
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    // 尝试多种日期格式来匹配
    const possibleKeys = [
      date.toString(),
      new Date(date.getTime() - date.getTimezoneOffset() * 60000).toString(),
      formatDateToISO(date)
    ]
    
    let stats = null
    for (const key of possibleKeys) {
      if (monthlyStats.value.dailyStats[key]) {
        stats = monthlyStats.value.dailyStats[key]
        break
      }
    }
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    
    currentWeek.push({
      date,
      dayOfMonth: i,
      currentMonth: true,
      isToday: formatDateToISO(date) === formatDateToISO(today),
      workHours: stats?.hours,
      income: stats?.income,
      solarTerm: getSolarTerm(date),
      lunar: getLunarInfo(date)
    })
  }
  
  // 填充最后一周的空白天数
  while (currentWeek.length < 7) {
    const nextDate = new Date(lastDay)
    nextDate.setDate(nextDate.getDate() + (currentWeek.length - lastDay.getDay()))
    currentWeek.push({
      date: nextDate,
      dayOfMonth: nextDate.getDate(),
      currentMonth: false,
      isToday: false
    })
  }
  weeks.push(currentWeek)
  
  return weeks
})

// 日期选择相关
const selectedDate = ref<Date | null>(null)

const isSelectedDate = (date: Date) => {
  if (!selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = day.date
  handlePunch()
}

const formatDate = (date: Date | null) => {
  if (!date) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 打卡相关
const punchDialogVisible = ref(false)
const punchForm = ref({
  shift: 'day', // 默认白班
  hours: 11,
  hourlyRate: 17,
  type: 'regular' as 'regular' | 'overtime'
})

// 处理班次切换
const handleShiftChange = (shift: string) => {
  if (shift === 'day') {
    punchForm.value.hours = 11
    punchForm.value.hourlyRate = 17
  } else {
    punchForm.value.hours = 11.5
    punchForm.value.hourlyRate = 17
  }
}

// 处理打卡
const handlePunch = () => {
  if (!selectedDate.value) {
    ElMessage.warning('请先选择日期')
    return
  }
  punchDialogVisible.value = true
}

// 获取月度统计数据
const fetchMonthlyStats = async () => {
  try {
    const res = await workHoursApi.getMonthlyStats({
      year: currentYear.value,
      month: currentMonth.value
    })
    console.log('获取到的统计数据:', res.data.stats)
    console.log('dailyStats:', res.data.stats.dailyStats)
    monthlyStats.value = res.data.stats
  } catch (err) {
    console.error('获取统计数据失败:', err)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取配置
const fetchConfig = async () => {
  try {
    const res = await workHoursApi.getConfig()
    const config = res.data.config
    // 使用白班的默认值
    punchForm.value.hours = 11
    punchForm.value.hourlyRate = 17
  } catch (err) {
    ElMessage.error('获取配置失败')
  }
}

// 提交打卡
const submitPunch = async () => {
  if (!selectedDate.value) return
  
  try {
    const workDate = formatDateToISO(selectedDate.value)
    console.log('提交打卡日期:', workDate)
    
    const res = await workHoursApi.punch({
      workDate,
      hours: punchForm.value.hours,
      hourlyRate: punchForm.value.hourlyRate,
      workType: punchForm.value.type
    })

    if (res.code === 0) {
      ElMessage.success('打卡成功')
      console.log('打卡成功，返回数据:', res.data)
      // 确保等待数据更新完成
      await fetchMonthlyStats()
      // 不清除选中日期，这样用户可以看到打卡效果
      punchDialogVisible.value = false
    }
  } catch (err) {
    console.error('打卡失败:', err)
    ElMessage.error('打卡失败')
  }
}

// 月份切换
const previousMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() - 1)
  currentDate.value = date
  fetchMonthlyStats()
}

const nextMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + 1)
  currentDate.value = date
  fetchMonthlyStats()
}

// 初始化
onMounted(() => {
  fetchConfig()
  fetchMonthlyStats()
})

// 响应数据
interface WorkHourConfig {
  defaultHours: number;
  defaultHourlyRate: number;
  overtimeRate: number;
}

// GET /api/work-hours/config
</script>

<style scoped lang="scss">
.man-hour {
  padding: 12px;
  margin: 0 auto;
  
  .summary-card {
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-bg-color) 100%);
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .summary-item {
      text-align: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .label {
        color: var(--el-text-color-secondary);
        margin-bottom: 6px;
        font-size: 13px;
      }
      
      .value {
        font-size: 22px;
        font-weight: bold;
        color: var(--el-color-primary);
        line-height: 1.2;
      }
    }
  }
  
  .calendar-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      margin-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      .month-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .current-month {
          font-size: 16px;
          font-weight: bold;
          min-width: 100px;
          text-align: center;
        }
      }
    }
    
    .calendar {
      margin-top: 8px;
      
      .calendar-header-row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 4px;
        margin-bottom: 4px;
        
        .header {
          padding: 8px;
          font-weight: bold;
          color: var(--el-text-color-regular);
          font-size: 13px;
        }
      }
      
      .calendar-body {
        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: var(--el-border-color-lighter);
          
          .calendar-cell {
            min-height: 80px;
            padding: 4px;
            background-color: var(--el-bg-color);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            
            &:hover:not(.empty-cell) {
              background-color: var(--el-fill-color-light);
            }
            
            &.selected {
              background-color: var(--el-color-primary-light-9);
              box-shadow: inset 0 0 0 1px var(--el-color-primary);
            }
            
            &.empty-cell {
              background-color: var(--el-fill-color-blank);
              cursor: default;
            }
            
            &.today {
              .date-number {
                background-color: var(--el-color-primary);
                color: white;
                border-radius: 50%;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
              }
            }
            
            .date-number {
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 2px;
              width: 22px;
              height: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .lunar-day {
              color: var(--el-text-color-secondary);
              font-size: 11px;
              margin-bottom: 1px;
            }
            
            .lunar-festival {
              color: var(--el-color-danger);
              font-size: 11px;
              margin-bottom: 1px;
              font-weight: bold;
            }
            
            .solar-term {
              color: var(--el-color-success);
              font-size: 11px;
              margin-bottom: 1px;
              font-weight: bold;
            }
            
            .work-info {
              margin-top: auto;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2px;
            }
            
            .work-hours {
              color: var(--el-color-success);
              font-size: 12px;
              background-color: var(--el-color-success-light-9);
              padding: 0 4px;
              border-radius: 2px;
              line-height: 1.5;
              width: fit-content;
            }
            
            .income {
              color: var(--el-color-danger);
              font-size: 12px;
              background-color: var(--el-color-danger-light-9);
              padding: 0 4px;
              border-radius: 2px;
              line-height: 1.5;
              width: fit-content;
            }
          }
        }
      }
    }
  }

  // 右侧卡片通用样式
  .analysis-card,
  .recent-records-card {
    margin-bottom: 12px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .card-header {
      font-size: 15px;
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
  }

  // 工时分析样式
  .analysis-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 8px;

    .analysis-item {
      text-align: center;
      padding: 12px;
      background: var(--el-fill-color-light);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .label {
        color: var(--el-text-color-secondary);
        font-size: 13px;
        margin-bottom: 4px;
      }

      .value {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-color-primary);
      }
    }
  }

  // 近期打卡记录样式
  .recent-records {
    padding: 8px;
    height: 280px;
    overflow-y: auto;

    :deep(.el-timeline) {
      padding-left: 16px;
      
      .el-timeline-item {
        padding-bottom: 12px;
        
        &:last-child {
          padding-bottom: 0;
        }
        
        .el-timeline-item__node {
          width: 8px;
          height: 8px;
          left: -4px;
        }
        
        .el-timeline-item__tail {
          left: 0;
        }
        
        .el-timeline-item__timestamp {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }
        
        .el-timeline-item__content {
          color: var(--el-text-color-regular);
        }
      }
    }

    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: var(--el-fill-color-light);
      border-radius: 4px;

      .record-info {
        display: flex;
        gap: 12px;
        font-size: 13px;
        
        .hours {
          color: var(--el-color-success);
          font-weight: bold;
        }
        
        .income {
          color: var(--el-color-danger);
          font-weight: bold;
        }
      }

      .record-type {
        font-size: 12px;
        padding: 1px 8px;
        border-radius: 10px;
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }

    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-lighter);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 8px;
  
  .el-dialog__header {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .el-form-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .selected-date {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: bold;
    padding: 6px 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }
  
  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// 暗黑模式适配
:root.dark {
  .man-hour {
    .summary-card {
      background: linear-gradient(135deg, var(--el-color-primary-light-5) 0%, var(--el-bg-color) 100%);
      
      .summary-item {
        background: var(--el-bg-color-overlay);
      }
    }
    
    .calendar-card {
      .calendar-cell {
        &.empty-cell,
        &:not(.current-month) {
          background-color: var(--el-bg-color-overlay);
        }
      }
    }

    .analysis-content .analysis-item,
    .recent-records .record-item {
      background: var(--el-bg-color-overlay);
    }
  }
}
</style>
