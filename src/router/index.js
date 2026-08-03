import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BillView from '../views/BillView.vue'
import StatsView from '../views/StatsView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { title: '记账', icon: '📝' }
  },
  {
    path: '/bill',
    name: 'Bill',
    component: BillView,
    meta: { title: '账单', icon: '📋' }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: StatsView,
    meta: { title: '统计', icon: '📊' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { title: '设置', icon: '⚙️' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
