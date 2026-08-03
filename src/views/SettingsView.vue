<template>
  <div class="settings-view">
    <h2 class="page-title">设置</h2>

    <!-- 数据信息 -->
    <div class="card section-card">
      <h3 class="section-title">数据信息</h3>
      <div class="info-row">
        <span class="info-label">记账总笔数</span>
        <span class="info-value">{{ recordCount }} 笔</span>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card section-card">
      <h3 class="section-title">数据管理</h3>
      <p class="section-desc">清空所有记账数据，此操作不可恢复，请谨慎操作。</p>
      <button class="btn btn-danger" @click="showClearModal = true">
        🗑️ 清空所有数据
      </button>
    </div>

    <!-- 关于 -->
    <div class="card section-card">
      <h3 class="section-title">关于</h3>
      <div class="about-info">
        <div class="info-row">
          <span class="info-label">应用名称</span>
          <span class="info-value">黑马记账</span>
        </div>
        <div class="info-row">
          <span class="info-label">版本号</span>
          <span class="info-value">v1.0.0</span>
        </div>
        <div class="info-row">
          <span class="info-label">技术栈</span>
          <span class="info-value">Electron + Vue 3 + SQLite</span>
        </div>
      </div>
    </div>

    <!-- 清空确认弹窗 -->
    <div class="modal-overlay" v-if="showClearModal" @click.self="showClearModal = false">
      <div class="modal-box">
        <div class="modal-title">⚠️ 确认清空数据</div>
        <div class="modal-message">
          此操作将删除所有记账记录（共 {{ recordCount }} 笔），且无法恢复。
          <br /><br />
          确定要继续吗？
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showClearModal = false">取消</button>
          <button class="btn btn-danger" @click="handleClearAll">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRecordCount, clearAllRecords } from '../database/api.js'

const recordCount = ref(0)
const showClearModal = ref(false)

onMounted(async () => {
  recordCount.value = await getRecordCount()
})

async function handleClearAll() {
  await clearAllRecords()
  recordCount.value = 0
  showClearModal.value = false
}
</script>

<style scoped>
.settings-view {
  padding: 28px 32px;
  max-width: 600px;
}

.section-card {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.section-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
  line-height: 1.6;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
