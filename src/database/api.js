// 数据库 API 桥接层
// 在 Electron 环境中通过 electronAPI 与主进程通信
// 在浏览器环境中（开发调试）使用 localStorage 模拟

import defaultCategories from '../data/categories.json'

const isElectron = () => !!(window && window.electronAPI)

// ========== 分类相关 ==========

export async function getCategories() {
  if (isElectron()) {
    return window.electronAPI.getCategories()
  }
  // 浏览器调试模式：合并默认分类和用户自定义分类，分配 id
  const customCats = JSON.parse(localStorage.getItem('heima_custom_categories') || '[]')
  const all = [...defaultCategories, ...customCats]
  return all.map((cat, index) => ({ ...cat, id: index + 1 }))
}

export async function addCategory(name, parent_id, icon, sort_order) {
  if (isElectron()) {
    return window.electronAPI.addCategory(name, parent_id, icon, sort_order)
  }
  const customCats = JSON.parse(localStorage.getItem('heima_custom_categories') || '[]')
  const newCat = { name, parent_id, icon, sort_order, is_custom: true }
  customCats.push(newCat)
  localStorage.setItem('heima_custom_categories', JSON.stringify(customCats))
  return defaultCategories.length + customCats.length
}

export async function updateCategory(id, name, icon) {
  if (isElectron()) {
    return window.electronAPI.updateCategory(id, name, icon)
  }
  const customCats = JSON.parse(localStorage.getItem('heima_custom_categories') || '[]')
  const adjustedIndex = id - defaultCategories.length - 1
  if (adjustedIndex >= 0 && adjustedIndex < customCats.length) {
    customCats[adjustedIndex].name = name
    customCats[adjustedIndex].icon = icon
    localStorage.setItem('heima_custom_categories', JSON.stringify(customCats))
    return { success: true, message: '' }
  }
  return { success: false, message: '预置分类不可修改' }
}

export async function deleteCategory(id) {
  if (isElectron()) {
    return window.electronAPI.deleteCategory(id)
  }
  const customCats = JSON.parse(localStorage.getItem('heima_custom_categories') || '[]')
  const adjustedIndex = id - defaultCategories.length - 1
  if (adjustedIndex >= 0 && adjustedIndex < customCats.length) {
    // 找到被删除分类的 id，用于删除相关记录
    const removedCat = customCats.splice(adjustedIndex, 1)[0]
    // 同时删除其子分类
    const removedId = defaultCategories.length + adjustedIndex + 1
    for (let i = customCats.length - 1; i >= 0; i--) {
      if (customCats[i].parent_id === removedId) {
        customCats.splice(i, 1)
      }
    }
    localStorage.setItem('heima_custom_categories', JSON.stringify(customCats))
    // 删除相关记录
    const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
    const idsToRemove = new Set([removedId])
    customCats.forEach((cat, idx) => {
      if (cat.parent_id === removedId) idsToRemove.add(defaultCategories.length + idx + 1)
    })
    const filtered = records.filter(r => !idsToRemove.has(r.category_id))
    localStorage.setItem('heima_records', JSON.stringify(filtered))
    return { success: true, message: '' }
  }
  return { success: false, message: '预置分类不可删除' }
}

// 根据 category_id 查找分类信息，补充名称和图标
function enrichRecord(record, categories) {
  const cat = categories.find(c => c.id === record.category_id)
  if (cat) {
    // cat.parent_id 存的是大类的 sort_order，需要用 sort_order 匹配
    // 必须同时限定 parent_id===0，因为子分类的 sort_order 也从1开始会冲突
    const parent = categories.find(c => c.sort_order === cat.parent_id && c.parent_id === 0)
    return {
      ...record,
      category_name: cat.name,
      category_icon: cat.icon,
      parent_id: cat.parent_id,
      parent_name: parent ? parent.name : '',
      parent_icon: parent ? parent.icon : ''
    }
  }
  return {
    ...record,
    category_name: '未知',
    category_icon: '❓',
    parent_id: 0,
    parent_name: '',
    parent_icon: ''
  }
}

// ========== 记账记录相关 ==========

export async function addRecord(record) {
  if (isElectron()) {
    return window.electronAPI.addRecord(record)
  }
  // 浏览器调试模式：使用 localStorage
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const newRecord = {
    ...record,
    id: Date.now(),
    created_at: new Date().toLocaleString()
  }
  records.push(newRecord)
  localStorage.setItem('heima_records', JSON.stringify(records))
  return newRecord.id
}

export async function getRecordsByMonth(year, month) {
  if (isElectron()) {
    return window.electronAPI.getRecordsByMonth(year, month)
  }
  // 浏览器调试模式
  const categories = await getCategories()
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return records
    .filter(r => r.date.startsWith(prefix))
    .map(r => enrichRecord(r, categories))
}

export async function deleteRecord(id) {
  if (isElectron()) {
    return window.electronAPI.deleteRecord(id)
  }
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const filtered = records.filter(r => r.id !== id)
  localStorage.setItem('heima_records', JSON.stringify(filtered))
  return 1
}

export async function getMonthTotal(year, month) {
  if (isElectron()) {
    return window.electronAPI.getMonthTotal(year, month)
  }
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return records
    .filter(r => r.date.startsWith(prefix))
    .reduce((sum, r) => sum + r.amount, 0)
}

export async function getMonthCategoryStats(year, month) {
  if (isElectron()) {
    return window.electronAPI.getMonthCategoryStats(year, month)
  }
  // 浏览器调试模式：按一级分类汇总
  const categories = await getCategories()
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  // 构建一级分类查找表：parent_id 是一级分类的序号（1=第1个一级分类，2=第2个...）
  const topLevels = categories.filter(c => c.parent_id === 0)
  const parentLookup = {}
  topLevels.forEach(tc => {
    // 在 Electron 中 parent_id 与 SQLite 自增 id 对应（id=1=餐饮饮食, id=2=交通出行...）
    // 但 getCategories() 用 index+1 作为 id，与 Electron id 一致
    // 所以用 sort_order 来确定 parent_id 对应的一级分类
    parentLookup[tc.sort_order] = tc
  })
  const catMap = {}
  records
    .filter(r => r.date.startsWith(prefix))
    .forEach(r => {
      const cat = categories.find(c => c.id === r.category_id)
      if (cat) {
        const parentId = cat.parent_id || 0
        // parentId 是一级分类的序号，通过 sort_order 查找对应的一级分类
        const parent = parentId > 0 ? parentLookup[parentId] : null
        // 以一级分类为维度汇总
        const key = parent ? parent.id : cat.id
        if (!catMap[key]) {
          catMap[key] = {
            id: key,
            name: parent ? parent.name : cat.name,
            icon: parent ? parent.icon : cat.icon,
            total: 0
          }
        }
        catMap[key].total += r.amount
      }
    })
  return Object.values(catMap)
}

export async function getMonthDailyStats(year, month) {
  if (isElectron()) {
    return window.electronAPI.getMonthDailyStats(year, month)
  }
  const records = JSON.parse(localStorage.getItem('heima_records') || '[]')
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const daily = {}
  records
    .filter(r => r.date.startsWith(prefix))
    .forEach(r => {
      daily[r.date] = (daily[r.date] || 0) + r.amount
    })
  return Object.entries(daily).map(([date, total]) => ({ date, total }))
}

// ========== 数据管理 ==========

export async function clearAllRecords() {
  if (isElectron()) {
    return window.electronAPI.clearAllRecords()
  }
  localStorage.removeItem('heima_records')
  return 1
}

export async function getRecordCount() {
  if (isElectron()) {
    return window.electronAPI.getRecordCount()
  }
  return JSON.parse(localStorage.getItem('heima_records') || '[]').length
}
