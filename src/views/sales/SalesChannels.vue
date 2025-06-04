<template>
  <div class="sales-channels">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">销售渠道管理</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加渠道
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="渠道名称">
            <el-input
              v-model="searchForm.channelName"
              placeholder="请输入渠道名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="平台类型">
            <el-select
              v-model="searchForm.platformType"
              placeholder="请选择平台类型"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="电商平台" value="电商平台" />
              <el-option label="社交平台" value="社交平台" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.channelStatus"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="激活" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchChannels">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="filteredChannels"
        stripe
        style="width: 100%"
        size="default"
      >
        <el-table-column prop="channel_id" label="渠道ID" width="80" />
        <el-table-column prop="channel_name" label="渠道名称" width="120" />
        <el-table-column prop="platform_type" label="平台类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getPlatformTypeTagType(row.platform_type)">
              {{ row.platform_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="api_address" label="API地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="commission_rate" label="佣金率" width="100">
          <template #default="{ row }">
            <span>{{ row.commission_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="channel_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.channel_status)">
              {{ getStatusText(row.channel_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editChannel(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              :type="row.channel_status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="toggleChannelStatus(row)"
            >
              {{ row.channel_status === 'active' ? '暂停' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteChannel(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button type="info" size="small" @click="testConnection(row)">
              <el-icon><Connection /></el-icon>
              测试连接
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
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
      @close="resetChannelForm"
    >
      <el-form
        ref="channelFormRef"
        :model="channelForm"
        :rules="channelRules"
        label-width="100px"
      >
        <el-form-item label="渠道名称" prop="channel_name">
          <el-input v-model="channelForm.channel_name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="平台类型" prop="platform_type">
          <el-select v-model="channelForm.platform_type" placeholder="请选择平台类型">
            <el-option label="电商平台" value="电商平台" />
            <el-option label="社交平台" value="社交平台" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="API地址" prop="api_address">
          <el-input v-model="channelForm.api_address" placeholder="请输入API地址" />
        </el-form-item>
        <el-form-item label="佣金率" prop="commission_rate">
          <el-input-number
            v-model="channelForm.commission_rate"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="请输入佣金率"
          />
          <span style="margin-left: 8px;">%</span>
        </el-form-item>
        <el-form-item label="状态" prop="channel_status">
          <el-radio-group v-model="channelForm.channel_status">
            <el-radio label="active">激活</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="channelForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入渠道描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChannel">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Connection } from '@element-plus/icons-vue'
import { salesChannelsAPI } from '@/api'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const channelFormRef = ref()

// 搜索表单
const searchForm = reactive({
  channelName: '',
  platformType: '',
  channelStatus: ''
})

// 渠道表单
const channelForm = reactive({
  channel_id: '',
  channel_name: '',
  platform_type: '',
  api_address: '',
  commission_rate: 0,
  channel_status: 'active',
  description: ''
})

// 表单验证规则
const channelRules = {
  channel_id: [
    { required: true, message: '请输入渠道ID', trigger: 'blur' }
  ],
  channel_name: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' }
  ],
  platform_type: [
    { required: true, message: '请选择平台类型', trigger: 'change' }
  ],
  api_address: [
    { required: true, message: '请输入API地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
  ],
  commission_rate: [
    { required: true, message: '请输入佣金率', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '佣金率应在0-100之间', trigger: 'blur' }
  ]
}

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const channels = ref<any[]>([])

// 计算属性
const dialogTitle = computed(() => {
  return channelForm.channel_id ? '编辑渠道' : '添加渠道'
})

// 过滤后的渠道列表
const filteredChannels = computed(() => {
  return channels.value.filter(channel => {
    return (!searchForm.channelName || channel.channel_name.includes(searchForm.channelName)) &&
           (!searchForm.platformType || channel.platform_type === searchForm.platformType) &&
           (!searchForm.channelStatus || channel.channel_status === searchForm.channelStatus)
  })
})

// 获取渠道列表
const fetchChannels = async () => {
  try {
    loading.value = true
    const response = await salesChannelsAPI.getChannels({
      skip: (pagination.currentPage - 1) * pagination.pageSize,
      limit: pagination.pageSize
    })
    
    channels.value = response.data || []
    // 注意：后端可能需要返回总数，这里暂时使用数据长度
    pagination.total = channels.value.length
  } catch (error) {
    console.error('获取渠道列表失败:', error)
    ElMessage.error('获取渠道列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索渠道
const searchChannels = () => {
  // 重置到第一页
  pagination.currentPage = 1
  fetchChannels()
}

// 重置搜索
const resetSearch = () => {
  searchForm.channelName = ''
  searchForm.platformType = ''
  searchForm.channelStatus = ''
  fetchChannels()
}

// 显示添加对话框
const showAddDialog = () => {
  resetChannelForm()
  dialogVisible.value = true
}

// 编辑渠道
const editChannel = (channel: any) => {
  Object.assign(channelForm, {
    channel_id: channel.channel_id,
    channel_name: channel.channel_name,
    platform_type: channel.platform_type,
    api_address: channel.api_address,
    commission_rate: channel.commission_rate,
    channel_status: channel.channel_status,
    description: channel.description || ''
  })
  dialogVisible.value = true
}

// 保存渠道
const saveChannel = async () => {
  try {
    const valid = await channelFormRef.value?.validate()
    if (!valid) return

    loading.value = true
    
    if (channelForm.channel_id && channels.value.find(c => c.channel_id === channelForm.channel_id)) {
      // 更新现有渠道
      await salesChannelsAPI.updateChannel(parseInt(channelForm.channel_id), {
        channel_name: channelForm.channel_name,
        platform_type: channelForm.platform_type,
        api_address: channelForm.api_address,
        commission_rate: channelForm.commission_rate,
        channel_status: channelForm.channel_status,
        description: channelForm.description
      })
      ElMessage.success('渠道更新成功')
    } else {
      // 创建新渠道
      await salesChannelsAPI.createChannel({
        channel_id: channelForm.channel_id,
        channel_name: channelForm.channel_name,
        platform_type: channelForm.platform_type,
        api_address: channelForm.api_address,
        commission_rate: channelForm.commission_rate,
        channel_status: channelForm.channel_status,
        description: channelForm.description
      })
      ElMessage.success('渠道创建成功')
    }
    
    dialogVisible.value = false
    fetchChannels()
  } catch (error: any) {
    console.error('保存渠道失败:', error)
    ElMessage.error(error.response?.data?.detail || '保存渠道失败')
  } finally {
    loading.value = false
  }
}

// 删除渠道
const deleteChannel = (channel: any) => {
  ElMessageBox.confirm(
    `确定要删除渠道 "${channel.channel_name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await salesChannelsAPI.deleteChannel(channel.channel_id)
      ElMessage.success('删除成功')
      fetchChannels()
    } catch (error: any) {
      console.error('删除渠道失败:', error)
      ElMessage.error(error.response?.data?.detail || '删除渠道失败')
    }
  })
}

// 切换渠道状态
const toggleChannelStatus = async (channel: any) => {
  try {
    const newStatus = channel.channel_status === 'active' ? 'inactive' : 'active'
    await salesChannelsAPI.updateChannel(parseInt(channel.channel_id), {
      channel_status: newStatus
    })
    
    channel.channel_status = newStatus
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 测试连接
const testConnection = async (channel: any) => {
  try {
    // 这里应该调用后端的连接测试API
    ElMessage.info('连接测试功能开发中...')
  } catch (error) {
    ElMessage.error('连接测试失败')
  }
}

// 重置表单
const resetChannelForm = () => {
  Object.assign(channelForm, {
    channel_id: '',
    channel_name: '',
    platform_type: '',
    api_address: '',
    commission_rate: 0,
    channel_status: 'active',
    description: ''
  })
  channelFormRef.value?.clearValidate()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchChannels()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchChannels()
}

// 工具方法
const getPlatformTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    '电商平台': 'success',
    '市场平台': 'info', 
    '社交平台': 'warning',
    '直销': 'danger'
  }
  return typeMap[type] || 'info'
}

const getStatusTagType = (status: string): string => {
  return status === 'active' ? 'success' : 'danger'
}

const getStatusText = (status: string): string => {
  return status === 'active' ? '激活' : '禁用'
}

// 生命周期
onMounted(() => {
  fetchChannels()
})
</script>

<style scoped>
.sales-channels {
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

.dialog-footer {
  text-align: right;
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