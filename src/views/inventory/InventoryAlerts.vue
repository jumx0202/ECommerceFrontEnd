<template>
  <div class="inventory-alerts page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">库存预警记录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="预警ID">
            <el-input
              v-model="searchForm.alertId"
              placeholder="请输入预警ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="库存ID">
            <el-input-number
              v-model="searchForm.inventoryId"
              placeholder="0"
              :min="0"
              controls-position="right"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="预警时间">
            <el-date-picker
              v-model="searchForm.alertTime"
              type="date"
              placeholder="请选择预警时间"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="预警状态">
            <el-select
              v-model="searchForm.alertStatus"
              placeholder="请输入预警状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="已发送" value="已发送" />
              <el-option label="未发送" value="未发送" />
              <el-option label="处理中" value="处理中" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理人">
            <el-input
              v-model="searchForm.handler"
              placeholder="请输入处理人"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
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
        <el-table-column prop="alert_id" label="预警ID" width="100" />
        <el-table-column prop="inventory_id" label="库存ID" width="100" />
        <el-table-column prop="alert_time" label="预警时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.alert_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="alert_status" label="预警状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.alert_status)">
              {{ row.alert_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="预警ID" prop="alert_id">
          <el-input v-model="form.alert_id" placeholder="请输入预警ID" :disabled="!!form.alert_id" />
        </el-form-item>
        <el-form-item label="库存ID" prop="inventory_id">
          <el-input-number
            v-model="form.inventory_id"
            :min="1"
            placeholder="请输入库存ID"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预警时间" prop="alert_time">
          <el-date-picker
            v-model="form.alert_time"
            type="datetime"
            placeholder="请选择预警时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预警状态" prop="alert_status">
          <el-select v-model="form.alert_status" placeholder="请选择预警状态" style="width: 100%">
            <el-option label="已发送" value="已发送" />
            <el-option label="未发送" value="未发送" />
            <el-option label="处理中" value="处理中" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-input v-model="form.handler" placeholder="请输入处理人" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { inventoryAPI } from '@/api'

interface AlertItem {
  alert_id: number
  inventory_id: number
  alert_time: string
  alert_status: string
  handler: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增预警记录')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  alertId: '',
  inventoryId: 0,
  alertTime: '',
  alertStatus: '',
  handler: ''
})

const form = reactive({
  alert_id: 0,
  inventory_id: 0,
  alert_time: '' as string | Date,
  alert_status: '',
  handler: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 使用模拟数据，实际应从API获取
const tableData = ref<AlertItem[]>([
  {
    alert_id: 1,
    inventory_id: 1,
    alert_time: '2023-10-01 14:00:00',
    alert_status: '已发送',
    handler: '张三'
  },
  {
    alert_id: 2,
    inventory_id: 2,
    alert_time: '2023-10-02 15:30:00',
    alert_status: '未发送',
    handler: '李四'
  },
  {
    alert_id: 3,
    inventory_id: 3,
    alert_time: '2023-10-03 16:00:00',
    alert_status: '处理中',
    handler: '王五'
  }
])

const formRules = {
  alert_id: [
    { required: true, message: '请输入预警ID', trigger: 'blur' }
  ],
  inventory_id: [
    { required: true, message: '请输入库存ID', trigger: 'blur' }
  ],
  alert_time: [
    { required: true, message: '请选择预警时间', trigger: 'change' }
  ],
  alert_status: [
    { required: true, message: '请选择预警状态', trigger: 'change' }
  ],
  handler: [
    { required: true, message: '请输入处理人', trigger: 'blur' }
  ]
}

const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return ''
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return dateTime
  }
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '已发送': 'success',
    '未发送': 'danger',
    '处理中': 'warning'
  }
  return typeMap[status] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.alertId = ''
  searchForm.inventoryId = 0
  searchForm.alertTime = ''
  searchForm.alertStatus = ''
  searchForm.handler = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增预警记录'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: AlertItem) => {
  dialogTitle.value = '编辑预警记录'
  Object.assign(form, {
    ...row,
    alert_time: row.alert_time ? new Date(row.alert_time) : ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row: AlertItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除预警记录"${row.alert_id}"吗？`, '提示', {
      type: 'warning'
    })
    
    // 这里应该调用API删除
    const index = tableData.value.findIndex(item => item.alert_id === row.alert_id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除预警记录失败:', error)
      ElMessage.error('删除预警记录失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const formData = {
      ...form,
      alert_time: form.alert_time instanceof Date 
        ? form.alert_time.toISOString().slice(0, 19).replace('T', ' ')
        : form.alert_time
    }
    
    if (form.alert_id && tableData.value.find(item => item.alert_id === form.alert_id)) {
      // 编辑
      const index = tableData.value.findIndex(item => item.alert_id === form.alert_id)
      if (index > -1) {
        tableData.value[index] = { ...formData } as AlertItem
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      const newId = Math.max(...tableData.value.map(item => item.alert_id), 0) + 1
      tableData.value.push({
        ...formData,
        alert_id: newId
      } as AlertItem)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
  } catch (error: any) {
    console.error('保存预警记录失败:', error)
    ElMessage.error('保存预警记录失败')
  } finally {
    loading.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    alert_id: 0,
    inventory_id: 0,
    alert_time: '',
    alert_status: '',
    handler: ''
  })
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
.inventory-alerts {
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

.dialog-footer {
  text-align: right;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style> 