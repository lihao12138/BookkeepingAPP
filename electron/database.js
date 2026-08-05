const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// 默认分类数据
const DEFAULT_CATEGORIES = [
  // 餐饮饮食
  { name: '餐饮饮食', parent_id: 0, icon: '🍔', sort_order: 1 },
  { name: '早餐', parent_id: 1, icon: '🥐', sort_order: 1 },
  { name: '午餐', parent_id: 1, icon: '🍱', sort_order: 2 },
  { name: '晚餐', parent_id: 1, icon: '🍲', sort_order: 3 },
  { name: '夜宵/零食', parent_id: 1, icon: '🍿', sort_order: 4 },
  { name: '饮品/奶茶', parent_id: 1, icon: '🧋', sort_order: 5 },
  { name: '外卖', parent_id: 1, icon: '🛵', sort_order: 6 },
  { name: '聚餐/请客', parent_id: 1, icon: '🥂', sort_order: 7 },
  // 交通出行
  { name: '交通出行', parent_id: 0, icon: '🚗', sort_order: 2 },
  { name: '公交/地铁', parent_id: 2, icon: '🚇', sort_order: 1 },
  { name: '出租车/网约车', parent_id: 2, icon: '🚕', sort_order: 2 },
  { name: '共享单车/电动车', parent_id: 2, icon: '🚲', sort_order: 3 },
  { name: '停车费', parent_id: 2, icon: '🅿️', sort_order: 4 },
  { name: '加油费', parent_id: 2, icon: '⛽', sort_order: 5 },
  { name: '高速费', parent_id: 2, icon: '🛣️', sort_order: 6 },
  { name: '火车/飞机/长途', parent_id: 2, icon: '🚄', sort_order: 7 },
  // 居住生活
  { name: '居住生活', parent_id: 0, icon: '🏠', sort_order: 3 },
  { name: '房租', parent_id: 3, icon: '🔑', sort_order: 1 },
  { name: '水费', parent_id: 3, icon: '💧', sort_order: 2 },
  { name: '电费', parent_id: 3, icon: '💡', sort_order: 3 },
  { name: '燃气费', parent_id: 3, icon: '🔥', sort_order: 4 },
  { name: '物业费', parent_id: 3, icon: '🏢', sort_order: 5 },
  { name: '网费', parent_id: 3, icon: '📡', sort_order: 6 },
  { name: '家具/家电', parent_id: 3, icon: '🛋️', sort_order: 7 },
  { name: '日用品/消耗品', parent_id: 3, icon: '🧴', sort_order: 8 },
  { name: '快递/物流', parent_id: 3, icon: '📦', sort_order: 9 },
  // 购物消费
  { name: '购物消费', parent_id: 0, icon: '🛒', sort_order: 4 },
  { name: '衣服/鞋帽', parent_id: 4, icon: '👕', sort_order: 1 },
  { name: '箱包/配饰', parent_id: 4, icon: '👜', sort_order: 2 },
  { name: '护肤/化妆品', parent_id: 4, icon: '💄', sort_order: 3 },
  { name: '数码产品', parent_id: 4, icon: '📱', sort_order: 4 },
  { name: '家居用品', parent_id: 4, icon: '🏠', sort_order: 5 },
  { name: '母婴用品', parent_id: 4, icon: '🍼', sort_order: 6 },
  // 医疗健康
  { name: '医疗健康', parent_id: 0, icon: '💊', sort_order: 5 },
  { name: '门诊/挂号', parent_id: 5, icon: '🏥', sort_order: 1 },
  { name: '药品', parent_id: 5, icon: '💊', sort_order: 2 },
  { name: '体检', parent_id: 5, icon: '🩺', sort_order: 3 },
  { name: '保健/养生', parent_id: 5, icon: '🧘', sort_order: 4 },
  { name: '医疗保险', parent_id: 5, icon: '🛡️', sort_order: 5 },
  // 教育学习
  { name: '教育学习', parent_id: 0, icon: '🎓', sort_order: 6 },
  { name: '书籍/教材', parent_id: 6, icon: '📚', sort_order: 1 },
  { name: '培训课程', parent_id: 6, icon: '📝', sort_order: 2 },
  { name: '考试报名', parent_id: 6, icon: '📋', sort_order: 3 },
  { name: '学费', parent_id: 6, icon: '🏫', sort_order: 4 },
  { name: '在线课程', parent_id: 6, icon: '💻', sort_order: 5 },
  // 休闲娱乐
  { name: '休闲娱乐', parent_id: 0, icon: '🎮', sort_order: 7 },
  { name: '电影/演出', parent_id: 7, icon: '🎬', sort_order: 1 },
  { name: '游戏/充值', parent_id: 7, icon: '🎮', sort_order: 2 },
  { name: '旅游/出行', parent_id: 7, icon: '✈️', sort_order: 3 },
  { name: '运动/健身', parent_id: 7, icon: '⚽', sort_order: 4 },
  { name: 'KTV/酒吧', parent_id: 7, icon: '🎤', sort_order: 5 },
  { name: '爱好/收藏', parent_id: 7, icon: '🎨', sort_order: 6 },
  // 金融理财
  { name: '金融理财', parent_id: 0, icon: '💰', sort_order: 8 },
  { name: '还贷款', parent_id: 8, icon: '🏦', sort_order: 1 },
  { name: '信用卡还款', parent_id: 8, icon: '💳', sort_order: 2 },
  { name: '保险', parent_id: 8, icon: '🛡️', sort_order: 3 },
  { name: '理财投资', parent_id: 8, icon: '📈', sort_order: 4 },
  { name: '手续费/利息', parent_id: 8, icon: '💹', sort_order: 5 },
  // 人情往来
  { name: '人情往来', parent_id: 0, icon: '🤝', sort_order: 9 },
  { name: '红包/随礼', parent_id: 9, icon: '🧧', sort_order: 1 },
  { name: '送礼', parent_id: 9, icon: '🎁', sort_order: 2 },
  { name: '请客', parent_id: 9, icon: '🍽️', sort_order: 3 },
  { name: '赞助/捐款', parent_id: 9, icon: '❤️', sort_order: 4 },
  // 通讯网络
  { name: '通讯网络', parent_id: 0, icon: '📱', sort_order: 10 },
  { name: '话费', parent_id: 10, icon: '📞', sort_order: 1 },
  { name: '会员订阅', parent_id: 10, icon: '👑', sort_order: 2 },
  { name: '云存储', parent_id: 10, icon: '☁️', sort_order: 3 },
  { name: 'APP购买', parent_id: 10, icon: '📲', sort_order: 4 },
  // 宠物相关
  { name: '宠物相关', parent_id: 0, icon: '🐱', sort_order: 11 },
  { name: '宠物粮食', parent_id: 11, icon: '🦴', sort_order: 1 },
  { name: '医疗/疫苗', parent_id: 11, icon: '💉', sort_order: 2 },
  { name: '用品/玩具', parent_id: 11, icon: '🧸', sort_order: 3 },
  // 工作相关
  { name: '工作相关', parent_id: 0, icon: '💼', sort_order: 12 },
  { name: '办公用品', parent_id: 12, icon: '📎', sort_order: 1 },
  { name: '打印/复印', parent_id: 12, icon: '🖨️', sort_order: 2 },
  { name: '差旅费', parent_id: 12, icon: '🧳', sort_order: 3 },
  { name: '工作餐', parent_id: 12, icon: '🥪', sort_order: 4 },
  // 其他
  { name: '其他', parent_id: 0, icon: '📌', sort_order: 13 }
]

class AppDatabase {
  constructor(dbPath) {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.init()
  }

  init() {
    // 创建分类表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER NOT NULL DEFAULT 0,
        icon TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_custom INTEGER NOT NULL DEFAULT 0
      )
    `)

    // 数据库迁移：为旧版本数据库添加 is_custom 列
    const tableInfo = this.db.prepare("PRAGMA table_info(categories)").all()
    const hasCustomCol = tableInfo.some(col => col.name === 'is_custom')
    if (!hasCustomCol) {
      this.db.exec('ALTER TABLE categories ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0')
    }

    // 创建记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        note TEXT DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `)

    // 初始化默认分类数据
    const count = this.db.prepare('SELECT COUNT(*) as count FROM categories').get().count
    if (count === 0) {
      const insert = this.db.prepare(
        'INSERT INTO categories (name, parent_id, icon, sort_order, is_custom) VALUES (?, ?, ?, ?, 0)'
      )
      const insertMany = this.db.transaction((categories) => {
        for (const cat of categories) {
          insert.run(cat.name, cat.parent_id, cat.icon, cat.sort_order)
        }
      })
      insertMany(DEFAULT_CATEGORIES)
    }
  }

  // 获取所有分类
  getCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY parent_id, sort_order').all()
  }

  // 添加自定义分类（is_custom = 1）
  addCategory(name, parent_id, icon, sort_order) {
    const stmt = this.db.prepare(
      'INSERT INTO categories (name, parent_id, icon, sort_order, is_custom) VALUES (?, ?, ?, ?, 1)'
    )
    return stmt.run(name, parent_id, icon, sort_order).lastInsertRowid
  }

  // 修改自定义分类（仅允许修改 is_custom = 1 的分类）
  updateCategory(id, name, icon) {
    const cat = this.db.prepare('SELECT is_custom FROM categories WHERE id = ?').get(id)
    if (!cat || !cat.is_custom) return { success: false, message: '预置分类不可修改' }
    const result = this.db.prepare(
      'UPDATE categories SET name = ?, icon = ? WHERE id = ? AND is_custom = 1'
    ).run(name, icon, id)
    return { success: result.changes > 0, message: result.changes > 0 ? '' : '修改失败' }
  }

  // 删除自定义分类（仅允许删除 is_custom = 1 的分类，级联删除子分类）
  deleteCategory(id) {
    const cat = this.db.prepare('SELECT is_custom FROM categories WHERE id = ?').get(id)
    if (!cat || !cat.is_custom) return { success: false, message: '预置分类不可删除' }

    const deleteChildren = this.db.prepare('DELETE FROM categories WHERE parent_id = ? AND is_custom = 1')
    const deleteSelf = this.db.prepare('DELETE FROM categories WHERE id = ? AND is_custom = 1')
    const deleteRecords = this.db.prepare('DELETE FROM records WHERE category_id IN (SELECT id FROM categories WHERE id = ? OR parent_id = ?)')

    const transaction = this.db.transaction((catId) => {
      const childChanges = deleteChildren.run(catId).changes
      const recordChanges = deleteRecords.run(catId, catId).changes
      const selfChanges = deleteSelf.run(catId).changes
      return { childChanges, recordChanges, selfChanges }
    })

    const result = transaction(id)
    return { success: true, message: '' }
  }

  // 添加记录
  addRecord(record) {
    const stmt = this.db.prepare(
      'INSERT INTO records (category_id, amount, note, date) VALUES (?, ?, ?, ?)'
    )
    const result = stmt.run(record.category_id, record.amount, record.note || '', record.date)
    return result.lastInsertRowid
  }

  // 获取某月记录
  getRecordsByMonth(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return this.db.prepare(
      `SELECT r.*, c.name as category_name, c.icon as category_icon, 
              c.parent_id, pc.name as parent_name, pc.icon as parent_icon
       FROM records r
       JOIN categories c ON r.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       WHERE r.date LIKE ?
       ORDER BY r.date DESC, r.created_at DESC`
    ).all(`${prefix}%`)
  }

  // 删除记录
  deleteRecord(id) {
    return this.db.prepare('DELETE FROM records WHERE id = ?').run(id).changes
  }

  // 获取某月总花费
  getMonthTotal(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    const result = this.db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM records WHERE date LIKE ?'
    ).get(`${prefix}%`)
    return result.total
  }

  // 获取某月各分类统计
  getMonthCategoryStats(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return this.db.prepare(
      `SELECT c.id, c.name, c.icon, COALESCE(SUM(r.amount), 0) as total, COUNT(*) as count
       FROM categories c
       LEFT JOIN records r ON (r.category_id = c.id OR r.category_id IN (
         SELECT sc.id FROM categories sc WHERE sc.parent_id = c.id
       )) AND r.date LIKE ?
       WHERE c.parent_id = 0
       GROUP BY c.id
       ORDER BY total DESC`
    ).all(`${prefix}%`)
  }

  // 获取某月每日统计
  getMonthDailyStats(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return this.db.prepare(
      `SELECT date, SUM(amount) as total
       FROM records
       WHERE date LIKE ?
       GROUP BY date
       ORDER BY date ASC`
    ).all(`${prefix}%`)
  }

  // 清空所有记录
  clearAllRecords() {
    return this.db.prepare('DELETE FROM records').run().changes
  }

  // 获取记录总数
  getRecordCount() {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM records').get()
    return result.count
  }
}

module.exports = AppDatabase
