<template>
  <div class="home-view">
    <!-- 本月花费总览 -->
    <div class="month-summary">
      <div class="summary-card">
        <div class="summary-label">本月花费</div>
        <div class="summary-amount">¥{{ monthTotal.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 选择分类 -->
    <div class="card section-card">
      <div class="section-header">
        <span class="section-title">选择分类</span>
        <span class="selected-info" v-if="selectedCategoryName">
          当前：{{ selectedCategoryIcon }} {{ selectedCategoryName }}
          <button class="clear-btn" @click="clearCategory">清除</button>
        </span>
      </div>
      <CategoryPicker
        :categories="categories"
        v-model="selectedCategoryId"
      />
    </div>

    <!-- 输入信息 -->
    <div class="card section-card">
      <div class="form-row">
        <div class="form-item amount-item">
          <label class="form-label">金额（元）</label>
          <input
            type="number"
            v-model="amount"
            placeholder="0.00"
            class="amount-input"
            min="0"
            step="0.01"
            @keyup.enter="saveRecord"
          />
        </div>
        <div class="form-item date-item">
          <label class="form-label">日期</label>
          <input type="date" v-model="date" class="date-input" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-item note-item">
          <label class="form-label">备注（选填）</label>
          <input
            type="text"
            v-model="note"
            placeholder="简单描述一下这笔花销..."
            class="note-input"
            @keyup.enter="saveRecord"
          />
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary save-btn" @click="saveRecord" :disabled="!canSave">
          📝 记一笔
        </button>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div class="toast" v-if="toastMessage">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CategoryPicker from '../components/CategoryPicker.vue'
import { getCategories, addRecord, getMonthTotal } from '../database/api.js'

const categories = ref([])
const selectedCategoryId = ref(null)
const amount = ref('')
const date = ref('')
const note = ref('')
const monthTotal = ref(0)
const toastMessage = ref('')

const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return ''
  const cat = categories.value.find(c => c.id === selectedCategoryId.value)
  return cat ? cat.name : ''
})

const selectedCategoryIcon = computed(() => {
  if (!selectedCategoryId.value) return ''
  const cat = categories.value.find(c => c.id === selectedCategoryId.value)
  return cat ? cat.icon : ''
})

const canSave = computed(() => {
  return selectedCategoryId.value != null && amount.value && parseFloat(amount.value) > 0 && date.value
})

onMounted(async () => {
  // 设置默认日期为今天
  const today = new Date()
  date.value = formatDate(today)

  // 加载分类
  categories.value = await getCategories()

  // 加载本月总花费
  await loadMonthTotal()
})

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function clearCategory() {
  selectedCategoryId.value = null
}

async function saveRecord() {
  if (!canSave.value) return

  try {
    await addRecord({
      category_id: selectedCategoryId.value,
      amount: parseFloat(parseFloat(amount.value).toFixed(2)),
      note: note.value.trim(),
      date: date.value
    })

    showToast('✅ 记账成功！')

    // 重置表单（保留日期和分类）
    amount.value = ''
    note.value = ''

    // 刷新本月总花费
    await loadMonthTotal()
  } catch (e) {
    showToast('❌ 记账失败，请重试')
    console.error(e)
  }
}

async function loadMonthTotal() {
  const now = new Date()
  monthTotal.value = await getMonthTotal(now.getFullYear(), now.getMonth() + 1)
}

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}
</script>

<style scoped>
.home-view {
  padding: 28px 32px;
  max-width: 800px;
}

.month-summary {
  margin-bottom: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #ff6b35, #ff8f5e);
  border-radius: 14px;
  padding: 24px 28px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.summary-amount {
  font-size: 36px;
  font-weight: 700;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.selected-info {
  font-size: 13px;
  color: #ff6b35;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: inherit;
}

.clear-btn:hover {
  background: #f0f0f0;
  color: #ff4757;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: #888;
}

.amount-item {
  flex: 1;
}

.date-item {
  width: 180px;
}

.note-item {
  flex: 1;
}

.amount-input {
  font-size: 24px;
  font-weight: 600;
  padding: 12px 16px;
  color: #ff4757;
}

.date-input {
  padding: 12px 16px;
}

.note-input {
  padding: 10px 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.save-btn {
  padding: 12px 36px;
  font-size: 16px;
  border-radius: 10px;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
  z-index: 2000;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
