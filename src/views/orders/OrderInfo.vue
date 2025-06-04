<template>
  <div class="order-info page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">订单信息</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单ID">
            <el-input
              v-model="searchForm.orderId"
              placeholder="请输入订单ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请输入订单状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="待支付" value="待支付" />
              <el-option label="已支付" value="已支付" />
              <el-option label="已发货" value="已发货" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.createTime"
              type="date"
              placeholder="请输入创建时间"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="渠道ID">
            <el-input
              v-model="searchForm.channelId"
              placeholder="请输入渠道ID"
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
        <el-table-column prop="order_id" label="订单ID" width="120" />
        <el-table-column prop="customer_user_id" label="用户ID" width="120" />
        <el-table-column prop="order_status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.order_status)">
              {{ getStatusText(row.order_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_date" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.order_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="channel_name" label="渠道ID" width="120">
          <template #default="{ row }">
            {{ row.channel_name || row.channel_id }}
          </template>
        </el-table-column>
        <el-table-column prop="order_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ Number(row.order_amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
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
        <el-form-item label="订单ID" prop="order_id">
          <el-input v-model="form.order_id" placeholder="请输入订单ID" :disabled="!!form.order_id" />
        </el-form-item>
        <el-form-item label="用户ID" prop="customer_user_id">
          <el-input v-model="form.customer_user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="渠道ID" prop="channel_id">
          <el-input-number
            v-model="form.channel_id"
            :min="1"
            placeholder="请输入渠道ID"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单金额" prop="order_amount">
          <el-input-number
            v-model="form.order_amount"
            :min="0"
            :precision="2"
            placeholder="请输入订单金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="order_status">
          <el-select v-model="form.order_status" placeholder="请选择订单状态" style="width: 100%">
            <el-option label="待支付" value="待支付" />
            <el-option label="已支付" value="已支付" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="order_date">
          <el-date-picker
            v-model="form.order_date"
            type="datetime"
            placeholder="请选择创建时间"
            style="width: 100%"
          />
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
import { salesOrdersAPI } from '@/api'

interface OrderItem {
  order_id: string
  customer_user_id: string
  channel_id: number
  channel_name?: string
  order_amount: number
  order_status: string
  order_date: string
  created_at: string
  updated_at: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增订单')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  orderId: '',
  userId: '',
  status: '',
  createTime: '',
  channelId: ''
})

const form = reactive({
  order_id: '',
  customer_user_id: '',
  channel_id: 0,
  order_amount: 0,
  order_status: '',
  order_date: '' as string | Date
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref<OrderItem[]>([])

const formRules = {
  order_id: [
    { required: true, message: '请输入订单ID', trigger: 'blur' }
  ],
  customer_user_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  channel_id: [
    { required: true, message: '请输入渠道ID', trigger: 'blur' }
  ],
  order_amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' }
  ],
  order_status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ],
  order_date: [
    { required: true, message: '请选择创建时间', trigger: 'change' }
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
    '待支付': 'info',
    '已支付': 'primary',
    '已发货': 'warning',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  return status
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.orderId = ''
  searchForm.userId = ''
  searchForm.status = ''
  searchForm.createTime = ''
  searchForm.channelId = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增订单'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: OrderItem) => {
  dialogTitle.value = '编辑订单'
  Object.assign(form, {
    ...row,
    order_date: row.order_date ? new Date(row.order_date) : ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row: OrderItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单"${row.order_id}"吗？`, '提示', {
      type: 'warning'
    })
    
    await salesOrdersAPI.deleteOrder(row.order_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error(error.response?.data?.detail || '删除订单失败')
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
      order_date: form.order_date instanceof Date 
        ? form.order_date.toISOString().slice(0, 19).replace('T', ' ')
        : form.order_date
    }
    
    if (form.order_id && tableData.value.find(item => item.order_id === form.order_id)) {
      // 编辑
      await salesOrdersAPI.updateOrder(form.order_id, formData)
      ElMessage.success('编辑成功')
    } else {
      // 新增
      await salesOrdersAPI.createOrder(formData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    console.error('保存订单失败:', error)
    ElMessage.error(error.response?.data?.detail || '保存订单失败')
  } finally {
    loading.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    order_id: '',
    customer_user_id: '',
    channel_id: 0,
    order_amount: 0,
    order_status: '',
    order_date: ''
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

const loadData = async () => {
  try {
    loading.value = true
    
    const response = await salesOrdersAPI.getOrders({
      skip: (pagination.page - 1) * pagination.size,
      limit: pagination.size
    })
    
    tableData.value = response.data || []
    pagination.total = tableData.value.length
  } catch (error) {
    console.error('获取订单数据失败:', error)
    ElMessage.error('获取订单数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.order-info {
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

.amount {
  color: #E74C3C;
  font-weight: 600;
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