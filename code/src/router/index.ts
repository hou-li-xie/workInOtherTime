import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import {getCookie} from '../utils/cookies.ts'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: {
            title: '仪表盘'
          }
        }
      ]
    },
    {
      path: '/HourTreasure',
      component: Layout,
      name: 'HourTreasure',
      meta: {
        title: '工时宝'
      },
      children: [
        {
          path: 'man-hour',
          name: 'man-hour',
          component: () => import('@/views/HourTreasure/man-hour.vue'),
          meta: {
            title: '工时'
          }
        },
        {
          path: 'hourly-wages',
          name: 'hourly-wages',
          component: () => import('@/views/HourTreasure/hourly-wages.vue'),
          meta: {
            title: '时薪'
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // to 即将进入的路由
  // from 在哪个路由进入的
  // next 放行
  //   console.log(to); //打印的是页面要跳转到的路由,例如：它下面的path：为"/login"
  let token = getCookie('token'); //在本地存储中获取token
  if (token) {
    //判断是否有token
    next();
  } else {
    //在没有token的前提下，to下面的path是否为/login，如果不是则页面跳转到登录页面
    if (to.path == "/login") {
      next();
    } else {
      next({ path: "/login" }); //跳转页面到login页
    }
  }
});
export default router
