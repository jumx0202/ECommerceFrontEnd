<template>
  <div class="inventory page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">库存管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            库存调整
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="产品名称">
            <el-input
              v-model="searchForm.productName"
              placeholder="请输入产品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="库存状态">
            <el-select
              v-model="searchForm.stockStatus"
              placeholder="请选择库存状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="正常" value="normal" />
              <el-option label="预警" value="warning" />
              <el-option label="缺货" value="out" />
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
        <el-table-column prop="inventory_id" label="库存ID" width="100" />
        <el-table-column prop="product_name" label="产品名称" min-width="180" />
        <el-table-column prop="current_stock_quantity" label="当前库存" width="120">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.current_stock_quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alert_threshold" label="预警阈值" width="120" />
        <el-table-column prop="stock_status" label="库存状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStockStatusType(row)">
              {{ getStockStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_updated_at" label="最后更新" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.last_updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleAdjust(row)">
              库存调整
            </el-button>
            <el-button type="warning" size="small" @click="handleEditWarning(row)">
              设置预警
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

    <!-- 库存调整对话框 -->
    <el-dialog
      v-model="adjustVisible"
      title="库存调整"
      width="500px"
    >
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="100px"
      >
        <el-form-item label="产品名称">
          <el-input v-model="currentItem.product_name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="currentItem.current_stock_quantity" disabled />
        </el-form-item>
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="adjustForm.type">
            <el-radio label="in">入库</el-radio>
            <el-radio label="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="quantity">
          <el-input-number
            v-model="adjustForm.quantity"
            :min="1"
            placeholder="请输入调整数量"
          />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input
            v-model="adjustForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="adjustVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitAdjust">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { inventoryAPI, productsAPI } from '@/api'

interface InventoryItem {
  inventory_id: number
  product_id: number
  product_name?: string
  current_stock_quantity: number
  alert_threshold: number
  last_updated_at: string
}

const loading = ref(false)
const adjustVisible = ref(false)
const adjustFormRef = ref<FormInstance>()

const searchForm = reactive({
  productName: '',
  stockStatus: ''
})

const currentItem = ref<InventoryItem>({
  inventory_id: 0,
  product_id: 0,
  product_name: '',
  current_stock_quantity: 0,
  alert_threshold: 0,
  last_updated_at: ''
})

const adjustForm = reactive({
  type: 'in',
  quantity: 1,
  reason: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref<InventoryItem[]>([])

const adjustRules = {
  type: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
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

const getStockClass = (row: InventoryItem) => {
  if (row.current_stock_quantity === 0) return 'out-of-stock'
  if (row.current_stock_quantity <= row.alert_threshold) return 'low-stock'
  return 'normal-stock'
}

const getStockStatusType = (row: InventoryItem) => {
  if (row.current_stock_quantity === 0) return 'danger'
  if (row.current_stock_quantity <= row.alert_threshold) return 'warning'
  return 'success'
}

const getStockStatusText = (row: InventoryItem) => {
  if (row.current_stock_quantity === 0) return '缺货'
  if (row.current_stock_quantity <= row.alert_threshold) return '预警'
  return '正常'
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.productName = ''
  searchForm.stockStatus = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('库存批量调整功能开发中...')
}

const handleAdjust = (row: InventoryItem) => {
  currentItem.value = { ...row }
  adjustForm.type = 'in'
  adjustForm.quantity = 1
  adjustForm.reason = ''
  adjustVisible.value = true
}

const handleEditWarning = (row: InventoryItem) => {
  ElMessage.info('预警设置功能开发中...')
}

const handleSubmitAdjust = async () => {
  if (!adjustFormRef.value) return
  
  try {
    const valid = await adjustFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 计算新的库存数量
    let newQuantity = currentItem.value.current_stock_quantity
    if (adjustForm.type === 'in') {
      newQuantity += adjustForm.quantity
    } else {
      newQuantity = Math.max(0, newQuantity - adjustForm.quantity)
    }
    
    // 调用API更新库存
    await inventoryAPI.updateInventory(currentItem.value.inventory_id, {
      current_stock_quantity: newQuantity
    })
    
    ElMessage.success('库存调整成功')
    adjustVisible.value = false
    loadData() // 刷新数据
  } catch (error: any) {
    console.error('库存调整失败:', error)
    ElMessage.error(error.response?.data?.detail || '库存调整失败')
  } finally {
    loading.value = false
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

const loadData = async () => {
  try {
    loading.value = true
    
    // 获取库存数据
    const inventoryResponse = await inventoryAPI.getInventory({
      skip: (pagination.page - 1) * pagination.size,
      limit: pagination.size
    })
    
    // 获取产品数据以获取产品名称
    const productsResponse = await productsAPI.getProducts()
    
    // 确保我们正确获取产品数据数组
    const products = productsResponse.data?.data || []
    
    // 创建产品ID到产品名称的映射
    const productMap = new Map()
    products.forEach((product: any) => {
      productMap.set(product.product_id, product.product_name)
    })
    
    // 确保我们正确获取库存数据数组
    const inventoryData = inventoryResponse.data?.data || []
    
    // 合并库存和产品信息
    tableData.value = inventoryData.map((item: any) => ({
      ...item,
      product_name: productMap.get(item.product_id) || `产品${item.product_id}`
    }))
    
    // 更新分页总数
    pagination.total = inventoryResponse.data?.total || inventoryData.length
  } catch (error) {
    console.error('获取库存数据失败:', error)
    ElMessage.error('获取库存数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.inventory {
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

.normal-stock {
  color: #67C23A;
  font-weight: 600;
}

.low-stock {
  color: #E6A23C;
  font-weight: 600;
}

.out-of-stock {
  color: #F56C6C;
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