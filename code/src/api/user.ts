import request from '@/utils/request'
import type { ApiResponse } from '@/types/login'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
}

// 登录接口返回数据类型
export interface LoginResponseData {
  token: string
  user: {
    id: number
    username: string
    avatar: string
  }
}

// 登录方法
export function login(data: LoginData) {
  return request<LoginResponseData>('/user/login', 'post', data)
}

// 注册方法
export function register(data: RegisterData) {
  return request<any>('/user/register', 'post', data)
}

// 获取用户信息
export function getUserProfile() {
  return request<any>('/user/profile', 'get')
}

// 更新头像
export function updateAvatar(avatar: string) {
  return request<any>('/user/avatar', 'put', { avatar })
} 

// 更新头像
export function getWeatherApi(data: {longitude:number,latitude:number}) {
  return request<any>('/weather', 'get',data)
} 