import axios from "axios";
import type { WeatherResponse } from "@/types/weather";
import { getWeatherApi } from "../api/user";

// 获取地理位置
const getLocation = (): Promise<{ longitude: number; latitude: number }> => {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          // 保存到本地存储
          localStorage.setItem(
            "location",
            JSON.stringify({ longitude, latitude })
          );
          resolve({ longitude, latitude });
        },
        (error) => {
          console.error("获取位置失败:", error);
          // 默认使用上海的经纬度
          resolve({ longitude: 121.473701, latitude: 31.230416 });
        }
      );
    } else {
      // 浏览器不支持地理定位，使用默认值
      resolve({ longitude: 121.473701, latitude: 31.230416 });
    }
  });
};

export async function getWeather() {
  try {
    console.log("开始获取天气信息...");
    
    // 先尝试从本地存储获取位置
    let location = JSON.parse(localStorage.getItem("location") || "{}");
    
    // 如果本地没有位置信息，则获取当前位置
    if (!location.longitude || !location.latitude) {
      location = await getLocation();
    }

    const res = await getWeatherApi({
      longitude: location.longitude,
      latitude: location.latitude,
    });

    console.log("天气信息响应:", res.data);
    return res.data;
  } catch (error) {
    console.error("获取天气信息失败:", error);
    // 返回默认天气信息
    return {
      forecasts: [{
        date: new Date().toISOString().split('T')[0],
        dayWeather: "晴",
        nightWeather: "晴",
        dayTemp: "21",
        nightTemp: "12",
        dayWind: "北",
        nightWind: "北",
        dayPower: "1-3",
        nightPower: "1-3"
      }],
      city: "未知城市"
    };
  }
}
