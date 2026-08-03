<template>
  <div class="stats-view">
    <div class="stats-header">
      <h2 class="page-title">月度统计</h2>
      <MonthPicker v-model:modelYear="year" v-model:modelMonth="month" />
    </div>

    <!-- 本月总览 -->
    <div class="stats-summary card">
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">本月总支出</span>
          <span class="summary-amount">¥{{ monthTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">日均花费</span>
          <span class="summary-avg">¥{{ dailyAvg.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">记账笔数</span>
          <span class="summary-count">{{ totalRecords }} 笔</span>
        </div>
      </div>
    </div>

    <!-- 饼图 - 分类占比 -->
    <div class="card chart-card" v-if="hasData">
      <h3 class="chart-title">分类占比</h3>
      <div class="chart-container" ref="pieChartRef"></div>
    </div>

    <!-- 柱状图 - 每日花费 -->
    <div class="card chart-card" v-if="hasData">
      <h3 class="chart-title">每日花费趋势</h3>
      <div class="chart-container" ref="barChartRef"></div>
    </div>

    <!-- 分类排行榜 -->
    <div class="card rank-card" v-if="hasData">
      <h3 class="chart-title">分类排行</h3>
      <div class="rank-list">
        <div
          class="rank-item"
          v-for="(item, index) in categoryRank"
          :key="item.id"
        >
          <span class="rank-num" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
          <span class="rank-icon">{{ item.icon }}</span>
          <span class="rank-name">{{ item.name }}</span>
          <span class="rank-amount">¥{{ item.total.toFixed(2) }}</span>
          <div class="rank-bar-wrap">
            <div
              class="rank-bar"
              :style="{ width: getBarWidth(item.total) + '%' }"
            ></div>
          </div>
          <span class="rank-percent">{{ getPercent(item.total) }}%</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!hasData">
      <div class="empty-icon">📊</div>
      <div class="empty-text">暂无数据，快去记一笔吧</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import MonthPicker from '../components/MonthPicker.vue'
import {
  getMonthTotal,
  getMonthCategoryStats,
  getMonthDailyStats,
  getRecordsByMonth
} from '../database/api.js'

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const monthTotal = ref(0)
const categoryStats = ref([])
const dailyStats = ref([])
const allRecords = ref([])

const pieChartRef = ref(null)
const barChartRef = ref(null)
let pieChart = null
let barChart = null

const hasData = computed(() => monthTotal.value > 0)

const dailyAvg = computed(() => {
  if (allRecords.value.length === 0) return 0
  const days = new Date(year.value, month.value, 0).getDate()
  return monthTotal.value / days
})

const totalRecords = computed(() => allRecords.value.length)

const categoryRank = computed(() => {
  return categoryStats.value.filter(c => c.total > 0).sort((a, b) => b.total - a.total)
})

function getBarWidth(total) {
  if (categoryRank.value.length === 0) return 0
  const max = categoryRank.value[0].total
  return max > 0 ? (total / max) * 100 : 0
}

function getPercent(total) {
  if (monthTotal.value === 0) return 0
  return ((total / monthTotal.value) * 100).toFixed(1)
}

onMounted(async () => {
  await loadData()
})

watch([year, month], async () => {
  await loadData()
})

onBeforeUnmount(() => {
  if (pieChart) pieChart.dispose()
  if (barChart) barChart.dispose()
})

async function loadData() {
  allRecords.value = await getRecordsByMonth(year.value, month.value)
  monthTotal.value = await getMonthTotal(year.value, month.value)
  categoryStats.value = await getMonthCategoryStats(year.value, month.value)
  dailyStats.value = await getMonthDailyStats(year.value, month.value)

  await nextTick()
  if (hasData.value) {
    renderPieChart()
    renderBarChart()
  }
}

function renderPieChart() {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }

  const data = categoryStats.value
    .filter(c => c.total > 0)
    .map(c => ({
      name: c.name,
      value: parseFloat(c.total.toFixed(2)),
      icon: c.icon
    }))

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: (name) => {
        const item = data.find(d => d.name === name)
        return item ? `${item.icon} ${name}` : name
      },
      textStyle: { fontSize: 13 }
    },
    color: ['#ff6b35', '#ffa502', '#ff4757', '#2ed573', '#1e90ff', '#a55eea', '#ff6348', '#3ae374', '#17c0eb', '#ffb142', '#ff7979', '#55efc4', '#fdcb6e'],
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data
      }
    ]
  })
}

function renderBarChart() {
  if (!barChartRef.value) return
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }

  const daysInMonth = new Date(year.value, month.value, 0).getDate()

  // 补全所有日期的数据
  const dailyMap = {}
  dailyStats.value.forEach(d => {
    dailyMap[d.date] = d.total
  })

  const xData = []
  const yData = []
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year.value}-${String(month.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    xData.push(`${i}日`)
    yData.push(parseFloat((dailyMap[dateStr] || 0).toFixed(2)))
  }

  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `${p.name}：¥${p.value.toFixed(2)}`
      }
    },
    grid: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        fontSize: 11,
        interval: daysInMonth > 15 ? 2 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        type: 'bar',
        data: yData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff6b35' },
            { offset: 1, color: '#ffb347' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barMaxWidth: 20
      }
    ]
  })
}
</script>

<style scoped>
.stats-view {
  padding: 28px 32px;
  max-width: 800px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stats-header .page-title {
  margin-bottom: 0;
}

.stats-summary {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  gap: 50px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-size: 13px;
  color: #999;
}

.summary-amount {
  font-size: 28px;
  font-weight: 700;
  color: #ff4757;
}

.summary-avg {
  font-size: 22px;
  font-weight: 600;
  color: #ff6b35;
}

.summary-count {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.rank-card {
  margin-bottom: 20px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f0f0f0;
  color: #999;
}

.rank-num.top-3 {
  background: #ff6b35;
  color: #fff;
}

.rank-icon {
  font-size: 20px;
}

.rank-name {
  width: 80px;
  font-size: 14px;
  color: #333;
}

.rank-amount {
  font-size: 15px;
  font-weight: 600;
  color: #ff4757;
  width: 100px;
  text-align: right;
}

.rank-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #ffb347);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.rank-percent {
  width: 50px;
  text-align: right;
  font-size: 12px;
  color: #999;
}
</style>
