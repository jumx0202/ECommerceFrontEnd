<template>
  <div class="suppliers page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">供应商管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增供应商
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="供应商名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入供应商名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="合作状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
              <el-option label="待审核" value="pending" />
              <el-option label="已终止" value="terminated" />
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
        <el-table-column prop="id" label="供应商ID" width="100" />
        <el-table-column prop="name" label="供应商名称" min-width="180" />
        <el-table-column prop="contact" label="联系方式" min-width="150" />
        <el-table-column prop="status" label="合作状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
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
import { ElMessage, ElMessageBox } from 'element-plus'

interface Supplier {
  id: string
  name: string
  contact: string
  status: string
  createTime: string
}

const loading = ref(false)

const searchForm = reactive({
  name: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref<Supplier[]>([
  {
    id: 'SUP001',
    name: '供应商甲',
    contact: '13800000001',
    status: 'active',
    createTime: '2023-01-15 10:30:00'
  },
  {
    id: 'SUP002',
    name: '供应商乙',
    contact: '13900000002',
    status: 'pending',
    createTime: '2023-02-20 14:20:00'
  },
  {
    id: 'SUP003',
    name: '供应商丙',
    contact: '13600000003',
    status: 'terminated',
    createTime: '2023-03-10 09:15:00'
  }
])

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'pending': 'warning',
    'terminated': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '正常',
    'pending': '待审核',
    'terminated': '已终止'
  }
  return textMap[status] || status
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('新增供应商功能开发中...')
}

const handleEdit = (row: Supplier) => {
  ElMessage.info('编辑供应商功能开发中...')
}

const handleView = (row: Supplier) => {
  ElMessage.info('查看供应商详情功能开发中...')
}

const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm(`确定要删除供应商"${row.name}"吗？`, '提示', {
      type: 'warning'
    })
    
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      pagination.total--
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
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
.suppliers {
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