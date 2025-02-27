<script setup lang="ts">
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { login, register, getUserProfile } from '../api/user'
import type { LoginData, RegisterData } from '../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { setCookie } from '../utils/cookies'
import {Lock, Moon, Sunny, User} from "@element-plus/icons-vue";
const { t, locale } = useI18n()

const router = useRouter()

const isLogin = ref(true)
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 暗黑模式切换
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 切换语言
const handleChangeLocale = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const loading = ref(false)

const switchMode = () => {
  isLogin.value = !isLogin.value
  formData.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

const handleSubmit = async () => {
  // 表单验证
  if (!formData.value.username || !formData.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  if (!isLogin.value && formData.value.password !== formData.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    loading.value = true
    if (isLogin.value) {
      const res = await login(formData.value as LoginData)
      if (res.code === 0) {
        setCookie('token', res.data.token, 1)
        ElMessage.success(res.message)
        router.push('/dashboard')
      } else {
        ElMessage.error(res.message || '登录失败')
      }
    } else {
      const res = await register({
        username: formData.value.username,
        password: formData.value.password
      } as RegisterData)
      if (res.code === 0) {
        ElMessage.success('注册成功，请登录')
        isLogin.value = true
      } else {
        ElMessage.error(res.message || '注册失败')
      }
    }
  } catch (error) {
    console.error(isLogin.value ? '登录失败:' : '注册失败:', error)
    ElMessage.error(isLogin.value ? '登录失败' : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="top-actions">
      <!-- 暗黑模式切换 -->
      <el-button class="theme-toggle" link @click="toggleDark()">
        <el-icon size="20">
          <Moon v-if="isDark" />
          <Sunny v-else />
        </el-icon>
      </el-button>
      <!-- 语言切换 - 使用 SVG -->
      <el-dropdown trigger="click" @command="handleChangeLocale">
        <el-button class="lang-toggle" link>
          <svg viewBox="0 0 24 24" width="20" height="20" class="lang-icon">
            <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">
              简体中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="login-left">
      <div class="header">
        <div class="logo">
          <svg viewBox="0 0 1024 1024" class="logo-icon">
            <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm351.3 371.2C843 380.9 824.4 391 805 401.5c-19.4 10.5-39.6 21.4-57.1 31-17.5 9.6-35.1 19.2-52.6 28.8-8.8 4.8-17.5 9.6-26.3 14.4-1.8 1-3.5 1.9-5.3 2.9-8.8 4.8-17.5 9.6-26.3 14.4-17.5 9.6-35.1 19.2-52.6 28.8-19.4 10.5-39.6 21.4-57.1 31-19.4 10.5-38 20.6-57.4 30.3-19.4 9.7-38.8 19.4-58.2 29.1 0 0-1.8 0.9-1.8 2.7v175.5c0 1.8 1.8 2.7 1.8 2.7 19.4 9.7 38.8 19.4 58.2 29.1 19.4 9.7 38 19.8 57.4 30.3 19.4 10.5 39.6 21.4 57.1 31 17.5 9.6 35.1 19.2 52.6 28.8 8.8 4.8 17.5 9.6 26.3 14.4 1.8 1 3.5 1.9 5.3 2.9 8.8 4.8 17.5 9.6 26.3 14.4 17.5 9.6 35.1 19.2 52.6 28.8 17.5 9.6 35.1 19.2 52.6 28.8 8.8 4.8 17.5 9.6 26.3 14.4 1.8 1 3.5 1.9 5.3 2.9 8.8 4.8 17.5 9.6 26.3 14.4 17.5 9.6 35.1 19.2 52.6 28.8 19.4 10.5 39.6 21.4 57.1 31 19.4 10.5 38 20.6 57.4 30.3 19.4 9.7 38.8 19.4 58.2 29.1 0 0 1.8 0.9 1.8 2.7v-175.5c0-1.8-1.8-2.7-1.8-2.7-19.4-9.7-38.8-19.4-58.2-29.1z" fill="#409EFF"/>
            <path d="M512 512m-256 0a256 256 0 1 0 512 0 256 256 0 1 0-512 0Z" fill="#409EFF"/>
            <circle cx="416" cy="448" r="48" fill="#fff"/>
            <circle cx="608" cy="448" r="48" fill="#fff"/>
            <path d="M512 576c-70.7 0-128 28.7-128 64h256c0-35.3-57.3-64-128-64z" fill="#fff"/>
          </svg>
          <span>{{ t('login.title') }}</span>
        </div>
      </div>
      <div class="welcome">
        <img src="https://pro.naiveadmin.com/assets/login-bg-BTLOwUOi.svg" class="welcome-bg" alt="welcome">
        <h2>{{ t('login.welcome') }}</h2>
        <p>{{ t('login.desc') }}</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form">
        <h2>{{ isLogin ? t('login.login') : t('login.register') }}</h2>
        <el-form>
          <el-form-item>
            <el-input v-model="formData.username" :placeholder="t('login.account')">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="formData.password" 
              type="password" 
              :placeholder="t('login.password')" 
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="!isLogin">
            <el-input 
              v-model="formData.confirmPassword" 
              type="password" 
              placeholder="请确认密码" 
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="remember" v-if="isLogin">
            <el-checkbox>{{ t('login.rememberMe') }}</el-checkbox>
            <a href="javascript:;" class="forget-pwd">{{ t('login.forgotPassword') }}</a>
          </div>
          <el-button 
            type="primary" 
            class="login-button" 
            :loading="loading"
            @click="handleSubmit"
          >
            {{ isLogin ? t('login.login') : t('login.register') }}
          </el-button>
          <div class="login-methods">
            <el-button 
              class="method-item" 
              type="default"
              @click="switchMode"
            >
              {{ isLogin ? t('login.register') : t('login.login') }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  position: relative;
  
  .top-actions {
    position: absolute;
    top: 24px;
    right: 48px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 16px;

    .theme-toggle,
    .lang-toggle {
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: #409EFF;
      }

      .lang-icon {
        fill: currentColor;
      }
    }
  }

  .login-left {
    flex: 0.5;
    background: #283443;
    padding: 24px;
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      margin-bottom: 24px;

      .logo {
        display: flex;
        align-items: center;
        
        .logo-icon {
          width: 32px;
          height: 32px;
          fill: white;
        }
        
        span {
          color: white;
          font-size: 20px;
          margin-left: 12px;
        }
      }
    }

    .welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .welcome-bg {
        width: 100%;
        max-width: 428px;
        height: auto;
        margin-bottom: 40px;
      }
      
      h2 {
        color: white;
        margin: 0 0 12px;
        font-size: 24px;
      }
      
      p {
        color: rgba(255,255,255,0.7);
        font-size: 16px;
      }
    }
  }

  .login-right {
    flex: 0.5;
    min-width: 360px;
    padding: 24px 48px;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-form {
      width: 100%;
      max-width: 320px;
      
      h2 {
        text-align: center;
        margin-bottom: 24px;
      }

      .remember {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        
        .forget-pwd {
          color: #409EFF;
          text-decoration: none;
          
          &:hover {
            color: #66b1ff;
          }
        }
      }

      .login-button {
        width: 100%;
        margin-bottom: 16px;
      }

      .login-methods {
        display: flex;
        justify-content: space-between;
        gap: 12px;

        .method-item {
          flex: 1;
          padding: 8px 0;
          font-size: 14px;
          color: #606266;
          background: #f5f7fa;
          border: none;
          
          &:hover {
            color: #409EFF;
            background: #ecf5ff;
          }
        }
      }
    }
  }
}

// 暗黑模式样式
html.dark {
  .login-container {
    .top-actions {
      .theme-toggle,
      .lang-toggle {
        color: #fff;
        
        &:hover {
          color: #409EFF;
        }
      }
    }
    .login-right {
      background: #141414;

      .login-form {
        h2 {
          color: #fff;
        }

        .login-methods {
          .method-item {
            background: #1d1d1d;
            color: #fff;
            
            &:hover {
              background: #2b2b2b;
            }
          }
        }
      }
    }
  }
}
</style>
