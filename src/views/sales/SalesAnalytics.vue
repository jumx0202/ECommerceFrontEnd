<template>
  <div class="sales-analytics">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">分析图表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="default"
              @change="handleDateChange"
            />
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 主要图表 - 渠道ID分析 -->
      <div class="main-chart-container">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">渠道ID</span>
              <div class="legend-container">
                <div class="legend-item">
                  <span class="legend-color" style="background: #409EFF;"></span>
                  <span class="legend-text">数据一统计</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #E74C3C;"></span>
                  <span class="legend-text">渠道统计分析</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #67C23A;"></span>
                  <span class="legend-text">营销管理</span>
                </div>
              </div>
            </div>
          </template>
          <div class="chart-container large">
            <v-chart :option="channelIdOption" v-loading="chartLoading" />
          </div>
        </el-card>
      </div>

      <!-- 下方三个图表 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span class="chart-title">销售订单</span>
            </template>
            <div class="chart-container">
              <v-chart :option="salesOrdersOption" v-loading="chartLoading" />
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span class="chart-title">销售渠道</span>
            </template>
            <div class="chart-container">
              <v-chart :option="salesChannelsOption" v-loading="chartLoading" />
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span class="chart-title">订单ID</span>
            </template>
            <div class="chart-container">
              <v-chart :option="orderIdOption" v-loading="chartLoading" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 说明文字 -->
      <div class="description">
        <p>数据统计：点击菜单中的多渠道销售管理→数据统计后，显示数据统计。</p>
        <p>以数据统计卡片的形式，展示数据统计的关键字段数据统计结果。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
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

// 注册 ECharts 组件
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

const chartLoading = ref(false)
const dateRange = ref<[Date, Date] | null>(null)

// 图表数据
const chartData = reactive({
  channelId: {
    categories: ['数据一统计', '渠道统计分析', '营销管理'],
    data1: [500, 1000, 1000], // 数据一统计
    data2: [300, 500, 1000], // 渠道统计分析
    data3: [600, 500, 800]   // 营销管理
  },
  salesOrders: {
    categories: ['1001', '1002', '1003'],
    values: [50, 600, 200]
  },
  salesChannels: {
    categories: ['1', '2', '3'],
    values: [30, 220, 120]
  },
  orderId: [
    { name: '102', value: 102 },
    { name: '101', value: 101 },
    { name: '1003', value: 1003 },
    { name: '1002', value: 1002 },
    { name: '1', value: 1 }
  ]
})

// 渠道ID堆叠柱状图配置
const channelIdOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params: any) => {
      let result = `${params[0].axisValue}<br/>`
      params.forEach((param: any) => {
        result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
      })
      return result
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
    data: chartData.channelId.categories,
    axisLabel: {
      fontSize: 12,
      color: '#666'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 12,
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: '#E4E4E4'
      }
    }
  },
  series: [
    {
      name: '数据一统计',
      type: 'bar',
      stack: 'total',
      data: chartData.channelId.data1,
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '渠道统计分析',
      type: 'bar',
      stack: 'total',
      data: chartData.channelId.data2,
      itemStyle: {
        color: '#E74C3C'
      }
    },
    {
      name: '营销管理',
      type: 'bar',
      stack: 'total',
      data: chartData.channelId.data3,
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
}))

// 销售订单柱状图配置
const salesOrdersOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}'
  },
  grid: {
    left: '15%',
    right: '10%',
    bottom: '15%',
    top: '10%'
  },
  xAxis: {
    type: 'category',
    data: chartData.salesOrders.categories,
    axisLabel: {
      fontSize: 10,
      color: '#666'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 10,
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: '#E4E4E4'
      }
    }
  },
  series: [{
    data: chartData.salesOrders.values,
    type: 'bar',
    itemStyle: {
      color: '#67C23A'
    },
    barWidth: '50%'
  }]
}))

// 销售渠道线图配置
const salesChannelsOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}'
  },
  grid: {
    left: '15%',
    right: '10%',
    bottom: '15%',
    top: '10%'
  },
  xAxis: {
    type: 'category',
    data: chartData.salesChannels.categories,
    axisLabel: {
      fontSize: 10,
      color: '#666'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 10,
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: '#E4E4E4'
      }
    }
  },
  series: [{
    data: chartData.salesChannels.values,
    type: 'line',
    smooth: true,
    itemStyle: {
      color: '#E74C3C'
    },
    lineStyle: {
      color: '#E74C3C',
      width: 3
    },
    symbolSize: 8
  }]
}))

// 订单ID饼图配置
const orderIdOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  series: [{
    name: '订单ID',
    type: 'pie',
    radius: '65%',
    center: ['50%', '50%'],
    data: chartData.orderId,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    itemStyle: {
      color: (params: any) => {
        const colors = ['#F39C12', '#3498DB', '#27AE60', '#9B59B6', '#E74C3C']
        return colors[params.dataIndex % colors.length]
      }
    }
  }]
}))

// 刷新数据
const refreshData = async () => {
  try {
    chartLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以调用实际的API
    // const response = await salesAnalyticsAPI.getChartData()
    // 更新chartData...
    
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    chartLoading.value = false
  }
}

// 日期范围改变处理
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    console.log('日期范围:', dates)
    refreshData()
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.sales-analytics {
  padding: 0;
}

.page-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-chart-container {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.legend-container {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.chart-container.large {
  height: 400px;
}

.charts-row {
  margin-bottom: 20px;
}

.description {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.description p {
  margin: 0;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.description p:last-child {
  margin-bottom: 0;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style> 