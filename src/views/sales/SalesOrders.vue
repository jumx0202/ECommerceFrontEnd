<template>
  <div class="sales-orders">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">销售订单管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input
              v-model="searchForm.orderId"
              placeholder="请输入订单号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="渠道">
            <el-select
              v-model="searchForm.channel"
              placeholder="请选择渠道"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="淘宝" value="淘宝" />
              <el-option label="京东" value="京东" />
              <el-option label="拼多多" value="拼多多" />
              <el-option label="天猫" value="天猫" />
              <el-option label="抖音" value="抖音" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
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
        <el-table-column prop="order_id" label="订单号" width="160" />
        <el-table-column prop="customer_user_id" label="用户ID" width="120" />
        <el-table-column prop="channel_name" label="渠道" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel_name || '其他')">
              {{ row.channel_name || `渠道${row.channel_id}` }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ Number(row.order_amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_status" label="订单状态" width="100">
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
        <el-table-column prop="updated_at" label="更新时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleCancel(row)">
              取消
            </el-button>
            <el-button type="danger" size="small" plain @click="handleDelete(row)">
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.order_id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.customer_user_id }}</el-descriptions-item>
          <el-descriptions-item label="渠道">{{ currentOrder.channel_name || `渠道${currentOrder.channel_id}` }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ Number(currentOrder.order_amount).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.order_status)">
              {{ getStatusText(currentOrder.order_status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.order_date) }}</el-descriptions-item>
        </el-descriptions>
        
        <h3 style="margin: 20px 0;">订单商品</h3>
        <el-table :data="currentOrder.order_items" border>
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="unit_price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ Number(row.unit_price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="total_price" label="小计" width="100">
            <template #default="{ row }">
              ¥{{ Number(row.total_price).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 编辑订单对话框 -->
    <el-dialog
      v-model="editVisible"
      title="编辑订单"
      width="600px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="editForm.order_id" disabled />
        </el-form-item>
        <el-form-item label="客户ID">
          <el-input v-model="editForm.customer_user_id" />
        </el-form-item>
        <el-form-item label="渠道ID">
          <el-input-number v-model="editForm.channel_id" :min="1" />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="editForm.order_amount" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="editForm.order_status" placeholder="请选择状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="loading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { salesOrdersAPI } from '@/api'

interface OrderItem {
  order_item_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  order_id: string
  customer_user_id: string
  channel_id: number
  channel_name?: string
  order_amount: number
  order_status: string
  order_date: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

const loading = ref(false)
const detailVisible = ref(false)
const editVisible = ref(false)
const currentOrder = ref<Order | null>(null)

const searchForm = reactive({
  orderId: '',
  channel: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 编辑表单
const editForm = reactive({
  order_id: '',
  customer_user_id: '',
  channel_id: 0,
  order_amount: 0,
  order_status: ''
})

// 移除硬编码数据，改为从API获取
const tableData = ref<Order[]>([])

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await salesOrdersAPI.getOrders({
      skip: (pagination.page - 1) * pagination.size,
      limit: pagination.size
    })
    
    tableData.value = response.data || []
    // 如果后端返回总数，使用后端的总数；否则使用当前数据长度
    pagination.total = response.total || tableData.value.length
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取订单详情（包含订单项）
const fetchOrderDetail = async (orderId: string) => {
  try {
    loading.value = true
    const response = await salesOrdersAPI.getOrder(orderId)
    return response.data
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    return null
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
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

const getChannelType = (channel: string) => {
  const typeMap: Record<string, string> = {
    '淘宝': 'danger',
    '京东': 'primary',
    '拼多多': 'warning',
    '天猫': 'danger',
    '抖音': 'info',
    '其他': 'info'
  }
  return typeMap[channel] || 'info'
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '待支付': 'info',
    '已支付': 'primary', 
    '已发货': 'warning',
    '已完成': 'success',
    '已取消': 'danger',
    'pending': 'info',
    'paid': 'primary',
    'shipped': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    '待支付': '待支付',
    '已支付': '已支付',
    '已发货': '已发货', 
    '已完成': '已完成',
    '已取消': '已取消',
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrders()
}

const handleReset = () => {
  searchForm.orderId = ''
  searchForm.channel = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('新增订单功能开发中...')
}

const handleView = async (row: Order) => {
  // 获取完整的订单详情（包含订单项）
  const orderDetail = await fetchOrderDetail(row.order_id)
  if (orderDetail) {
    currentOrder.value = orderDetail
  detailVisible.value = true
  }
}

const handleEdit = (row: Order) => {
  // 复制订单数据到编辑表单
  Object.assign(editForm, {
    order_id: row.order_id,
    customer_user_id: row.customer_user_id,
    channel_id: row.channel_id,
    order_amount: row.order_amount,
    order_status: row.order_status
  })
  editVisible.value = true
}

// 保存编辑的订单
const saveEdit = async () => {
  try {
    loading.value = true
    await salesOrdersAPI.updateOrder(editForm.order_id, {
      customer_user_id: editForm.customer_user_id,
      channel_id: editForm.channel_id,
      order_amount: editForm.order_amount,
      order_status: editForm.order_status
    })
    
    ElMessage.success('订单更新成功')
    editVisible.value = false
    fetchOrders() // 刷新列表
  } catch (error: any) {
    console.error('更新订单失败:', error)
    ElMessage.error(error.response?.data?.detail || '更新订单失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = async (row: Order) => {
  if (row.order_status === 'cancelled' || row.order_status === '已取消') {
    ElMessage.warning('订单已取消')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要取消订单"${row.order_id}"吗？`, '提示', {
      type: 'warning'
    })
    
    // 调用API更新订单状态为已取消
    await salesOrdersAPI.updateOrder(row.order_id, {
      order_status: 'cancelled'
    })
    
    ElMessage.success('订单取消成功')
    fetchOrders() // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') { // 用户点击取消按钮
      console.error('取消订单失败:', error)
      ElMessage.error(error.response?.data?.detail || '取消订单失败')
    }
  }
}

// 删除订单
const handleDelete = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单"${row.order_id}"吗？此操作不可恢复！`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    
    await salesOrdersAPI.deleteOrder(row.order_id)
    ElMessage.success('订单删除成功')
    fetchOrders() // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') { // 用户点击取消按钮
      console.error('删除订单失败:', error)
      ElMessage.error(error.response?.data?.detail || '删除订单失败')
    }
  }
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchOrders()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchOrders()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.sales-orders {
  padding: 0;
  width: 100%;
  height: 100%;
}

.page-card {
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
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

.order-detail {
  padding: 10px 0;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

:deep(.el-card__body) {
  padding: 24px;
  width: 100%;
}

/* 确保表格操作按钮紧凑排列 */
:deep(.el-table .el-button) {
  margin-right: 8px;
  margin-bottom: 4px;
}

:deep(.el-table .el-button:last-child) {
  margin-right: 0;
}
</style> 