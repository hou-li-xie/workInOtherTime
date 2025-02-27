import { defineStore } from "pinia";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getUserProfile } from "@/api/user";
import { getWeather } from "@/api/weather";
import type { UserInfo } from "@/types/user";
import type { WeatherInfo } from "@/types/weather";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | null>(null);
  const weatherInfo = ref<WeatherInfo | null>(null);
  const loading = ref(false);

  // 获取问候语
  const greeting = computed(() => {
    const hour = new Date().getHours();
    let timeGreeting = "早安";
    if (hour >= 12 && hour < 18) {
      timeGreeting = "下午好";
    } else if (hour >= 18) {
      timeGreeting = "晚上好";
    }
    return `${timeGreeting}，${userInfo.value?.username || "Admin"}`;
  });

  // 获取天气描述
  const weatherDesc = computed(() => {
    if (!weatherInfo.value) return "获取天气信息中...";

    const { dayWeather, dayTemp, nightTemp } = weatherInfo.value;
    const city = weatherInfo.value.city || '';
    return `${city ? city + '今日' : '今日'}${dayWeather}，白天最高${dayTemp}℃，晚上最低${nightTemp}℃，出门注意防护。`;
  });

  // 获取天气信息
  const fetchWeather = async () => {
    try {
      const res = await getWeather();
      console.log("天气信息结果:", res);
      if (res?.forecasts?.[0]) {
        // 使用第一天的天气预报，并添加城市信息
        weatherInfo.value = {
          ...res.forecasts[0],
          city: res.city || '未知城市'
        };
      } else {
        throw new Error('无效的天气数据');
      }
    } catch (error) {
      console.error("获取天气失败:", error);
      weatherInfo.value = {
        date: new Date().toISOString().split('T')[0],
        dayWeather: "晴",
        nightWeather: "晴",
        dayTemp: "21",
        nightTemp: "12",
        dayWind: "北",
        nightWind: "北",
        dayPower: "1-3",
        nightPower: "1-3",
        city: "未知城市"
      };
    }
  };

  // 初始化数据
  const initialize = async () => {
    try {
      await Promise.all([fetchUserInfo(), fetchWeather()]);
    } catch (error) {
      console.error("初始化数据失败:", error);
    }
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (loading.value) return;
    try {
      loading.value = true;
      const res = await getUserProfile();
      if (res.code === 0) {
        userInfo.value = res.data.user;
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    } finally {
      loading.value = false;
    }
  };

  // 更新用户信息
  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info };
      localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
    }
  };

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null;
    localStorage.removeItem("userInfo");
  };

  // 添加定时刷新天气
  let weatherTimer: number;
  onMounted(() => {
    // 立即初始化数据
    initialize();
    // 每30分钟更新一次天气
    weatherTimer = window.setInterval(fetchWeather, 30 * 60 * 1000);
  });

  onUnmounted(() => {
    if (weatherTimer) {
      clearInterval(weatherTimer);
    }
  });

  return {
    userInfo,
    weatherInfo,
    loading,
    greeting,
    weatherDesc,
    fetchUserInfo,
    fetchWeather,
    initialize,
    updateUserInfo,
    clearUserInfo,
  };
});
