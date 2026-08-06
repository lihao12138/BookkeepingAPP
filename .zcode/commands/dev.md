---
description: 启动网页版开发服务器（vite）。会自动检测端口，避免重复启动。
allowed-tools: Bash(lsof:*), Bash(kill:*), Bash(npm run dev), Bash(curl:*)
---

# dev 命令（启动开发服务器）

## 你的任务

启动这个项目的网页版开发服务器（`npm run dev`，底层是 vite）。
服务器是**长期运行**的，要放后台跑。按下面步骤来，不要中途问问题。

### 第 1 步：检查端口 5173 是否已被占用

开发服务器默认用 5173 端口。先检查它有没有已经在跑：

```bash
lsof -iTCP:5173 -sTCP:LISTEN
```

- **如果有输出**（说明已经有 dev 服务器在跑）：直接告诉用户「dev 服务器已经在跑了，访问 http://localhost:5173 即可」，然后**停止，不要重复启动**。
- **如果没输出**（端口空闲）：继续第 2 步。

### 第 2 步：后台启动 dev 服务器

用 `run_in_background: true` 后台运行，避免阻塞当前会话：

```bash
cd /Users/mac/Desktop/test/heimaAPP && npm run dev
```

> 必须用后台运行（run_in_background），否则会卡住整个会话。

### 第 3 步：等待启动完成，验证是否成功

启动需要几秒。等待约 5 秒后，用 curl 检测服务器有没有真的起来：

```bash
sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```

- **返回 200**（或任何 HTTP 状态码）：说明服务器启动成功。
- **连接失败 / 返回 000**：说明启动失败，再去检查端口有没有监听：
  ```bash
  lsof -iTCP:5173 -sTCP:LISTEN
  ```

### 第 4 步：汇报结果

给用户一个清晰的总结：

**启动成功时：**
```
✅ 开发服务器已启动
🌐 访问地址：http://localhost:5173
💡 关闭方法：在终端按 Ctrl+C，或者让我帮你停（跟我说"关掉 dev 服务器"）
```

**启动失败时：**
- 如实告诉用户失败了
- 把 `curl` 的返回值和 `lsof` 的检查结果贴出来
- 不要假装成功

### 注意事项
- **绝对不要**用前台运行（不加 run_in_background），否则整个会话会卡死。
- 服务器一旦启动成功，就保持后台运行，不要试图 kill 它。
- 如果用户后续说"关掉 dev 服务器"，用 `lsof -iTCP:5173 -sTCP:LISTEN` 找到 PID 然后 kill。
