<template>
  <div class="inventory-dashboard page-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">库存管理数据大屏</h1>
    </div>
    
    <div class="dashboard-grid">
      <!-- 库存信息统计图表 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">库存信息</span>
        </template>
        <div ref="inventoryChartRef" class="chart-container"></div>
      </el-card>

      <!-- 库存预警记录 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">库存预警记录</span>
        </template>
        <div ref="alertChartRef" class="chart-container"></div>
      </el-card>

      <!-- 库存状态分布 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">库存状态分布</span>
        </template>
        <div ref="statusChartRef" class="chart-container"></div>
      </el-card>

      <!-- 产品库存排行 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">产品库存排行</span>
        </template>
        <div ref="rankingChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { inventoryAPI, productsAPI } from '@/api'
import { ElMessage } from 'element-plus'

// 图表引用
const inventoryChartRef = ref<HTMLDivElement>()
const alertChartRef = ref<HTMLDivElement>()
const statusChartRef = ref<HTMLDivElement>()
const rankingChartRef = ref<HTMLDivElement>()

// 图表实例
let inventoryChart: echarts.ECharts | null = null
let alertChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let rankingChart: echarts.ECharts | null = null

// 初始化库存信息图表
const initInventoryChart = async () => {
  if (!inventoryChartRef.value) return

  try {
    // 获取库存和产品数据
    const [inventoryResponse, productsResponse] = await Promise.all([
      inventoryAPI.getInventory(),
      productsAPI.getProducts()
    ])

    const inventories = inventoryResponse.data || inventoryResponse || []
    const products = productsResponse.data || []

    // 创建产品映射
    const productMap = new Map()
    products.forEach((product: any) => {
      productMap.set(product.product_id, product.product_name)
    })

    const productNames = inventories.map((item: any) => 
      productMap.get(item.product_id) || `产品${item.product_id}`
    )
    const stockQuantities = inventories.map((item: any) => item.current_stock_quantity)
    const alertThresholds = inventories.map((item: any) => item.alert_threshold)

    inventoryChart = echarts.init(inventoryChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['当前库存', '预警阈值'],
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: productNames,
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } },
        splitLine: { lineStyle: { color: '#333' } }
      },
      series: [
        {
          name: '当前库存',
          type: 'bar',
          data: stockQuantities,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        },
        {
          name: '预警阈值',
          type: 'line',
          data: alertThresholds,
          itemStyle: { color: '#ff6b6b' },
          lineStyle: { color: '#ff6b6b' }
        }
      ]
    }

    inventoryChart.setOption(option)
  } catch (error) {
    console.error('初始化库存图表失败:', error)
  }
}

// 初始化预警记录图表
const initAlertChart = async () => {
  if (!alertChartRef.value) return

  try {
    // 获取预警数据（模拟数据，实际应从API获取）
    const alertData = [
      { status: '已发送', count: 15 },
      { status: '未发送', count: 8 },
      { status: '处理中', count: 5 }
    ]

    alertChart = echarts.init(alertChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#fff' }
      },
      series: [
        {
          name: '预警状态',
          type: 'pie',
          radius: '50%',
          data: alertData.map(item => ({ name: item.status, value: item.count })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            color: function(params: any) {
              const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f']
              return colors[params.dataIndex]
            }
          }
        }
      ]
    }

    alertChart.setOption(option)
  } catch (error) {
    console.error('初始化预警图表失败:', error)
  }
}

// 初始化库存状态分布图表
const initStatusChart = async () => {
  if (!statusChartRef.value) return

  try {
    const inventoryResponse = await inventoryAPI.getInventory()
    const inventories = inventoryResponse.data || inventoryResponse || []

    // 统计库存状态
    let normal = 0, warning = 0, outOfStock = 0

    inventories.forEach((item: any) => {
      if (item.current_stock_quantity === 0) {
        outOfStock++
      } else if (item.current_stock_quantity <= item.alert_threshold) {
        warning++
      } else {
        normal++
      }
    })

    statusChart = echarts.init(statusChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['正常', '预警', '缺货'],
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } },
        splitLine: { lineStyle: { color: '#333' } }
      },
      series: [
        {
          name: '库存状态',
          type: 'bar',
          data: [
            { value: normal, itemStyle: { color: '#67c23a' } },
            { value: warning, itemStyle: { color: '#e6a23c' } },
            { value: outOfStock, itemStyle: { color: '#f56c6c' } }
          ],
          barWidth: '60%'
        }
      ]
    }

    statusChart.setOption(option)
  } catch (error) {
    console.error('初始化状态图表失败:', error)
  }
}

// 初始化产品库存排行图表
const initRankingChart = async () => {
  if (!rankingChartRef.value) return

  try {
    const [inventoryResponse, productsResponse] = await Promise.all([
      inventoryAPI.getInventory(),
      productsAPI.getProducts()
    ])

    const inventories = inventoryResponse.data || inventoryResponse || []
    const products = productsResponse.data || []

    // 创建产品映射
    const productMap = new Map()
    products.forEach((product: any) => {
      productMap.set(product.product_id, product.product_name)
    })

    // 按库存量排序
    const sortedInventories = [...inventories]
      .sort((a: any, b: any) => b.current_stock_quantity - a.current_stock_quantity)
      .slice(0, 10) // 取前10名

    const productNames = sortedInventories.map((item: any) => 
      productMap.get(item.product_id) || `产品${item.product_id}`
    )
    const stockQuantities = sortedInventories.map((item: any) => item.current_stock_quantity)

    rankingChart = echarts.init(rankingChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } },
        splitLine: { lineStyle: { color: '#333' } }
      },
      yAxis: {
        type: 'category',
        data: productNames,
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#fff' } }
      },
      series: [
        {
          name: '库存量',
          type: 'bar',
          data: stockQuantities,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          barWidth: '60%'
        }
      ]
    }

    rankingChart.setOption(option)
  } catch (error) {
    console.error('初始化排行图表失败:', error)
  }
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  inventoryChart?.resize()
  alertChart?.resize()
  statusChart?.resize()
  rankingChart?.resize()
}

onMounted(async () => {
  try {
    await Promise.all([
      initInventoryChart(),
      initAlertChart(),
      initStatusChart(),
      initRankingChart()
    ])
    window.addEventListener('resize', handleResize)
  } catch (error) {
    ElMessage.error('初始化数据大屏失败')
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  inventoryChart?.dispose()
  alertChart?.dispose()
  statusChart?.dispose()
  rankingChart?.dispose()
})
</script>

<style scoped>
.inventory-dashboard {
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  padding: 20px 0;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.dashboard-title {
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 0 20px 20px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.chart-card :deep(.el-card__header) {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
}

.card-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
  background: transparent;
}

.chart-container {
  width: 100%;
  height: 350px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 15px 15px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
}
</style> 