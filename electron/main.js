const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('./database')

let mainWindow
let db

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    title: '黑马记账',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 开发环境加载 Vite dev server，生产环境加载打包文件
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 初始化数据库
function initDatabase() {
  const userDataPath = app.getPath('userData')
  db = new Database(path.join(userDataPath, 'heima.db'))
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ========== IPC 通信：数据库操作 ==========

// 获取所有分类
ipcMain.handle('db:getCategories', () => {
  return db.getCategories()
})

// 添加记录
ipcMain.handle('db:addRecord', (event, record) => {
  return db.addRecord(record)
})

// 获取某月记录
ipcMain.handle('db:getRecordsByMonth', (event, year, month) => {
  return db.getRecordsByMonth(year, month)
})

// 删除记录
ipcMain.handle('db:deleteRecord', (event, id) => {
  return db.deleteRecord(id)
})

// 获取某月总花费
ipcMain.handle('db:getMonthTotal', (event, year, month) => {
  return db.getMonthTotal(year, month)
})

// 获取某月分类统计
ipcMain.handle('db:getMonthCategoryStats', (event, year, month) => {
  return db.getMonthCategoryStats(year, month)
})

// 获取某月每日统计
ipcMain.handle('db:getMonthDailyStats', (event, year, month) => {
  return db.getMonthDailyStats(year, month)
})

// 清空所有记录
ipcMain.handle('db:clearAllRecords', () => {
  return db.clearAllRecords()
})

// 获取记录总数
ipcMain.handle('db:getRecordCount', () => {
  return db.getRecordCount()
})
