<template>
  <div class="logistics page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">物流协同管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增物流
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="物流公司">
            <el-input
              v-model="searchForm.companyName"
              placeholder="请输入物流公司"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="配送状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="待发货" value="pending" />
              <el-option label="运输中" value="shipping" />
              <el-option label="已送达" value="delivered" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        size="default"
      >
        <el-table-column prop="id" label="物流ID" width="100" />
        <el-table-column prop="orderId" label="订单号" width="160" />
        <el-table-column prop="companyName" label="物流公司" min-width="120" />
        <el-table-column prop="trackingNumber" label="运单号" min-width="140" />
        <el-table-column prop="status" label="配送状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleTrack(row)">
              物流跟踪
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Logistics {
  id: string
  orderId: string
  companyName: string
  trackingNumber: string
  status: string
  createTime: string
}

const loading = ref(false)

const searchForm = reactive({
  companyName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref<Logistics[]>([
  {
    id: 'LOG001',
    orderId: 'ORD20231201001',
    companyName: '顺丰速运',
    trackingNumber: 'SF1234567890',
    status: 'delivered',
    createTime: '2023-12-01 10:30:00'
  },
  {
    id: 'LOG002',
    orderId: 'ORD20231201002',
    companyName: '圆通快递',
    trackingNumber: 'YT9876543210',
    status: 'shipping',
    createTime: '2023-12-01 11:15:00'
  },
  {
    id: 'LOG003',
    orderId: 'ORD20231201003',
    companyName: '中通快递',
    trackingNumber: 'ZT5555666677',
    status: 'pending',
    createTime: '2023-12-01 12:00:00'
  }
])

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'info',
    'shipping': 'warning',
    'delivered': 'success'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待发货',
    'shipping': '运输中',
    'delivered': '已送达'
  }
  return textMap[status] || status
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.companyName = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('新增物流功能开发中...')
}

const handleTrack = (row: Logistics) => {
  ElMessage.info('物流跟踪功能开发中...')
}

const handleEdit = (row: Logistics) => {
  ElMessage.info('编辑物流功能开发中...')
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

const loadData = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.logistics {
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

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style> 