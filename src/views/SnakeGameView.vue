<template>
  <div class="snake-view">
    <h2 class="page-title">🎮 贪吃蛇</h2>
    <p class="tip">方向键 / WASD 控制 · 空格暂停</p>

    <!-- 分数显示 -->
    <div class="score-bar">
      <div class="score-item">分数: <span class="score-current">{{ score }}</span></div>
      <div class="score-item">最高: <span class="score-high">{{ highScore }}</span></div>
    </div>

    <!-- 游戏面板 -->
    <div class="board" :style="boardStyle">
      <!-- 网格线 -->
      <div class="grid-lines">
        <div v-for="i in GRID_SIZE" :key="'v' + i" class="grid-line-v" :style="{ left: (i - 1) * CELL_SIZE + 'px' }"></div>
        <div v-for="i in GRID_SIZE" :key="'h' + i" class="grid-line-h" :style="{ top: (i - 1) * CELL_SIZE + 'px' }"></div>
      </div>

      <!-- 蛇身 -->
      <div
        v-for="(seg, i) in snake"
        :key="i"
        class="snake-seg"
        :class="{ 'snake-head': i === 0 }"
        :style="segStyle(seg, i)"
      ></div>

      <!-- 食物 -->
      <div class="food" :style="foodStyle"></div>

      <!-- 准备开始遮罩 -->
      <div class="overlay" v-if="!isStarted && !gameOver">
        <div class="overlay-inner">
          <p class="overlay-title">准备开始</p>
          <p class="overlay-sub">按空格键或方向键开始</p>
        </div>
      </div>

      <!-- 暂停遮罩 -->
      <div class="overlay" v-if="isPaused">
        <div class="overlay-inner">
          <p class="overlay-title pause">⏸ 暂停</p>
          <p class="overlay-sub">按空格继续</p>
        </div>
      </div>

      <!-- 游戏结束遮罩 -->
      <div class="overlay" v-if="gameOver">
        <div class="overlay-inner">
          <p class="overlay-title over">💀 游戏结束</p>
          <p class="overlay-score">得分: <span class="score-current">{{ score }}</span></p>
          <p class="overlay-sub">按空格键重新开始</p>
        </div>
      </div>
    </div>

    <!-- 触屏方向按钮（桌面端也显示，方便鼠标用户） -->
    <div class="dpad">
      <div class="dpad-row">
        <span class="dpad-empty"></span>
        <button class="dpad-btn" @click="handleSwipe('UP')">▲</button>
        <span class="dpad-empty"></span>
      </div>
      <div class="dpad-row">
        <button class="dpad-btn" @click="handleSwipe('LEFT')">◀</button>
        <button class="dpad-btn" @click="handleSwipe('DOWN')">▼</button>
        <button class="dpad-btn" @click="handleSwipe('RIGHT')">▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ===== 游戏常量（1:1 复用原版） =====
const GRID_SIZE = 20       // 20×20 网格
const CELL_SIZE = 24       // 每格 24px
const INITIAL_SPEED = 150  // 初始速度 150ms 一帧

// ===== 方向映射 =====
const DIRECTION_MAP = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
  W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT'
}
const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }

// 生成不与蛇身重叠的食物位置
function randomFood(snake) {
  let pos
  do {
    pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }
  } while (snake.some(s => s.x === pos.x && s.y === pos.y))
  return pos
}

// ===== 响应式状态（React useState → Vue ref） =====
const INITIAL_SNAKE = [
  { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }
]

const snake = ref(INITIAL_SNAKE)
const food = ref({ x: 15, y: 10 })
const gameOver = ref(false)
const score = ref(0)
// 最高分持久化到 localStorage，刷新/重启后保留
const HIGH_SCORE_KEY = 'snake_high_score'
const highScore = ref(Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0)
const isPaused = ref(false)
const isStarted = ref(false)

// 非响应式变量跟踪最新方向（对应原版 dirRef，避免定时器闭包读到陈旧值）
let currentDir = 'RIGHT'
// 上一帧蛇实际走的方向。用于防止快速连按转向绕过 180° 限制自杀
let lastMovedDir = 'RIGHT'

let timer = null

// ===== 计算属性：面板和元素样式 =====
const boardStyle = computed(() => ({
  width: GRID_SIZE * CELL_SIZE + 'px',
  height: GRID_SIZE * CELL_SIZE + 'px'
}))

function segStyle(seg, i) {
  return {
    left: seg.x * CELL_SIZE + 1 + 'px',
    top: seg.y * CELL_SIZE + 1 + 'px',
    width: CELL_SIZE - 2 + 'px',
    height: CELL_SIZE - 2 + 'px'
  }
}

const foodStyle = computed(() => ({
  left: food.value.x * CELL_SIZE + 2 + 'px',
  top: food.value.y * CELL_SIZE + 2 + 'px',
  width: CELL_SIZE - 4 + 'px',
  height: CELL_SIZE - 4 + 'px'
}))

// ===== 游戏逻辑 =====
function resetGame() {
  snake.value = INITIAL_SNAKE.map(s => ({ ...s }))
  food.value = randomFood(snake.value)
  currentDir = 'RIGHT'
  lastMovedDir = 'RIGHT'
  gameOver.value = false
  score.value = 0
  isPaused.value = false
  isStarted.value = true
}

// 游戏循环：每帧移动蛇头
function tick() {
  const prev = snake.value
  const head = { x: prev[0].x, y: prev[0].y }
  switch (currentDir) {
    case 'UP': head.y -= 1; break
    case 'DOWN': head.y += 1; break
    case 'LEFT': head.x -= 1; break
    case 'RIGHT': head.x += 1; break
  }
  // 本帧实际移动后，更新 lastMovedDir，作为下一帧方向校验的基准
  lastMovedDir = currentDir
  // 撞墙
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    gameOver.value = true
    // 刷新最高分并持久化
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore.value))
    }
    return
  }
  // 撞自己
  if (prev.some(s => s.x === head.x && s.y === head.y)) {
    gameOver.value = true
    // 刷新最高分并持久化
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore.value))
    }
    return
  }
  // 吃食物判定
  const ate = head.x === food.value.x && head.y === food.value.y
  const next = [head, ...prev]
  if (!ate) {
    next.pop()  // 没吃到就去尾
  } else {
    score.value += 10
    food.value = randomFood(next)  // 吃到就生成新食物
  }
  snake.value = next
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (!isStarted.value || isPaused.value || gameOver.value) return
    tick()
  }, INITIAL_SPEED)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// ===== 键盘控制（对应原版 useEffect handleKey） =====
function handleKey(e) {
  // 空格：开始 / 暂停 / 重开
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault()
    if (gameOver.value) {
      resetGame()
    } else {
      isStarted.value = true
      isPaused.value = !isPaused.value
    }
    return
  }
  // 方向键 / WASD
  const newDir = DIRECTION_MAP[e.key]
  // 校验基准用 lastMovedDir（实际走的方向），而非 currentDir
  // 这样同一帧内快速连按两次转向，也无法绕过 180° 限制
  if (newDir && OPPOSITE[newDir] !== lastMovedDir) {
    currentDir = newDir
    if (!isStarted.value) isStarted.value = true
  }
}

// 触屏方向按钮
function handleSwipe(dir) {
  // 同样基于 lastMovedDir 校验，防止快速点按绕过 180° 限制
  if (OPPOSITE[dir] !== lastMovedDir) {
    currentDir = dir
  }
  if (!isStarted.value) isStarted.value = true
}

// ===== 生命周期 =====
onMounted(() => {
  window.addEventListener('keydown', handleKey)
  startTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  stopTimer()  // 关键：离开页面时清理定时器，防止后台继续跑
})
</script>

<style scoped>
.snake-view {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  user-select: none;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 6px;
  background: linear-gradient(to right, #4ade80, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tip {
  color: #888;
  font-size: 13px;
  margin: 0 0 16px;
}

/* 分数栏 */
.score-bar {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  font-size: 17px;
  font-family: ui-monospace, monospace;
  color: #ccc;
}

.score-current {
  color: #4ade80;
  font-weight: bold;
}

.score-high {
  color: #facc15;
  font-weight: bold;
}

/* 游戏面板 */
.board {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #334155;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.15);
  background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
}

/* 网格线 */
.grid-lines {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
}

.grid-line-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #94a3b8;
}

.grid-line-h {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #94a3b8;
}

/* 蛇身 */
.snake-seg {
  position: absolute;
  border-radius: 4px;
  transition: all 0.075s linear;
  background: rgba(34, 197, 94, 0.85);
}

.snake-head {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.5);
  z-index: 2;
}

/* 食物 */
.food {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #f87171, #ef4444);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.6);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* 遮罩层 */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.overlay-inner {
  text-align: center;
}

.overlay-title {
  font-size: 26px;
  font-weight: bold;
  color: #e2e8f0;
  margin: 0 0 8px;
}

.overlay-title.pause {
  font-size: 32px;
  color: #facc15;
}

.overlay-title.over {
  color: #f87171;
}

.overlay-score {
  font-size: 18px;
  color: #e2e8f0;
  margin: 0 0 12px;
}

.overlay-sub {
  color: #94a3b8;
  margin: 0;
}

/* 触屏方向键 */
.dpad {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.dpad-row {
  display: flex;
  gap: 8px;
}

.dpad-empty {
  width: 48px;
}

.dpad-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s;
}

.dpad-btn:hover {
  background: #334155;
}

.dpad-btn:active {
  background: #475569;
}
</style>
