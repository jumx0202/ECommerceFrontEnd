<template>
  <div class="order-sync-container">
    <!-- 页面标题 -->
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">订单同步处理</span>
      </template>
    </el-page-header>

    <!-- 功能模块标签页 -->
    <el-tabs v-model="activeTab" class="sync-tabs">
      <!-- 流程设计 -->
      <el-tab-pane label="流程设计" name="workflow">
        <div class="workflow-container">
          <el-card shadow="hover" class="workflow-card">
            <template #header>
              <div class="card-header">
                <span>可视化流程编辑器</span>
                <el-button type="primary" @click="saveWorkflow">保存流程</el-button>
              </div>
            </template>
            
            <div class="workflow-design">
              <div class="node-palette">
                <h4>节点组件</h4>
                <div class="node-list">
                  <div 
                    v-for="node in nodeTypes" 
                    :key="node.type"
                    class="node-item"
                    draggable="true"
                    @dragstart="onDragStart($event, node)"
                  >
                    <el-icon><component :is="node.icon" /></el-icon>
                    <span>{{ node.label }}</span>
                  </div>
                </div>
              </div>
              
              <div 
                class="workflow-canvas"
                @drop="onDrop"
                @dragover="onDragOver"
              >
                <div 
                  v-for="node in workflowNodes"
                  :key="node.id"
                  class="workflow-node"
                  :style="{ left: node.x + 'px', top: node.y + 'px' }"
                  @click="selectNode(node)"
                  :class="{ active: selectedNode?.id === node.id }"
                >
                  <el-icon><component :is="node.icon" /></el-icon>
                  <span>{{ node.label }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 通信配置 -->
      <el-tab-pane label="通信配置" name="communication">
        <div class="communication-container">
          <el-card shadow="hover">
            <template #header>
              <span>通信设置</span>
            </template>
            
            <el-form :model="communicationForm" label-width="120px">
              <el-form-item label="消息内容">
                <el-input
                  v-model="communicationForm.message"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入同步处理的消息内容"
                />
              </el-form-item>
              
              <el-form-item label="接收方">
                <el-select v-model="communicationForm.receiver" placeholder="选择接收方">
                  <el-option label="系统管理员" value="admin" />
                  <el-option label="渠道方" value="channel" />
                  <el-option label="供应商" value="supplier" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="sendMessage">发送消息</el-button>
                <el-button @click="resetCommunicationForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 消息历史 -->
            <el-divider content-position="left">消息历史</el-divider>
            <div class="message-history">
              <div 
                v-for="msg in messageHistory"
                :key="msg.id"
                class="message-item"
              >
                <div class="message-header">
                  <span class="sender">{{ msg.sender }}</span>
                  <span class="time">{{ formatTime(msg.time) }}</span>
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 订单信息 -->
      <el-tab-pane label="订单信息" name="orders">
        <div class="orders-container">
          <!-- 搜索栏 -->
          <el-card shadow="never" class="search-card">
            <el-form :model="orderSearchForm" :inline="true">
              <el-form-item label="订单ID">
                <el-input 
                  v-model="orderSearchForm.orderId" 
                  placeholder="请输入订单ID"
                  clearable
                />
              </el-form-item>
              <el-form-item label="渠道">
                <el-select v-model="orderSearchForm.channel" placeholder="选择渠道" clearable>
                  <el-option label="京东" value="JD" />
                  <el-option label="拼多多" value="PDD" />
                  <el-option label="淘宝" value="TB" />
                </el-select>
              </el-form-item>
              <el-form-item label="订单状态">
                <el-select v-model="orderSearchForm.status" placeholder="选择状态" clearable>
                  <el-option label="待支付" value="pending" />
                  <el-option label="已支付" value="paid" />
                  <el-option label="已发货" value="shipped" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchOrders">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetOrderSearch">重置</el-button>
                <el-button type="success" @click="showAddOrderDialog">
                  <el-icon><Plus /></el-icon>
                  添加订单
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 订单表格 -->
          <el-card shadow="hover" class="table-card">
            <el-table 
              :data="syncedOrders" 
              style="width: 100%"
              v-loading="ordersLoading"
            >
              <el-table-column prop="orderId" label="订单ID" width="150" />
              <el-table-column prop="userId" label="用户ID" width="120" />
              <el-table-column prop="channel" label="渠道" width="100">
                <template #default="scope">
                  <el-tag :type="getChannelTagType(scope.row.channel)">
                    {{ getChannelName(scope.row.channel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="订单状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusTagType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column prop="syncTime" label="同步时间" width="180" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="editOrder(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="warning" 
                    size="small" 
                    @click="resyncOrder(scope.row)"
                  >
                    重新同步
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="deleteOrder(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="orderPagination.currentPage"
                v-model:page-size="orderPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="orderPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleOrderSizeChange"
                @current-change="handleOrderCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 同步记录 -->
      <el-tab-pane label="同步记录" name="logs">
        <div class="logs-container">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>渠道订单同步记录</span>
                <el-button type="primary" @click="refreshLogs">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </template>

            <el-table 
              :data="syncLogs" 
              style="width: 100%"
              v-loading="logsLoading"
            >
              <el-table-column prop="logId" label="日志ID" width="100" />
              <el-table-column prop="orderId" label="订单ID" width="150" />
              <el-table-column prop="channel" label="渠道" width="100">
                <template #default="scope">
                  <el-tag :type="getChannelTagType(scope.row.channel)">
                    {{ getChannelName(scope.row.channel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="syncStatus" label="同步状态" width="120">
                <template #default="scope">
                  <el-tag :type="getSyncStatusTagType(scope.row.syncStatus)">
                    {{ getSyncStatusText(scope.row.syncStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="syncTime" label="同步时间" width="180" />
              <el-table-column prop="message" label="消息" show-overflow-tooltip />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="viewLogDetail(scope.row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="logPagination.currentPage"
                v-model:page-size="logPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="logPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleLogSizeChange"
                @current-change="handleLogCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加/编辑订单对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      :title="orderDialogTitle"
      width="500px"
    >
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="100px">
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="orderForm.orderId" placeholder="请输入订单ID" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="orderForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="渠道ID" prop="channel">
          <el-select v-model="orderForm.channel" placeholder="选择渠道">
            <el-option label="京东" value="JD" />
            <el-option label="拼多多" value="PDD" />
            <el-option label="淘宝" value="TB" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="orderForm.status" placeholder="选择状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="orderForm.createTime"
            type="datetime"
            placeholder="选择创建时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Plus, Refresh, Setting, Connection, 
  DataBoard, Document, Promotion 
} from '@element-plus/icons-vue'
import api from '@/api'

// 类型定义
interface WorkflowNode {
  id: string
  type: string
  label: string
  icon: string
  x: number
  y: number
}

interface NodeType {
  type: string
  label: string
  icon: string
}

interface MessageItem {
  id: number
  sender: string
  content: string
  time: Date
}

interface OrderItem {
  orderId: string
  userId: string
  channel: string
  status: string
  createTime: string
  syncTime?: string
}

interface SyncLogItem {
  logId: string
  orderId: string
  channel: string
  syncStatus: string
  syncTime: string
  message: string
}

// 响应式数据
const activeTab = ref('workflow')
const ordersLoading = ref(false)
const logsLoading = ref(false)
const orderDialogVisible = ref(false)
const selectedNode = ref<WorkflowNode | null>(null)

// 工作流设计相关
const nodeTypes = ref<NodeType[]>([
  { type: 'start', label: '开始', icon: 'Promotion' },
  { type: 'process', label: '处理', icon: 'Setting' },
  { type: 'condition', label: '条件', icon: 'DataBoard' },
  { type: 'end', label: '结束', icon: 'Document' }
])

const workflowNodes = ref<WorkflowNode[]>([])

// 通信表单
const communicationForm = reactive({
  message: '多渠道订单自动同步处理',
  receiver: 'admin'
})

const messageHistory = ref<MessageItem[]>([
  {
    id: 1,
    sender: '系统',
    content: '订单同步流程已启动',
    time: new Date()
  }
])

// 订单搜索表单
const orderSearchForm = reactive({
  orderId: '',
  channel: '',
  status: ''
})

// 订单表单
const orderForm = reactive<OrderItem>({
  orderId: '',
  userId: '',
  channel: '',
  status: '',
  createTime: ''
})

const orderRules = {
  orderId: [{ required: true, message: '请输入订单ID', trigger: 'blur' }],
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  channel: [{ required: true, message: '请选择渠道', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 分页数据
const orderPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const logPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const syncedOrders = ref<OrderItem[]>([
  {
    orderId: 'ORD789012',
    userId: 'USR003',
    channel: 'PDD',
    status: 'shipped',
    createTime: '2023-10-03 08:45:00',
    syncTime: '2023-10-03 08:46:00'
  },
  {
    orderId: 'ORD123456',
    userId: 'USR001',
    channel: 'JD',
    status: 'pending',
    createTime: '2023-10-01 10:00:00',
    syncTime: '2023-10-01 10:01:00'
  }
])

const syncLogs = ref<SyncLogItem[]>([
  {
    logId: 'LOG001',
    orderId: 'ORD789012',
    channel: 'PDD',
    syncStatus: 'success',
    syncTime: '2023-10-03 08:46:00',
    message: '订单同步成功'
  },
  {
    logId: 'LOG002',
    orderId: 'ORD123456',
    channel: 'JD',
    syncStatus: 'failed',
    syncTime: '2023-10-01 10:01:00',
    message: '网络连接超时'
  }
])

// 计算属性
const orderDialogTitle = computed(() => {
  return orderForm.orderId ? '编辑订单' : '添加订单'
})

// 工作流方法
const onDragStart = (event: DragEvent, node: NodeType) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify(node))
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const nodeData = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}') as NodeType
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  
  const newNode: WorkflowNode = {
    id: Date.now().toString(),
    ...nodeData,
    x: event.clientX - rect.left - 50,
    y: event.clientY - rect.top - 25
  }
  
  workflowNodes.value.push(newNode)
}

const selectNode = (node: WorkflowNode) => {
  selectedNode.value = node
}

const saveWorkflow = () => {
  ElMessage.success('工作流保存成功')
}

// 通信方法
const sendMessage = () => {
  const newMessage: MessageItem = {
    id: Date.now(),
    sender: '用户',
    content: communicationForm.message,
    time: new Date()
  }
  messageHistory.value.unshift(newMessage)
  ElMessage.success('消息发送成功')
  communicationForm.message = ''
}

const resetCommunicationForm = () => {
  communicationForm.message = '多渠道订单自动同步处理'
  communicationForm.receiver = 'admin'
}

// 订单管理方法
const searchOrders = () => {
  ordersLoading.value = true
  // 模拟API调用
  setTimeout(() => {
    ordersLoading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const resetOrderSearch = () => {
  orderSearchForm.orderId = ''
  orderSearchForm.channel = ''
  orderSearchForm.status = ''
}

const showAddOrderDialog = () => {
  (Object.keys(orderForm) as (keyof OrderItem)[]).forEach(key => {
    if (key in orderForm) {
      orderForm[key] = ''
    }
  })
  orderDialogVisible.value = true
}

const editOrder = (order: OrderItem) => {
  Object.assign(orderForm, order)
  orderDialogVisible.value = true
}

const saveOrder = () => {
  // 这里应该调用API保存订单
  ElMessage.success('订单保存成功')
  orderDialogVisible.value = false
}

const resyncOrder = (order: OrderItem) => {
  ElMessageBox.confirm('确定要重新同步此订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('重新同步成功')
  })
}

const deleteOrder = (order: OrderItem) => {
  ElMessageBox.confirm('确定要删除此订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

// 同步记录方法
const refreshLogs = () => {
  logsLoading.value = true
  setTimeout(() => {
    logsLoading.value = false
    ElMessage.success('日志刷新成功')
  }, 1000)
}

const viewLogDetail = (log: SyncLogItem) => {
  ElMessageBox.alert(log.message, '同步日志详情', {
    confirmButtonText: '确定'
  })
}

// 分页方法
const handleOrderSizeChange = (size: number) => {
  orderPagination.pageSize = size
  searchOrders()
}

const handleOrderCurrentChange = (page: number) => {
  orderPagination.currentPage = page
  searchOrders()
}

const handleLogSizeChange = (size: number) => {
  logPagination.pageSize = size
  refreshLogs()
}

const handleLogCurrentChange = (page: number) => {
  logPagination.currentPage = page
  refreshLogs()
}

// 工具方法
const getChannelName = (channel: string): string => {
  const names: Record<string, string> = {
    'JD': '京东',
    'PDD': '拼多多',
    'TB': '淘宝'
  }
  return names[channel] || channel
}

const getChannelTagType = (channel: string): string => {
  const types: Record<string, string> = {
    'JD': 'danger',
    'PDD': 'warning',
    'TB': 'success'
  }
  return types[channel] || 'info'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'completed': '已完成'
  }
  return texts[status] || status
}

const getStatusTagType = (status: string): string => {
  const types: Record<string, string> = {
    'pending': 'warning',
    'paid': 'success',
    'shipped': 'primary',
    'completed': 'info'
  }
  return types[status] || 'info'
}

const getSyncStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'success': '成功',
    'failed': '失败',
    'processing': '处理中'
  }
  return texts[status] || status
}

const getSyncStatusTagType = (status: string): string => {
  const types: Record<string, string> = {
    'success': 'success',
    'failed': 'danger',
    'processing': 'warning'
  }
  return types[status] || 'info'
}

const formatTime = (time: Date): string => {
  return time.toLocaleString()
}

const goBack = () => {
  // 返回上一页逻辑
}

// 生命周期
onMounted(() => {
  // 初始化数据
  orderPagination.total = syncedOrders.value.length
  logPagination.total = syncLogs.value.length
})
</script>

<style scoped>
.order-sync-container {
  padding: 20px;
  background: #F5F7FA;
  min-height: calc(100vh - 60px);
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 16px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.sync-tabs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.sync-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px 12px 0 0;
}

.sync-tabs :deep(.el-tabs__content) {
  padding: 24px;
}

/* 工作流设计样式 */
.workflow-container {
  height: 600px;
}

.workflow-card {
  height: 100%;
}

.workflow-design {
  display: flex;
  height: 500px;
}

.node-palette {
  width: 200px;
  border-right: 1px solid #e1e8ed;
  padding: 16px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px dashed #d1d9e0;
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s ease;
}

.node-item:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.workflow-canvas {
  flex: 1;
  position: relative;
  background: 
    radial-gradient(circle at 20px 20px, rgba(64, 158, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.workflow-node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.workflow-node:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.workflow-node.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 通信样式 */
.communication-container {
  max-width: 800px;
}

.message-history {
  max-height: 300px;
  overflow-y: auto;
}

.message-item {
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.sender {
  font-weight: 600;
}

.message-content {
  color: #333;
}

/* 卡片样式 */
.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-sync-container {
    padding: 10px;
  }
  
  .workflow-design {
    flex-direction: column;
    height: auto;
  }
  
  .node-palette {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e1e8ed;
  }
  
  .workflow-canvas {
    height: 300px;
  }
}
</style> 