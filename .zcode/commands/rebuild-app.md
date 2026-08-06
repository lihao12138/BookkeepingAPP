---
description: 重新打包桌面应用：清理旧产物 + 构建网页代码 + 封装成 macOS 安装包(.dmg)。
allowed-tools: Bash(rm:*), Bash(npm run electron:build), Bash(ls:*), Bash(find:*)
---

# rebuild-app 命令（重新打包桌面应用）

## 你的任务

把当前的记账 APP 重新打包成一份 **macOS 桌面安装包（.dmg）**。
整个过程分 3 步：清理旧产物 → 构建网页代码 → 封装成安装包。
**全程不要中途停下问问题**，按步骤一气呵成做完。

> 这个命令是**前台**运行的（不像 /dev 那样后台跑），因为打包是一次性任务，会等它跑完。

### 第 1 步：清理旧的构建产物

打包前先删掉旧的产物，确保是全新干净的构建，避免旧文件残留导致莫名其妙的问题。

```bash
rm -rf dist release
```

- `dist/` 是上次 vite 构建出的网页文件
- `release/` 是上次 electron-builder 封装出的安装包

删完不需要汇报，直接进下一步。

### 第 2 步：打包（构建 + 封装）

执行 `package.json` 里配置好的 `electron:build` 脚本，它会自动完成两件事：
1. `vite build` —— 把 Vue 网页代码编译成静态文件放进 `dist/`
2. `electron-builder` —— 把 `dist/` + `electron/` 主进程代码封装成 `.dmg` 安装包放进 `release/`

```bash
npm run electron:build
```

> ⏱️ 这一步比较慢，通常要 **1～3 分钟**（要下载/编译原生模块、压缩资源）。请耐心等它跑完，不要中途中断。
> 命令本身要设足够的超时（建议至少 600000 毫秒 = 10 分钟），避免提前超时被打断。

### 第 3 步：验证产物并汇报

打包结束后，检查 `release/` 目录里有没有生成 `.dmg` 文件：

```bash
ls -lh release/*.dmg 2>/dev/null
```

**打包成功时**，用下面这个格式给用户总结：

```
✅ 打包完成
📦 安装包：release/（显示出来的 .dmg 文件名，含文件大小）
💡 使用方法：双击 .dmg，把「记账APP」拖进 Applications 文件夹即可安装
```

**打包失败时**（没找到 .dmg 文件，或第 2 步命令报错退出）：
- 如实告诉用户打包失败了
- 把第 2 步命令最后输出的报错信息贴出来（通常是红色文字）
- 不要假装成功
- 常见失败原因提示给用户：
  - 「icon 文件缺失」：检查 `public/icon.icns` 是否存在
  - 「better-sqlite3 编译失败」：原生模块没装好，试 `npm install` 重装依赖
  - 「网络超时」：electron-builder 下载 electron 二进制时网络问题，可重试

### 注意事项
- 这个命令**不需要参数**，用户直接输 `/rebuild-app` 即可。
- 打包过程中屏幕会刷一堆日志（vite 构建、electron-builder 进度条），这是正常的，不要被吓到。
- 不要去手动改 `package.json` 里的 `build` 配置。
- 如果用户之前用 `/dev` 启了 dev 服务器，打包前**不需要**关掉它，两者互不影响（打包用的是独立的 build 流程）。
