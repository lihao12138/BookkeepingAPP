<template>
  <div class="record-item" @click="expanded = !expanded">
    <div class="record-main">
      <span class="record-icon">{{ record.parent_icon || record.category_icon }}</span>
      <div class="record-info">
        <span class="record-category">{{ record.parent_name || record.category_name }}</span>
        <span class="record-sub" v-if="record.parent_id && record.parent_id !== 0">
          {{ record.category_icon }} {{ record.category_name }}
        </span>
      </div>
      <div class="record-right">
        <span class="record-amount">¥{{ record.amount.toFixed(2) }}</span>
        <span class="record-date">{{ formatDate(record.date) }}</span>
      </div>
      <button
        class="delete-btn"
        @click.stop="$emit('delete', record.id)"
        title="删除"
      >
        ✕
      </button>
    </div>
    <div class="record-detail" v-if="expanded && record.note">
      <span class="detail-label">备注：</span>{{ record.note }}
    </div>
    <div class="record-detail" v-if="expanded">
      <span class="detail-label">时间：</span>{{ record.created_at }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  record: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const expanded = ref(false)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}
</script>

<style scoped>
.record-item {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.record-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.record-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-icon {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-category {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.record-sub {
  font-size: 12px;
  color: #999;
}

.record-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  color: #ff4757;
}

.record-date {
  font-size: 12px;
  color: #bbb;
}

.delete-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fff0f0;
  color: #ff4757;
}

.record-detail {
  padding: 8px 0 0 52px;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
}

.detail-label {
  color: #aaa;
}
</style>
