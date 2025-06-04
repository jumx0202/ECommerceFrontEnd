<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon size="24"><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.totalOrders }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statsData.totalRevenue.toLocaleString() }}</div>
              <div class="stat-label">总营收</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon size="24"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.totalProducts }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="salesTrendPeriod" size="small">
                <el-radio-button label="week">最近7天</el-radio-button>
                <el-radio-button label="month">最近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="salesTrendOption" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>渠道销售分布</span>
          </template>
          <div class="chart-container">
            <v-chart :option="channelDistributionOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <span>订单状态分布</span>
          </template>
          <div class="chart-container">
            <v-chart :option="orderStatusOption" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <span>库存预警</span>
          </template>
          <div class="chart-container">
            <v-chart :option="inventoryWarningOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-row>
      <el-col :span="24">
        <el-card class="recent-orders-card">
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
              <el-button type="primary" size="small" @click="refreshOrders">刷新</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" stripe>
            <el-table-column prop="orderId" label="订单号" width="150" />
            <el-table-column prop="channel" label="渠道" width="100" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import { dashboardAPI, salesOrdersAPI } from '@/api'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const salesTrendPeriod = ref('week')

const statsData = reactive({
  totalOrders: 0,
  totalRevenue: 0,
  totalProducts: 0,
  totalUsers: 0,
  activeAlerts: 0,
  activeSuppliers: 0,
  orderStatusDistribution: {} as Record<string, number>
})

const recentOrders = ref<any[]>([])

const chartData = reactive({
  salesTrend: {
    dates: [] as string[],
    amounts: [] as number[]
  },
  channelDistribution: {
    channels: [] as string[],
    amounts: [] as number[]
  },
  orderStatus: {
    labels: [] as string[],
    values: [] as number[]
  },
  inventoryWarning: {
    productNames: [] as string[],
    currentStocks: [] as number[],
    alertThresholds: [] as number[]
  }
})

// 销售趋势图表配置
const salesTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: chartData.salesTrend.dates
  },
  yAxis: { type: 'value' },
  series: [{
    data: chartData.salesTrend.amounts,
    type: 'line',
    smooth: true,
    itemStyle: { color: '#409EFF' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0)' }
        ]
      }
    }
  }]
}))

// 渠道分布图表配置
const channelDistributionOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: chartData.channelDistribution.channels
  },
  yAxis: { type: 'value' },
  series: [{
    data: chartData.channelDistribution.amounts,
    type: 'bar',
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#87CEEB' }
        ]
      }
    }
  }]
}))

// 订单状态分布
const orderStatusOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: '70%',
    data: chartData.orderStatus.labels.map((label, index) => ({
      value: chartData.orderStatus.values[index],
      name: label
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
}))

// 库存预警
const inventoryWarningOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['当前库存', '预警线']
  },
  xAxis: {
    type: 'category',
    data: chartData.inventoryWarning.productNames
  },
  yAxis: { type: 'value' },
  series: [{
    name: '当前库存',
    data: chartData.inventoryWarning.currentStocks,
    type: 'bar',
    itemStyle: { color: '#E74C3C' }
  }, {
    name: '预警线',
    data: chartData.inventoryWarning.alertThresholds,
    type: 'line',
    itemStyle: { color: '#F39C12' }
  }]
}))

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '已完成': 'success',
    '已支付': 'primary',
    '已发货': 'warning',
    '待支付': 'info',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 响应式数据
const loading = ref(false)
const chartLoading = ref(false)

// 获取统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true
    const response = await dashboardAPI.getStatistics()
    const data = response.data
    
    // 更新统计数据
    statsData.totalOrders = data.total_orders || 0
    statsData.totalRevenue = data.total_revenue || 0
    statsData.totalProducts = data.total_products || 0
    statsData.totalUsers = data.total_users || 0
    statsData.activeAlerts = data.active_alerts || 0
    statsData.activeSuppliers = data.active_suppliers || 0
    statsData.orderStatusDistribution = data.order_status_distribution || {}
    
    // 更新订单状态图表数据
    const statusLabels = Object.keys(statsData.orderStatusDistribution)
    const statusValues = Object.values(statsData.orderStatusDistribution)
    chartData.orderStatus.labels = statusLabels
    chartData.orderStatus.values = statusValues
    
    // 更新图表选项
    orderStatusOption.value.series[0].data = statusLabels.map((label, index) => ({
      name: label,
      value: statusValues[index]
    }))
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取销售趋势数据
const fetchSalesTrend = async () => {
  try {
    chartLoading.value = true
    const response = await dashboardAPI.getSalesTrend()
    const data = response.data
    
    chartData.salesTrend.dates = data.dates || []
    chartData.salesTrend.amounts = data.amounts || []
    
    // 更新图表选项
    salesTrendOption.value.xAxis.data = chartData.salesTrend.dates
    salesTrendOption.value.series[0].data = chartData.salesTrend.amounts
  } catch (error) {
    console.error('获取销售趋势失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 获取渠道分布数据
const fetchChannelDistribution = async () => {
  try {
    const response = await dashboardAPI.getChannelDistribution()
    const data = response.data
    
    chartData.channelDistribution.channels = data.channels || []
    chartData.channelDistribution.amounts = data.amounts || []
    
    // 更新图表选项
    const pieData = data.channels?.map((channel: string, index: number) => ({
      name: channel,
      value: data.amounts[index]
    })) || []
    channelDistributionOption.value.series[0].data = pieData
  } catch (error) {
    console.error('获取渠道分布失败:', error)
  }
}

// 获取库存预警数据
const fetchInventoryAlerts = async () => {
  try {
    const response = await dashboardAPI.getInventoryAlerts()
    const data = response.data
    
    chartData.inventoryWarning.productNames = data.product_names || []
    chartData.inventoryWarning.currentStocks = data.current_stocks || []
    chartData.inventoryWarning.alertThresholds = data.alert_thresholds || []
  } catch (error) {
    console.error('获取库存预警失败:', error)
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    const response = await dashboardAPI.getRecentOrders(10)
    const orders = response.data || []
    
    // 转换数据格式以匹配表格
    recentOrders.value = orders.map((order: any) => ({
      orderId: order.order_id,
      channel: order.channel,
      amount: order.amount,
      status: order.status,
      createTime: formatDate(order.order_date)
    }))
  } catch (error) {
    console.error('获取最近订单失败:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    fetchStatistics(),
    fetchSalesTrend(),
    fetchChannelDistribution(),
    fetchInventoryAlerts(),
    fetchRecentOrders()
  ])
  ElMessage.success('数据刷新成功')
}

// 刷新订单数据
const refreshOrders = async () => {
  await fetchRecentOrders()
  ElMessage.success('订单数据刷新成功')
}

// 格式化金额
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

// 格式化日期
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
  refreshData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px 0;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.recent-orders-card {
  border-radius: 12px;
  overflow: hidden;
}

.amount {
  color: #E74C3C;
  font-weight: 600;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}
</style> 