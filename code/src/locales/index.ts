import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    login: {
      title: 'TEST',
      welcome: '欢迎使用本系统',
      desc: '开箱即用的中后台管理系统',
      account: '芋道源码',
      password: '密码',
      rememberMe: '记住我',
      forgotPassword: '忘记密码？',
      login: '登录',
      phoneLogin: '手机登录',
      qrLogin: '二维码登录',
      register: '注册'
    }
  },
  'en-US': {
    login: {
      title: 'TEST',
      welcome: 'Welcome to the System',
      desc: 'Out-of-the-box Admin System',
      account: 'Username',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      login: 'Login',
      phoneLogin: 'Phone Login',
      qrLogin: 'QR Login',
      register: 'Register'
    }
  }
}

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
}) 