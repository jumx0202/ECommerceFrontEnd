<template>
  <div class="sales-statistics">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">数据统计</span>
          <div class="header-actions">
            <el-button type="primary" @click="refreshStatistics">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="success" @click="exportData">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片区域 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card class="stat-card" v-loading="loading">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon size="32"><Shop /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.channelId }}</div>
                <div class="stat-label">渠道ID</div>
                <div class="stat-type">INT</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card" v-loading="loading">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon size="32"><Grid /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.channelName }}</div>
                <div class="stat-label">渠道名称</div>
                <div class="stat-type">VARCHAR(255)</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card" v-loading="loading">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon size="32"><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statisticsData.createTime }}</div>
                <div class="stat-label">创建时间</div>
                <div class="stat-type">DATETIME</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细统计表格 -->
      <div class="detailed-stats">
        <el-card class="stats-table-card">
          <template #header>
            <div class="table-header">
              <span class="table-title">详细统计信息</span>
              <div class="header-filters">
                <el-select v-model="selectedTimeRange" placeholder="选择时间范围" @change="handleTimeRangeChange">
                  <el-option label="今日" value="today" />
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                  <el-option label="本年" value="year" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table
            v-loading="tableLoading"
            :data="detailedStats"
            stripe
            style="width: 100%"
            size="default"
          >
            <el-table-column prop="metric" label="统计指标" width="200">
              <template #default="{ row }">
                <div class="metric-cell">
                  <el-icon :style="{ color: row.color }">
                    <component :is="row.icon" />
                  </el-icon>
                  <span>{{ row.metric }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="数值" width="150">
              <template #default="{ row }">
                <span class="metric-value">{{ row.value.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="120">
              <template #default="{ row }">
                <el-tag :type="getTrendType(row.trend)" size="small">
                  <el-icon>
                    <component :is="getTrendIcon(row.trend)" />
                  </el-icon>
                  {{ row.trend }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="变化幅度" width="120">
              <template #default="{ row }">
                <span :class="getPercentageClass(row.percentage)">
                  {{ row.percentage }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="200" />
          </el-table>
        </el-card>
      </div>

      <!-- 说明文字 -->
      <div class="description">
        <p>销售渠道：点击菜单中的多渠道销售管理→销售渠道后，显示销售渠道。</p>
        <p>页面响应后，会向用户展示销售渠道的表格。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Download, 
  Shop, 
  Grid, 
  Calendar,
  TrendCharts,
  User,
  Goods,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'

const loading = ref(false)
const tableLoading = ref(false)
const selectedTimeRange = ref('month')

// 统计数据
const statisticsData = reactive({
  channelId: 43462,
  channelName: 42976,
  createTime: 20675
})

// 详细统计数据
const detailedStats = ref([
  {
    metric: '总订单数',
    value: 1235,
    trend: '上升',
    percentage: 12.5,
    description: '较上月增长12.5%，主要来自移动端渠道',
    icon: 'Shop',
    color: '#409EFF'
  },
  {
    metric: '活跃渠道数',
    value: 48,
    trend: '上升',
    percentage: 8.3,
    description: '新增3个合作渠道，渠道覆盖面进一步扩大',
    icon: 'Grid',
    color: '#67C23A'
  },
  {
    metric: '总销售额',
    value: 2847291,
    trend: '上升',
    percentage: 15.8,
    description: '销售额持续增长，品牌影响力提升',
    icon: 'TrendCharts',
    color: '#E6A23C'
  },
  {
    metric: '新增用户',
    value: 892,
    trend: '下降',
    percentage: -3.2,
    description: '用户增长略有放缓，需加强推广力度',
    icon: 'User',
    color: '#F56C6C'
  },
  {
    metric: '商品SKU数',
    value: 1847,
    trend: '稳定',
    percentage: 0.8,
    description: '商品品类保持稳定增长',
    icon: 'Goods',
    color: '#909399'
  }
])

// 获取趋势类型
const getTrendType = (trend: string) => {
  const trendMap: Record<string, string> = {
    '上升': 'success',
    '下降': 'danger',
    '稳定': 'info'
  }
  return trendMap[trend] || 'info'
}

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  const iconMap: Record<string, string> = {
    '上升': 'ArrowUp',
    '下降': 'ArrowDown',
    '稳定': 'Minus'
  }
  return iconMap[trend] || 'Minus'
}

// 获取百分比样式类
const getPercentageClass = (percentage: number) => {
  if (percentage > 0) return 'positive-change'
  if (percentage < 0) return 'negative-change'
  return 'neutral-change'
}

// 刷新统计数据
const refreshStatistics = async () => {
  try {
    loading.value = true
    tableLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以调用实际的API
    // const response = await salesStatisticsAPI.getStatistics()
    // 更新statisticsData和detailedStats...
    
    ElMessage.success('统计数据刷新成功')
  } catch (error) {
    console.error('刷新统计数据失败:', error)
    ElMessage.error('刷新统计数据失败')
  } finally {
    loading.value = false
    tableLoading.value = false
  }
}

// 导出数据
const exportData = () => {
  try {
    // 模拟导出功能
    const csvContent = generateCSV()
    downloadCSV(csvContent, 'sales_statistics.csv')
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

// 生成CSV内容
const generateCSV = () => {
  const headers = ['统计指标', '数值', '趋势', '变化幅度', '说明']
  const rows = detailedStats.value.map(stat => [
    stat.metric,
    stat.value,
    stat.trend,
    `${stat.percentage}%`,
    stat.description
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
  
  return csvContent
}

// 下载CSV文件
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 时间范围改变处理
const handleTimeRangeChange = (value: string) => {
  console.log('时间范围改变:', value)
  refreshStatistics()
}

onMounted(() => {
  refreshStatistics()
})
</script>

<style scoped>
.sales-statistics {
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

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-type {
  font-size: 12px;
  color: #999;
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.detailed-stats {
  margin-bottom: 20px;
}

.stats-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-filters {
  display: flex;
  gap: 12px;
}

.metric-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-value {
  font-weight: 600;
  color: #333;
}

.positive-change {
  color: #67C23A;
  font-weight: 600;
}

.negative-change {
  color: #F56C6C;
  font-weight: 600;
}

.neutral-change {
  color: #909399;
  font-weight: 600;
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

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafbfc;
}

:deep(.el-tag) {
  border-radius: 12px;
  padding: 4px 8px;
}

:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style> 