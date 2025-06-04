<template>
  <div class="products page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">产品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增产品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="产品名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入产品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in categoryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
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
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
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
        <el-table-column prop="product_id" label="产品ID" width="80" />
        <el-table-column prop="product_name" label="产品名称" min-width="180" />
        <el-table-column prop="category_id" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category_id)">
              {{ getCategoryText(row.category_id) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="unit_price" label="价格" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.unit_price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="handleEdit(row)">
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
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="SKU" prop="sku">
          <el-input v-model="form.sku" placeholder="请输入产品SKU" />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类">
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="unit_price">
          <el-input-number
            v-model="form.unit_price"
            :min="0"
            :precision="2"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
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
import { productsAPI } from '@/api'

interface Product {
  product_id: number
  product_name: string
  sku: string
  description: string
  unit_price: number
  category_id: number
  status: string
  created_at: string
  updated_at?: string
}

interface APIResponse<T> {
  data: T[]
  total: number
  message?: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增产品')
const formRef = ref<FormInstance>()

// 分类选项
const categoryOptions = [
  { label: '电子产品', value: 1 },
  { label: '服装', value: 2 },
  { label: '家居', value: 3 },
  { label: '食品', value: 4 }
]

// 状态选项
const statusOptions = [
  { label: '上架', value: 'active' },
  { label: '下架', value: 'inactive' }
]

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const form = reactive({
  product_id: 0,
  product_name: '',
  sku: '',
  description: '',
  unit_price: 0,
  category_id: 0,
  status: 'inactive'
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref<Product[]>([])

const formRules = {
  product_name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  sku: [
    { required: true, message: '请输入产品SKU', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  unit_price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' }
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

const getCategoryType = (category_id: number) => {
  const typeMap: Record<number, string> = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[category_id] || 'info'
}

const getCategoryText = (category_id: number) => {
  const textMap: Record<number, string> = {
    1: '电子产品',
    2: '服装',
    3: '家居',
    4: '食品'
  }
  return textMap[category_id] || `分类${category_id}`
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '上架',
    'inactive': '下架'
  }
  return textMap[status] || status
}

const handleSearch = () => {
  pagination.page = 1
  fetchProducts()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增产品'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  dialogTitle.value = '编辑产品'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(`确定要删除产品"${row.product_name}"吗？`, '提示', {
      type: 'warning'
    })
    
    await productsAPI.deleteProduct(row.product_id)
      ElMessage.success('删除成功')
    fetchProducts() // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除产品失败:', error)
      ElMessage.error(error.response?.data?.detail || '删除产品失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    if (form.product_id) {
      // 编辑
      await productsAPI.updateProduct(form.product_id, {
        product_name: form.product_name,
        sku: form.sku,
        description: form.description,
        unit_price: form.unit_price,
        category_id: form.category_id,
        status: form.status
      })
      ElMessage.success('编辑成功')
    } else {
      // 新增
      await productsAPI.createProduct({
        product_name: form.product_name,
        sku: form.sku,
        description: form.description,
        unit_price: form.unit_price,
        category_id: form.category_id,
        status: form.status
      })
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchProducts() // 刷新列表
  } catch (error: any) {
    console.error('保存产品失败:', error)
    ElMessage.error(error.response?.data?.detail || '保存产品失败')
  } finally {
    loading.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    product_id: 0,
    product_name: '',
    sku: '',
    description: '',
    unit_price: 0,
    category_id: 0,
    status: 'inactive'
  })
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchProducts()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchProducts()
}

const fetchProducts = async () => {
  try {
    loading.value = true
    const params: any = {
      skip: (pagination.page - 1) * pagination.size,
      limit: pagination.size
    }
    
    // 只有当参数有值时才添加到请求参数中
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.category) params.category = searchForm.category
    if (searchForm.status) params.status = searchForm.status
    
    const response = await productsAPI.getProducts(params)
    
    const result = response.data as APIResponse<Product>
    tableData.value = result.data || []
    pagination.total = result.total || tableData.value.length
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products {
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

.price {
  color: #E74C3C;
  font-weight: 600;
}

.low-stock {
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