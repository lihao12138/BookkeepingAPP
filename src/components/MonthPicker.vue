<template>
  <div class="month-picker">
    <button class="picker-btn" @click="prevMonth">‹</button>
    <span class="picker-label">{{ year }}年{{ month }}月</span>
    <button class="picker-btn" @click="nextMonth">›</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelYear: {
    type: Number,
    required: true
  },
  modelMonth: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelYear', 'update:modelMonth'])

const year = ref(props.modelYear)
const month = ref(props.modelMonth)

function prevMonth() {
  if (month.value === 1) {
    month.value = 12
    year.value--
  } else {
    month.value--
  }
  emitChange()
}

function nextMonth() {
  if (month.value === 12) {
    month.value = 1
    year.value++
  } else {
    month.value++
  }
  emitChange()
}

function emitChange() {
  emit('update:modelYear', year.value)
  emit('update:modelMonth', month.value)
}

// 同步外部变更
watch(() => props.modelYear, (val) => { year.value = val })
watch(() => props.modelMonth, (val) => { month.value = val })
</script>

<style scoped>
.month-picker {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 6px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.picker-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: inherit;
}

.picker-btn:hover {
  background: #f0f0f0;
  color: #ff6b35;
}

.picker-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 90px;
  text-align: center;
}
</style>
