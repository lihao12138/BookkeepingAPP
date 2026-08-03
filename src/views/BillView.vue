<template>
  <div class="bill-view">
    <div class="bill-header">
      <h2 class="page-title">账单明细</h2>
      <MonthPicker v-model:modelYear="year" v-model:modelMonth="month" />
    </div>

    <!-- 本月总览 -->
    <div class="bill-summary card">
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">本月总支出</span>
          <span class="summary-value amount">¥{{ monthTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">记账笔数</span>
          <span class="summary-value">{{ records.length }} 笔</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <button
        class="filter-tag"
        :class="{ active: filterCategory === null }"
        @click="filterCategory = null"
      >
        全部
      </button>
      <button
        v-for="cat in parentCategories"
        :key="cat.id"
        class="filter-tag"
        :class="{ active: filterCategory === cat.id }"
        @click="filterCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 记录列表 -->
    <div class="bill-list">
      <template v-if="filteredRecords.length > 0">
        <RecordItem
          v-for="record in filteredRecords"
          :key="record.id"
          :record="record"
          @delete="handleDelete"
        />
      </template>
      <div class="empty-state" v-else>
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无记录</div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal-box">
        <div class="modal-title">确认删除</div>
        <div class="modal-message">确定要删除这笔记录吗？删除后无法恢复。</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MonthPicker from '../components/MonthPicker.vue'
import RecordItem from '../components/RecordItem.vue'
import { getCategories, getRecordsByMonth, deleteRecord, getMonthTotal } from '../database/api.js'

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const categories = ref([])
const records = ref([])
const monthTotal = ref(0)
const filterCategory = ref(null)
const showDeleteModal = ref(false)
const deleteId = ref(null)

const parentCategories = computed(() => {
  return categories.value.filter(c => c.parent_id === 0)
})

const filteredRecords = computed(() => {
  if (filterCategory.value === null) return records.value
  return records.value.filter(r => {
    // 匹配一级或二级分类
    return r.category_id === filterCategory.value || r.parent_id === filterCategory.value
  })
})

onMounted(async () => {
  categories.value = await getCategories()
  await loadData()
})

watch([year, month], () => {
  filterCategory.value = null
  loadData()
})

async function loadData() {
  records.value = await getRecordsByMonth(year.value, month.value)
  monthTotal.value = await getMonthTotal(year.value, month.value)
}

function handleDelete(id) {
  deleteId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (deleteId.value) {
    await deleteRecord(deleteId.value)
    showDeleteModal.value = false
    deleteId.value = null
    await loadData()
  }
}
</script>

<style scoped>
.bill-view {
  padding: 28px 32px;
  max-width: 800px;
}

.bill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bill-header .page-title {
  margin-bottom: 0;
}

.bill-summary {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  gap: 40px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 13px;
  color: #999;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.summary-value.amount {
  color: #ff4757;
}

.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-tag {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  color: #666;
}

.filter-tag:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.filter-tag.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: #fff;
}

.bill-list {
  min-height: 200px;
}
</style>
