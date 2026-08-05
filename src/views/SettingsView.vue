<template>
  <div class="settings-view">
    <h2 class="page-title">设置</h2>

    <!-- 分类管理 -->
    <div class="card section-card">
      <h3 class="section-title">分类管理</h3>
      <p class="section-desc">管理系统记账分类。预置分类不可修改，您可以自由添加自定义分类。</p>
      <button class="btn btn-primary" @click="openCategoryManager">
        🏷️ 管理分类
      </button>
    </div>

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

    <!-- ========== 分类管理弹窗 ========== -->
    <div class="modal-overlay" v-if="showCategoryManager" @click.self="showCategoryManager = false">
      <div class="modal-box modal-wide">
        <div class="modal-title">🏷️ 分类管理</div>

        <!-- 操作栏 -->
        <div class="cat-actions-bar">
          <button class="btn btn-primary btn-sm" @click="openAddParent">
            ＋ 添加大类
          </button>
        </div>

        <!-- 分类列表 -->
        <div class="cat-list">
          <div v-for="parent in parentCategories" :key="parent.id" class="cat-group">
            <!-- 大类行 -->
            <div class="cat-row cat-parent-row">
              <span class="cat-icon">{{ parent.icon }}</span>
              <span class="cat-name">{{ parent.name }}</span>
              <span v-if="!parent.is_custom" class="cat-badge cat-badge-locked">🔒 预置</span>
              <div class="cat-row-actions">
                <button class="btn-icon" title="添加子分类" @click="openAddChild(parent)">＋</button>
                <button v-if="parent.is_custom" class="btn-icon btn-icon-edit" title="编辑" @click="openEditCategory(parent)">✏️</button>
                <button v-if="parent.is_custom" class="btn-icon btn-icon-del" title="删除" @click="confirmDeleteCategory(parent)">🗑️</button>
              </div>
            </div>
            <!-- 子分类列表 -->
            <div v-if="getChildCategories(parent.id).length > 0" class="cat-children">
              <div v-for="child in getChildCategories(parent.id)" :key="child.id" class="cat-row cat-child-row">
                <span class="cat-icon cat-icon-sm">{{ child.icon }}</span>
                <span class="cat-name cat-name-sm">{{ child.name }}</span>
                <span v-if="!child.is_custom" class="cat-badge cat-badge-locked cat-badge-sm">🔒</span>
                <div class="cat-row-actions">
                  <button v-if="child.is_custom" class="btn-icon btn-icon-sm btn-icon-edit" title="编辑" @click="openEditCategory(child)">✏️</button>
                  <button v-if="child.is_custom" class="btn-icon btn-icon-sm btn-icon-del" title="删除" @click="confirmDeleteCategory(child)">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCategoryManager = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ========== 添加/编辑分类弹窗 ========== -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="showEditModal = false">
      <div class="modal-box">
        <div class="modal-title">{{ editModalTitle }}</div>

        <div class="form-group">
          <label class="form-label">分类名称</label>
          <input
            type="text"
            class="form-input"
            v-model="editForm.name"
            placeholder="请输入分类名称"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label class="form-label">选择图标</label>
          <div class="emoji-grid">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-item"
              :class="{ 'emoji-selected': editForm.icon === emoji }"
              @click="editForm.icon = emoji"
            >{{ emoji }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" :disabled="!editForm.name.trim()" @click="handleSaveCategory">保存</button>
        </div>
      </div>
    </div>

    <!-- ========== 删除确认弹窗 ========== -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal-box">
        <div class="modal-title">⚠️ 确认删除</div>
        <div class="modal-message">
          确定要删除分类「{{ deleteTarget?.icon }} {{ deleteTarget?.name }}」吗？
          <br /><br />
          <span v-if="deleteTarget?.parent_id === 0 && getChildCategories(deleteTarget?.id).length > 0">
            该大类下还有 {{ getChildCategories(deleteTarget?.id).length }} 个子分类，将一并删除。
          </span>
          <span v-if="hasRecordsForCategory(deleteTarget?.id)">
            该分类下还有记账记录，记录也将一并删除。
          </span>
          <br /><br />
          此操作不可恢复。
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="handleDeleteCategory">确认删除</button>
        </div>
      </div>
    </div>

    <!-- ========== 清空确认弹窗 ========== -->
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
import { ref, computed, onMounted } from 'vue'
import { getRecordCount, clearAllRecords, getCategories, addCategory, updateCategory, deleteCategory } from '../database/api.js'

// 预设 emoji 列表
const emojiList = [
  '🍔', '🍕', '🍜', '🍲', '🥗', '🍰', '🧋', '🍺',
  '🚗', '🚇', '🚕', '🚲', '✈️', '🚄', '🛣️', '⛽',
  '🏠', '🔑', '💡', '💧', '🔥', '📡', '🛋️', '📦',
  '🛒', '👕', '👜', '💄', '📱', '👙', '👕', '👟',
  '💊', '🏥', '🩺', '🧘', '🛡️', '❤️', '🩹', '🧬',
  '📚', '📝', '🎓', '💻', '🏫', '📋', '📖', '🖊️',
  '🎮', '🎬', '⚽', '🎵', '🎨', '🎤', '🎭', '🎲',
  '💰', '🏦', '💳', '📈', '💎', '🏷️', '🧧', '🎁',
  '📱', '📞', '👑', '☁️', '📲', '💻', '⌨️', '🖨️',
  '🐱', '🐶', '🦮', '🦴', '🧸', '🐾', '🐳', '🦜',
  '💼', '📎', '🧳', '🥪', '🖨️', '📊', '📁', '🔒',
  '📌', '✅', '⭐', '❤️', '🔔', '🔔', '🎯', '🏆'
]

const recordCount = ref(0)
const showClearModal = ref(false)

// 分类管理相关状态
const showCategoryManager = ref(false)
const categories = ref([])

// 编辑弹窗状态
const showEditModal = ref(false)
const editModalTitle = ref('')
const editMode = ref('') // 'addParent' | 'addChild' | 'edit'
const editForm = ref({ name: '', icon: '📌', parent_id: 0 })
const editTargetId = ref(null) // 编辑时记录目标分类的 id

// 删除弹窗状态
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

// 计算属性
const parentCategories = computed(() => {
  return categories.value.filter(c => c.parent_id === 0)
})

function getChildCategories(parentId) {
  return categories.value.filter(c => c.parent_id === parentId)
}

function hasRecordsForCategory(catId) {
  // 无法在此处精确判断，由后端处理，此处留空
  return false
}

// 加载分类
async function loadCategories() {
  categories.value = await getCategories()
}

// 打开分类管理器
async function openCategoryManager() {
  await loadCategories()
  showCategoryManager.value = true
}

// 打开添加大类弹窗
function openAddParent() {
  editMode.value = 'addParent'
  editModalTitle.value = '添加大类'
  editForm.value = { name: '', icon: '📌', parent_id: 0 }
  editTargetId.value = null
  showEditModal.value = true
}

// 打开添加子分类弹窗
function openAddChild(parent) {
  editMode.value = 'addChild'
  editModalTitle.value = `在「${parent.icon} ${parent.name}」下添加子分类`
  editForm.value = { name: '', icon: '📌', parent_id: parent.id }
  editTargetId.value = null
  showEditModal.value = true
}

// 打开编辑分类弹窗
function openEditCategory(cat) {
  editMode.value = 'edit'
  editModalTitle.value = `编辑「${cat.icon} ${cat.name}」`
  editForm.value = { name: cat.name, icon: cat.icon, parent_id: cat.parent_id }
  editTargetId.value = cat.id
  showEditModal.value = true
}

// 确认删除分类
function confirmDeleteCategory(cat) {
  deleteTarget.value = cat
  showDeleteModal.value = true
}

// 保存分类（新增或编辑）
async function handleSaveCategory() {
  if (!editForm.value.name.trim()) return

  if (editMode.value === 'addParent') {
    // 计算新大类的 sort_order
    const maxSort = parentCategories.value.reduce((max, c) => Math.max(max, c.sort_order), 0)
    await addCategory(editForm.value.name.trim(), 0, editForm.value.icon, maxSort + 1)
  } else if (editMode.value === 'addChild') {
    // 计算新子类的 sort_order
    const siblings = getChildCategories(editForm.value.parent_id)
    const maxSort = siblings.reduce((max, c) => Math.max(max, c.sort_order), 0)
    await addCategory(editForm.value.name.trim(), editForm.value.parent_id, editForm.value.icon, maxSort + 1)
  } else if (editMode.value === 'edit') {
    await updateCategory(editTargetId.value, editForm.value.name.trim(), editForm.value.icon)
  }

  showEditModal.value = false
  await loadCategories()
}

// 删除分类
async function handleDeleteCategory() {
  if (!deleteTarget.value) return
  await deleteCategory(deleteTarget.value.id)
  showDeleteModal.value = false
  deleteTarget.value = null
  await loadCategories()
}

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

/* 分类管理弹窗 - 宽版 */
.modal-wide {
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* 操作栏 */
.cat-actions-bar {
  margin-bottom: 16px;
}

/* 分类列表 */
.cat-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  margin: 0 -8px;
}

.cat-group {
  margin-bottom: 4px;
}

.cat-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.15s;
}

.cat-row:hover {
  background: #f9f9f9;
}

.cat-parent-row {
  border-bottom: 1px solid #f0f0f0;
}

.cat-parent-row:last-child {
  border-bottom: none;
}

.cat-children {
  padding-left: 28px;
}

.cat-child-row {
  padding: 6px 12px;
}

.cat-icon {
  font-size: 20px;
  margin-right: 10px;
  flex-shrink: 0;
}

.cat-icon-sm {
  font-size: 16px;
}

.cat-name {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.cat-name-sm {
  font-size: 13px;
  color: #555;
}

.cat-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  flex-shrink: 0;
}

.cat-badge-locked {
  background: #f0f0f0;
  color: #999;
}

.cat-badge-sm {
  font-size: 10px;
  padding: 1px 4px;
}

.cat-row-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.15s;
}

.cat-row:hover .cat-row-actions {
  opacity: 1;
}

.cat-child-row .cat-row-actions {
  opacity: 1;
}

/* 图标按钮 */
.btn-icon {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.15s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-icon-sm {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.btn-icon-del:hover {
  background: #ffe0e0;
}

.btn-icon-edit:hover {
  background: #fff3ed;
}

/* 小号按钮 */
.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

/* 表单 */
.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #ff6b35;
}

/* Emoji 选择网格 */
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.emoji-item:hover {
  background: #eee;
  transform: scale(1.15);
}

.emoji-selected {
  background: #ff6b35;
  transform: scale(1.1);
}

.emoji-selected:hover {
  background: #ff6b35;
}
</style>
