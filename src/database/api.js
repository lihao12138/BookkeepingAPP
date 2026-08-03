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
  // 浏览器调试模式：直接使用导入的分类数据，分配 id
  return defaultCategories.map((cat, index) => ({ ...cat, id: index + 1 }))
}

// 根据 category_id 查找分类信息，补充名称和图标
function enrichRecord(record, categories) {
  const cat = categories.find(c => c.id === record.category_id)
  if (cat) {
    const parent = categories.find(c => c.id === cat.parent_id)
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
  return []
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
