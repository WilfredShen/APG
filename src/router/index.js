import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Login from '@/components/Login'
import Register from '@/components/Register'
import Pwd from '@/components/Pwd'
import APG from '@/components/APG'
import APGnav from '@/components/APGnav'
import APGpaper from '@/components/APGpaper'
import APGreport from '@/components/APGreport'

export default new VueRouter({
  // mode: 'history', // 本地运行必须使用 hash 模式
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/apg',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
    },
    {
      path: '/pwd',
      name: 'Pwd',
      component: Pwd,
    },
    {
      path: '/apg',
      name: 'APG',
      component: APG,
      redirect: '/apg/nav',
      children: [
        {
          path: '/apg/nav',
          name: 'APGnav',
          component: APGnav,
        },
        {
          path: '/apg/paper',
          name: 'APGpaper',
          component: APGpaper,
        },
        {
          path: '/apg/report',
          name: 'APGreport',
          component: APGreport
        },
      ],
    },
    {
      path: '*',
      name: '404',
      redirect: '/',
    },
  ],
})
