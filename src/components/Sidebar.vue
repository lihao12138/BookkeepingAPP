<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">🐴</span>
      <span class="sidebar-title">黑马记账</span>
    </div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
const navItems = [
  { path: '/home', icon: '📝', label: '记一笔' },
  { path: '/bill', icon: '📋', label: '账单' },
  { path: '/stats', icon: '📊', label: '统计' },
  { path: '/settings', icon: '⚙️', label: '设置' }
]
</script>

<style scoped>
.sidebar {
  width: 160px;
  min-width: 160px;
  height: 100vh;
  background: #2c2c2c;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border-bottom: 1px solid #3a3a3a;
}

.sidebar-logo {
  font-size: 28px;
}

.sidebar-title {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  color: #aaa;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #3a3a3a;
  color: #ddd;
}

.nav-item.active {
  background: #ff6b35;
  color: #fff;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-size: 15px;
}
</style>
