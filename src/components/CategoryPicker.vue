<template>
  <div class="category-picker">
    <!-- 一级分类选择 -->
    <div class="category-grid" v-if="!selectedParent">
      <div
        v-for="cat in parentCategories"
        :key="cat.id"
        class="category-item"
        :class="{ active: selectedParentSortOrder === cat.sort_order }"
        @click="selectParent(cat)"
      >
        <span class="cat-icon">{{ cat.icon }}</span>
        <span class="cat-name">{{ cat.name }}</span>
      </div>
    </div>

    <!-- 二级分类选择 -->
    <div v-else>
      <div class="sub-header">
        <button class="back-btn" @click="goBack">← 返回</button>
        <span class="sub-title">{{ selectedParent.icon }} {{ selectedParent.name }}</span>
      </div>
      <div class="category-grid sub-grid">
        <div
          v-for="cat in childCategories"
          :key="cat.id"
          class="category-item"
          :class="{ active: selectedChildId === cat.id }"
          @click="selectChild(cat)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedParentSortOrder = ref(null)
const selectedChildId = ref(null)

const parentCategories = computed(() => {
  return props.categories.filter(c => c.parent_id === 0)
})

const selectedParent = computed(() => {
  // 必须同时匹配 sort_order 和 parent_id===0，因为子分类的 sort_order 也从1开始，会和大类冲突
  return props.categories.find(c => c.sort_order === selectedParentSortOrder.value && c.parent_id === 0) || null
})

const childCategories = computed(() => {
  if (!selectedParentSortOrder.value) return []
  return props.categories.filter(c => c.parent_id === selectedParentSortOrder.value)
})

function selectParent(cat) {
  const children = props.categories.filter(c => c.parent_id === cat.sort_order)
  if (children.length > 0) {
    selectedParentSortOrder.value = cat.sort_order
    selectedChildId.value = null
  } else {
    // 没有子分类，直接选中（如"其他"）
    selectedParentSortOrder.value = cat.sort_order
    selectedChildId.value = cat.id
    emit('update:modelValue', cat.id)
  }
}

function selectChild(cat) {
  selectedChildId.value = cat.id
  emit('update:modelValue', cat.id)
}

function goBack() {
  selectedParentSortOrder.value = null
  selectedChildId.value = null
  emit('update:modelValue', null)
}

// 外部改变值时同步
watch(() => props.modelValue, (val) => {
  if (val === null) {
    selectedParentSortOrder.value = null
    selectedChildId.value = null
  } else {
    // 根据选中的分类ID同步内部状态
    const cat = props.categories.find(c => c.id === val)
    if (cat) {
      if (cat.parent_id === 0) {
        selectedParentSortOrder.value = cat.sort_order
        selectedChildId.value = cat.id
      } else {
        selectedParentSortOrder.value = cat.parent_id
        selectedChildId.value = cat.id
      }
    }
  }
})
</script>

<style scoped>
.category-picker {
  padding: 4px 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.sub-grid {
  grid-template-columns: repeat(4, 1fr);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9f9f9;
}

.category-item:hover {
  background: #f0f0f0;
}

.category-item.active {
  background: #fff3ed;
  box-shadow: 0 0 0 2px #ff6b35;
}

.cat-icon {
  font-size: 28px;
}

.cat-name {
  font-size: 12px;
  color: #555;
  text-align: center;
}

.category-item.active .cat-name {
  color: #ff6b35;
  font-weight: 500;
}

.sub-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.back-btn {
  background: none;
  border: none;
  color: #ff6b35;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: inherit;
}

.back-btn:hover {
  background: #fff3ed;
}

.sub-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
</style>
