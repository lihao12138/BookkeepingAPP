---
description: 一键存档：提交所有改动 + 打中文 tag + 推送到 GitHub。用法 /commit-tag-push <tag名>
argument-hint: <本次存档的tag名，比如：加了登录功能>
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git tag:*), Bash(git push:*), Bash(git log:*), Bash(git branch:*)
---

# commit-tag-push 命令（存档：提交+打tag+推送）

## 用户输入的 tag 名
$ARGUMENTS

## 你的任务

帮用户完成一次完整的"存档"流程，共 4 步。**全程不要中途停下问问题**，一气呵成做完。

### 第 0 步：检查参数
- 看上面 `$ARGUMENTS`，如果为空（用户没填 tag 名），直接停下告诉用户：「要打 tag 需要起个名字，请这样用：`/commit-tag-push 加了新功能`」，然后停止。
- 如果有内容，把它作为本次的 **tag 名**（可能含空格，是中文也没关系）。

### 第 1 步：看改动
运行下面三个命令，搞清楚这次存档改了什么：
- `git status`（哪些文件变了）
- `git diff HEAD`（具体内容差异）
- `git branch --show-current`（当前在哪个分支）

### 第 2 步：提交
- `git add -A`（把所有改动加进暂存区，包括新文件和删除的文件）
- 写一条**中文** commit 信息：根据第 1 步看到的改动，用一句话概括这次干了什么（比如「修复账单列表分类显示错误」「新增贪吃蛇小游戏」）。
- 用 heredoc 方式提交（避免中文转义问题）：
  ```
  git commit -m "$(cat <<'EOF'
  <你的中文提交信息>
  EOF
  )"
  ```

### 第 3 步：打 tag
用用户给的 tag 名打一个轻量 tag：
```
git tag "<用户给的tag名>"
```

### 第 4 步：推送
推送到 GitHub 远程（代码 + tag 一起推）：
```
git push
git push origin "<用户给的tag名>"
```

### 收尾：汇报
做完后，用一张表给用户总结这次存档：
| 项 | 内容 |
|---|---|
| 分支 | （当前分支名） |
| commit | （commit 哈希前 7 位 + 中文信息） |
| tag | （本次打的 tag 名） |
| 推送 | （成功/失败） |

**注意事项：**
- 如果任何一步命令报错，立刻停下，把错误原文告诉用户，不要硬往下走。
- 不要 push 之前没设上游的分支（如果是新分支，用 `git push -u origin <分支名>`）。
- 不要动 `.zcode/` 目录下的文件（那是 ZCode 自己的配置）。
