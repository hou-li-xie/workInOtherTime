import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { ElMessage } from 'element-plus'
import { getCookie } from './cookies'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = getCookie('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果code不为0，说明有错误
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      
      // 如果是401，说明token过期或无效
      if (res.code === 401) {
        // 可以在这里处理登出逻辑
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 封装请求方法
const request = <T>(
  url: string,
  method: Method = 'get',
  submitData?: object
) => {
  return service.request<T, T>({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}

export default request