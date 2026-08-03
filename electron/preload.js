const { contextBridge, ipcRenderer } = require('electron')

// 通过 contextBridge 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 分类相关
  getCategories: () => ipcRenderer.invoke('db:getCategories'),

  // 记账记录相关
  addRecord: (record) => ipcRenderer.invoke('db:addRecord', record),
  getRecordsByMonth: (year, month) => ipcRenderer.invoke('db:getRecordsByMonth', year, month),
  deleteRecord: (id) => ipcRenderer.invoke('db:deleteRecord', id),
  getMonthTotal: (year, month) => ipcRenderer.invoke('db:getMonthTotal', year, month),
  getMonthCategoryStats: (year, month) => ipcRenderer.invoke('db:getMonthCategoryStats', year, month),
  getMonthDailyStats: (year, month) => ipcRenderer.invoke('db:getMonthDailyStats', year, month),

  // 数据管理
  clearAllRecords: () => ipcRenderer.invoke('db:clearAllRecords'),
  getRecordCount: () => ipcRenderer.invoke('db:getRecordCount')
})
