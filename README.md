# 💰 记账APP

> 一款个人轻量级记账工具，基于 Vue 3 + Electron 构建，支持桌面端运行与浏览器调试，数据本地离线存储。

## ✨ 功能特性

### 📝 记一笔
- 两级分类选择（13 个大类 + 多个子分类），emoji 图标直观展示
- 记录金额、日期、备注
- 实时显示本月花费

### 📋 账单管理
- 按月份浏览所有账单记录
- 按一级分类筛选
- 删除单条记录

### 📊 统计分析
- 月度收支汇总
- 分类占比饼图（基于 ECharts）
- 一级分类维度统计消费分布

### ⚙️ 设置
- **分类管理**：可新增自定义大类 / 子分类，修改名称与图标
- 预置的 13 个大类及其子分类不可修改、不可删除
- 自定义分类支持编辑、删除（含子分类的级联删除）

## 🛠️ 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 前端框架 | [Vue 3](https://vuejs.org/) | Composition API + `<script setup>` |
| 路由 | Vue Router 4 | Hash 模式 |
| 状态管理 | Pinia | |
| 图表 | [ECharts 5](https://echarts.apache.org/) | 饼图统计 |
| 构建工具 | [Vite 5](https://vitejs.dev/) | 快速热更新 |
| 桌面端 | [Electron 31](https://www.electronjs.org/) | 跨平台桌面应用打包 |
| 数据存储 | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 桌面端 SQLite 本地数据库 |
| 浏览器调试兜底 | localStorage | 浏览器模式下用本地存储模拟 |

## 📂 项目结构

```
heimaAPP/
├── electron/                # Electron 桌面端
│   ├── main.js              # 主进程（窗口创建 + IPC 注册）
│   ├── preload.js           # 预加载脚本（暴露安全 API 给渲染进程）
│   └── database.js          # SQLite 数据库层（建表 + 增删改查）
├── src/                     # Vue 前端源码
│   ├── views/               # 页面
│   │   ├── HomeView.vue     # 记一笔
│   │   ├── BillView.vue     # 账单
│   │   ├── StatsView.vue    # 统计
│   │   └── SettingsView.vue # 设置（含分类管理）
│   ├── components/          # 通用组件
│   │   ├── CategoryPicker.vue  # 分类选择器（两级）
│   │   ├── MonthPicker.vue     # 月份选择器
│   │   ├── RecordItem.vue      # 账单条目
│   │   └── Sidebar.vue         # 侧边导航栏
│   ├── database/api.js      # 数据 API（Electron IPC / 浏览器双模式）
│   ├── data/categories.json # 静态兜底分类数据
│   ├── router/index.js      # 路由配置
│   ├── stores/              # Pinia 状态
│   └── assets/styles/       # 全局样式
├── public/                  # 静态资源（应用图标）
├── index.html               # 入口 HTML
├── vite.config.js           # Vite 配置
└── package.json             # 依赖与脚本
```

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+（推荐 LTS 版本）
- npm（随 Node.js 一起安装）

### 安装依赖

```bash
npm install
```

### 开发模式

项目提供两种开发方式：

**1. 浏览器调试模式（推荐日常开发）**

```bash
npm run dev
```

启动后访问终端显示的地址（默认 http://localhost:5173 ）。
此模式下数据存储在浏览器的 localStorage 中，方便快速预览和调试界面。

**2. Electron 桌面模式**

```bash
npm run electron:dev
```

同时启动 Vite 开发服务器和 Electron 窗口，数据存储在本地 SQLite 数据库。

### 打包发布

打包成桌面安装程序：

```bash
npm run electron:build
```

打包产物输出到 `release/` 目录：
- **macOS**：`.dmg` 安装包
- **Windows**：`.exe` NSIS 安装程序

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（浏览器模式） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run electron:dev` | 启动 Electron 开发环境 |
| `npm run electron:build` | 打包桌面应用 |

## 🗂️ 版本记录

| 版本标签 | 说明 |
|----------|------|
| `第一个版本` | 记账APP 首个版本 |
| `修好饼图` | 修复统计页面饼图显示问题 |
| `加了分类管理` | 设置页面的分类管理功能 |
| `加了开发工具` | 添加开发工具配置 |
| `修好分类名称` | 修复一级分类名称显示错误 + 应用改名 |

## 📄 许可证

ISC
