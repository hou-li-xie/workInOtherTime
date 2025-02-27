<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "../../stores/user";
import { Sunny, Moon, Cloudy, Lightning } from '@element-plus/icons-vue';

const userStore = useUserStore();

// 计算属性
const greeting = computed(() => `${userStore.greeting}，开始您一天的工作吧！`);
const weather = computed(() => userStore.weatherDesc);

// 工作台数据
const workbenchData = ref({
  currentTime: '',
  currentDate: ''
});

// 更新时间
const updateDateTime = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  };
  workbenchData.value.currentDate = now.toLocaleDateString('zh-CN', options);
  workbenchData.value.currentTime = now.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 天气图标映射
const getWeatherIcon = (weather: string) => {
  if (weather.includes('晴')) return Sunny;
  if (weather.includes('阴')) return Cloudy;
  if (weather.includes('雨')) return Lightning;
  return Moon;
};

onMounted(() => {
  updateDateTime();
  // 每秒更新时间
  setInterval(updateDateTime, 1000);
});
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <!-- 左侧卡片：问候语和天气 -->
      <el-col :span="24">
        <el-card class="workbench">
          <div class="user-info">
            <el-avatar :size="48" :src="userStore.userInfo?.avatar" />
            <div class="info">
              <h2>{{ greeting }}</h2>
              <p class="weather">
                <el-icon><component :is="getWeatherIcon(weather)" /></el-icon>
                {{ weather }}
              </p>
            </div>
          </div>
          <div class="datetime-info">
            <div class="time">{{ workbenchData.currentTime }}</div>
            <div class="date">{{ workbenchData.currentDate }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  padding: 12px;
  height: 100vh;

  .workbench {
    height: 100%;
    background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-bg-color) 100%);

    .user-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      margin-bottom: 20px;

      .info {
        h2 {
          font-size: 18px;
          font-weight: normal;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        .weather {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #909399;
          font-size: 14px;
          line-height: 1.5;

          .el-icon {
            font-size: 18px;
            color: var(--el-color-warning);
          }
        }
      }
    }

    .datetime-info {
      text-align: center;
      padding: 20px;

      .time {
        font-size: 36px;
        font-weight: 200;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        font-family: monospace;
      }

      .date {
        font-size: 16px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

:deep(.el-card__body) {
  padding: 12px;
}

// 暗黑模式适配
:root.dark {
  .dashboard {
    .workbench {
      background: linear-gradient(135deg, var(--el-color-primary-light-5) 0%, var(--el-bg-color) 100%);
    }
  }
}
</style>