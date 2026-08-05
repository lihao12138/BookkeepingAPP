## 分类管理功能实现方案

### 需求回顾
- 用户可以**新增**分类（一级大类 + 二级小类）
- 用户可以**修改名称**和**图标**（仅限自己创建的分类）
- 用户可以**删除**分类（仅限自己创建的分类）
- 预置的 13 个大类及其子分类**不可修改、不可删除**
- 功能入口在「设置」页面，图标从预设 emoji 列表中点选

### 技术思路

用 `is_custom` 字段区分预置分类和用户自定义分类。预置分类插入时 `is_custom = 0`，用户新增的 `is_custom = 1`。所有修改/删除操作只允许对 `is_custom = 1` 的分类执行。

### 修改文件清单（6 个文件）

#### 1. `electron/database.js` — 数据库层
- `categories` 表新增 `is_custom` 列（`INTEGER NOT NULL DEFAULT 0`）
- `init()` 中插入预置分类时设置 `is_custom = 0`
- 新增 3 个方法：
  - `addCategory(name, parent_id, icon, sort_order)` — 插入 `is_custom = 1` 的新分类
  - `updateCategory(id, name, icon)` — 只允许更新 `is_custom = 1` 的分类
  - `deleteCategory(id)` — 只允许删除 `is_custom = 1` 的分类，若有子分类则级联删除

#### 2. `electron/main.js` — IPC 注册
- 新增 3 个 handler：`db:addCategory`、`db:updateCategory`、`db:deleteCategory`

#### 3. `electron/preload.js` — 预加载桥接
- 在 `electronAPI` 中新增 `addCategory`、`updateCategory`、`deleteCategory` 三个方法

#### 4. `src/database/api.js` — 双模式 API 层
- 新增导出函数 `addCategory()`、`updateCategory()`、`deleteCategory()`
- Electron 模式走 IPC，浏览器模式用 localStorage 兜底

#### 5. `src/views/SettingsView.vue` — 设置页面 UI
- 新增「分类管理」卡片区块，包含「管理分类」按钮
- 点击按钮弹出**分类管理弹窗**（复用 `.modal-overlay` 样式，宽度加大到 560px）
- 弹窗内容：
  - **分类列表**：按一级→二级的缩进列表展示，预置分类显示🔒标记（不可编辑），用户分类显示编辑/删除按钮
  - **新增按钮**：「添加大类」和「添加小类」（选择父级后填写）
  - **编辑弹窗**：修改名称 + emoji 选择器（预设 60 个常用 emoji 网格点选）
  - **删除确认**：复用现有确认弹窗模式
- 涉及分类变更后，通过 emit 或事件通知其他页面刷新分类数据

#### 6. `src/data/categories.json` — 静态兜底数据
- 每个条目新增 `"is_custom": false` 字段，保持与数据库结构一致

### 交互流程

1. 用户进入「设置」→ 点击「管理分类」→ 弹出管理弹窗
2. 弹窗中看到所有分类（预置🔒 + 用户自定义），用户分类旁有 ✏️ 和 🗑️ 按钮
3. 点击「添加大类」→ 输入名称 + 选择 emoji → 保存
4. 点击某个大类旁的「+」→ 添加该大类下的小类
5. 点击用户分类的 ✏️ → 弹出编辑框，修改名称或 emoji
6. 点击用户分类的 🗑️ → 弹出确认框 → 确认后删除（若有子分类一并删除）
7. 关闭管理弹窗时，其他页面的分类自动刷新