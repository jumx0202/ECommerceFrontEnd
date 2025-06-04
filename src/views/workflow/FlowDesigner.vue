<template>
  <div class="flow-designer page-container">
    <div class="designer-header">
      <div class="header-left">
        <h2>流程设计</h2>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button @click="openFlow">打开</el-button>
          <el-button @click="saveFlow">保存</el-button>
          <el-button @click="exportFlow">导出</el-button>
          <el-button @click="clearCanvas">清空</el-button>
        </el-button-group>
      </div>
    </div>

    <div class="designer-body">
      <!-- 左侧工具栏 -->
      <div class="tool-panel">
        <div class="tool-section">
          <h4>基础形状</h4>
          <div class="shape-list">
            <div 
              v-for="shape in basicShapes" 
              :key="shape.type"
              class="shape-item"
              :draggable="true"
              @dragstart="onShapeDragStart($event, shape)"
              @click="selectShape(shape)"
            >
              <div :class="`shape-icon shape-${shape.type}`">
                <component :is="shape.icon" v-if="shape.icon" />
                <div v-else :class="`${shape.type}-shape`"></div>
              </div>
              <span>{{ shape.label }}</span>
            </div>
          </div>
        </div>

        <div class="tool-section">
          <h4>流程图形</h4>
          <div class="shape-list">
            <div 
              v-for="shape in flowShapes" 
              :key="shape.type"
              class="shape-item"
              :draggable="true"
              @dragstart="onShapeDragStart($event, shape)"
              @click="selectShape(shape)"
            >
              <div :class="`shape-icon shape-${shape.type}`">
                <component :is="shape.icon" v-if="shape.icon" />
                <div v-else :class="`${shape.type}-shape`"></div>
              </div>
              <span>{{ shape.label }}</span>
            </div>
          </div>
        </div>

        <div class="tool-section">
          <h4>连接线</h4>
          <div class="connector-list">
            <div 
              v-for="connector in connectors" 
              :key="connector.type"
              class="connector-item"
              @click="selectConnector(connector)"
            >
              <div :class="`connector-icon connector-${connector.type}`"></div>
              <span>{{ connector.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-container">
        <div class="canvas-toolbar">
          <el-button-group size="small">
            <el-button @click="zoomIn">放大</el-button>
            <el-button @click="zoomOut">缩小</el-button>
            <el-button @click="resetZoom">重置</el-button>
          </el-button-group>
          <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>
        
        <div 
          ref="canvasRef"
          class="design-canvas"
          :style="{ transform: `scale(${zoomLevel})` }"
          @drop="onCanvasDrop"
          @dragover="onCanvasDragOver"
          @click="onCanvasClick"
        >
          <!-- 网格背景 -->
          <div class="canvas-grid"></div>
          
          <!-- 流程节点 -->
          <div 
            v-for="node in flowNodes"
            :key="node.id"
            class="flow-node"
            :class="{ 
              active: selectedNode?.id === node.id,
              [`node-${node.type}`]: true 
            }"
            :style="{ 
              left: node.x + 'px', 
              top: node.y + 'px',
              width: node.width + 'px',
              height: node.height + 'px'
            }"
            @click.stop="selectNode(node)"
            @mousedown="onNodeMouseDown($event, node)"
          >
            <div class="node-content">
              <component :is="node.icon" v-if="node.icon" class="node-icon" />
              <div v-else :class="`${node.type}-shape`"></div>
              <span class="node-text" v-if="node.text">{{ node.text }}</span>
            </div>
            
            <!-- 连接点 -->
            <div class="connection-points">
              <div class="connection-point connection-top" @click.stop="startConnection(node, 'top')"></div>
              <div class="connection-point connection-right" @click.stop="startConnection(node, 'right')"></div>
              <div class="connection-point connection-bottom" @click.stop="startConnection(node, 'bottom')"></div>
              <div class="connection-point connection-left" @click.stop="startConnection(node, 'left')"></div>
            </div>
          </div>

          <!-- 连接线 -->
          <svg class="connections-layer" :width="canvasWidth" :height="canvasHeight">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            <path
              v-for="connection in connections"
              :key="connection.id"
              :d="connection.path"
              stroke="#666"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
              class="connection-line"
              @click="selectConnection(connection)"
            />
          </svg>

          <!-- 临时连接线 -->
          <svg v-if="tempConnection" class="temp-connection-layer" :width="canvasWidth" :height="canvasHeight">
            <line
              :x1="tempConnection.startX"
              :y1="tempConnection.startY"
              :x2="tempConnection.endX"
              :y2="tempConnection.endY"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
            />
          </svg>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <div v-if="selectedNode" class="property-section">
          <h4>节点属性</h4>
          <el-form label-width="60px" size="small">
            <el-form-item label="文本">
              <el-input v-model="selectedNode.text" @input="updateNode" />
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="selectedNode.width" :min="50" @change="updateNode" />
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number v-model="selectedNode.height" :min="30" @change="updateNode" />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="selectedNode.color" @change="updateNode" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" size="small" @click="deleteNode">删除节点</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="selectedConnection" class="property-section">
          <h4>连接线属性</h4>
          <el-form label-width="60px" size="small">
            <el-form-item label="文本">
              <el-input v-model="selectedConnection.text" @input="updateConnection" />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="selectedConnection.color" @change="updateConnection" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" size="small" @click="deleteConnection">删除连接</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else class="property-section">
          <h4>画布属性</h4>
          <el-form label-width="60px" size="small">
            <el-form-item label="宽度">
              <el-input-number v-model="canvasWidth" :min="800" />
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number v-model="canvasHeight" :min="600" />
            </el-form-item>
            <el-form-item label="网格">
              <el-switch v-model="showGrid" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

interface Shape {
  type: string
  label: string
  icon?: string
  color?: string
}

interface FlowNode {
  id: string
  type: string
  label: string
  text: string
  x: number
  y: number
  width: number
  height: number
  color: string
  icon?: string
}

interface Connection {
  id: string
  fromNode: string
  toNode: string
  fromPoint: string
  toPoint: string
  path: string
  text?: string
  color: string
}

interface TempConnection {
  startX: number
  startY: number
  endX: number
  endY: number
  fromNode?: string
  fromPoint?: string
}

const canvasRef = ref<HTMLDivElement>()
const selectedNode = ref<FlowNode | null>(null)
const selectedConnection = ref<Connection | null>(null)
const selectedShape = ref<Shape | null>(null)
const flowNodes = ref<FlowNode[]>([])
const connections = ref<Connection[]>([])
const tempConnection = ref<TempConnection | null>(null)

const zoomLevel = ref(1)
const canvasWidth = ref(1200)
const canvasHeight = ref(800)
const showGrid = ref(true)

let nodeIdCounter = 0
let connectionIdCounter = 0
let isDragging = false
let dragOffset = { x: 0, y: 0 }

// 基础形状
const basicShapes = ref<Shape[]>([
  { type: 'rectangle', label: '矩形' },
  { type: 'circle', label: '圆形' },
  { type: 'diamond', label: '菱形' },
  { type: 'triangle', label: '三角形' },
  { type: 'ellipse', label: '椭圆' }
])

// 流程图形
const flowShapes = ref<Shape[]>([
  { type: 'start', label: '开始', icon: 'VideoPlay' },
  { type: 'process', label: '处理', icon: 'Setting' },
  { type: 'condition', label: '判断', icon: 'QuestionFilled' },
  { type: 'data', label: '数据', icon: 'Document' },
  { type: 'end', label: '结束', icon: 'VideoPause' }
])

// 连接器
const connectors = ref([
  { type: 'arrow', label: '箭头' },
  { type: 'line', label: '直线' },
  { type: 'curve', label: '曲线' }
])

const onShapeDragStart = (event: DragEvent, shape: Shape) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify(shape))
  }
}

const onCanvasDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const onCanvasDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer) return
  
  const shapeData = JSON.parse(event.dataTransfer.getData('text/plain')) as Shape
  const rect = canvasRef.value?.getBoundingClientRect()
  
  if (!rect) return
  
  const x = (event.clientX - rect.left) / zoomLevel.value - 50
  const y = (event.clientY - rect.top) / zoomLevel.value - 25
  
  const newNode: FlowNode = {
    id: `node_${++nodeIdCounter}`,
    type: shapeData.type,
    label: shapeData.label,
    text: shapeData.label,
    x,
    y,
    width: 100,
    height: 50,
    color: '#409eff',
    icon: shapeData.icon
  }
  
  flowNodes.value.push(newNode)
  selectedNode.value = newNode
}

const selectShape = (shape: Shape) => {
  selectedShape.value = shape
}

const selectNode = (node: FlowNode) => {
  selectedNode.value = node
  selectedConnection.value = null
}

const selectConnection = (connection: Connection) => {
  selectedConnection.value = connection
  selectedNode.value = null
}

const selectConnector = (connector: any) => {
  // 选择连接器逻辑
}

const onCanvasClick = (event: MouseEvent) => {
  if (event.target === canvasRef.value || (event.target as HTMLElement).classList.contains('canvas-grid')) {
    selectedNode.value = null
    selectedConnection.value = null
  }
}

const onNodeMouseDown = (event: MouseEvent, node: FlowNode) => {
  isDragging = true
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.x = (event.clientX - rect.left) / zoomLevel.value - node.x
    dragOffset.y = (event.clientY - rect.top) / zoomLevel.value - node.y
  }
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !rect) return
    
    node.x = (e.clientX - rect.left) / zoomLevel.value - dragOffset.x
    node.y = (e.clientY - rect.top) / zoomLevel.value - dragOffset.y
    
    updateConnections()
  }
  
  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const startConnection = (node: FlowNode, point: string) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const nodeRect = {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height
  }
  
  let startX, startY
  
  switch (point) {
    case 'top':
      startX = nodeRect.x + nodeRect.width / 2
      startY = nodeRect.y
      break
    case 'right':
      startX = nodeRect.x + nodeRect.width
      startY = nodeRect.y + nodeRect.height / 2
      break
    case 'bottom':
      startX = nodeRect.x + nodeRect.width / 2
      startY = nodeRect.y + nodeRect.height
      break
    case 'left':
      startX = nodeRect.x
      startY = nodeRect.y + nodeRect.height / 2
      break
    default:
      return
  }
  
  tempConnection.value = {
    startX,
    startY,
    endX: startX,
    endY: startY,
    fromNode: node.id,
    fromPoint: point
  }
  
  const onMouseMove = (e: MouseEvent) => {
    if (!tempConnection.value || !rect) return
    
    tempConnection.value.endX = (e.clientX - rect.left) / zoomLevel.value
    tempConnection.value.endY = (e.clientY - rect.top) / zoomLevel.value
  }
  
  const onMouseUp = (e: MouseEvent) => {
    if (tempConnection.value) {
      // 检查是否连接到另一个节点
      const targetNode = findNodeAtPosition(
        (e.clientX - rect.left) / zoomLevel.value,
        (e.clientY - rect.top) / zoomLevel.value
      )
      
      if (targetNode && targetNode.id !== node.id) {
        createConnection(node, targetNode, point, 'left') // 简化处理，都连接到左侧
      }
      
      tempConnection.value = null
    }
    
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const findNodeAtPosition = (x: number, y: number): FlowNode | null => {
  return flowNodes.value.find(node => 
    x >= node.x && x <= node.x + node.width &&
    y >= node.y && y <= node.y + node.height
  ) || null
}

const createConnection = (fromNode: FlowNode, toNode: FlowNode, fromPoint: string, toPoint: string) => {
  const connection: Connection = {
    id: `connection_${++connectionIdCounter}`,
    fromNode: fromNode.id,
    toNode: toNode.id,
    fromPoint,
    toPoint,
    path: '',
    color: '#666'
  }
  
  connections.value.push(connection)
  updateConnectionPath(connection)
}

const updateConnectionPath = (connection: Connection) => {
  const fromNode = flowNodes.value.find(n => n.id === connection.fromNode)
  const toNode = flowNodes.value.find(n => n.id === connection.toNode)
  
  if (!fromNode || !toNode) return
  
  // 简化的路径计算
  const startX = fromNode.x + fromNode.width / 2
  const startY = fromNode.y + fromNode.height
  const endX = toNode.x + toNode.width / 2
  const endY = toNode.y
  
  connection.path = `M ${startX} ${startY} L ${endX} ${endY}`
}

const updateConnections = () => {
  connections.value.forEach(updateConnectionPath)
}

const updateNode = () => {
  updateConnections()
}

const updateConnection = () => {
  // 更新连接线属性
}

const deleteNode = () => {
  if (!selectedNode.value) return
  
  // 删除相关连接
  connections.value = connections.value.filter(
    conn => conn.fromNode !== selectedNode.value!.id && conn.toNode !== selectedNode.value!.id
  )
  
  // 删除节点
  flowNodes.value = flowNodes.value.filter(node => node.id !== selectedNode.value!.id)
  selectedNode.value = null
}

const deleteConnection = () => {
  if (!selectedConnection.value) return
  
  connections.value = connections.value.filter(conn => conn.id !== selectedConnection.value!.id)
  selectedConnection.value = null
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.1, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.1, 0.3)
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const clearCanvas = () => {
  flowNodes.value = []
  connections.value = []
  selectedNode.value = null
  selectedConnection.value = null
}

const saveFlow = () => {
  const flowData = {
    nodes: flowNodes.value,
    connections: connections.value,
    canvas: {
      width: canvasWidth.value,
      height: canvasHeight.value
    }
  }
  
  // 这里应该调用API保存
  console.log('Saving flow:', flowData)
  ElMessage.success('流程保存成功')
}

const openFlow = () => {
  ElMessage.info('打开流程功能开发中...')
}

const exportFlow = () => {
  const flowData = {
    nodes: flowNodes.value,
    connections: connections.value,
    canvas: {
      width: canvasWidth.value,
      height: canvasHeight.value
    }
  }
  
  const dataStr = JSON.stringify(flowData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'flow-design.json'
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('流程导出成功')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.flow-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-left h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.tool-panel {
  width: 240px;
  background: white;
  border-right: 1px solid #e1e8ed;
  overflow-y: auto;
  padding: 16px;
}

.tool-section {
  margin-bottom: 24px;
}

.tool-section h4 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

.shape-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  cursor: move;
  transition: all 0.2s;
}

.shape-item:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.shape-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  color: #409eff;
}

.shape-item span {
  font-size: 12px;
  color: #666;
}

.connector-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connector-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.connector-item:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.connector-icon {
  width: 20px;
  height: 2px;
  background: #666;
  margin-right: 8px;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
}

.zoom-info {
  font-size: 14px;
  color: #666;
}

.design-canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  background: white;
  transform-origin: top left;
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0);
  background-size: 20px 20px;
  pointer-events: none;
}

.flow-node {
  position: absolute;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  cursor: move;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-node:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.flow-node.active {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.node-icon {
  font-size: 16px;
  color: #409eff;
}

.node-text {
  font-size: 12px;
  color: #333;
  text-align: center;
}

.connection-points {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.connection-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #409eff;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: crosshair;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.flow-node:hover .connection-point {
  opacity: 1;
}

.connection-top {
  top: 0;
  left: 50%;
}

.connection-right {
  top: 50%;
  right: 0;
}

.connection-bottom {
  bottom: 0;
  left: 50%;
}

.connection-left {
  top: 50%;
  left: 0;
}

.connections-layer,
.temp-connection-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.connection-line {
  pointer-events: auto;
  cursor: pointer;
}

.connection-line:hover {
  stroke: #409eff;
  stroke-width: 3;
}

.property-panel {
  width: 280px;
  background: white;
  border-left: 1px solid #e1e8ed;
  overflow-y: auto;
  padding: 16px;
}

.property-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

/* 特定形状样式 */
.rectangle-shape {
  width: 100%;
  height: 100%;
  border: 2px solid #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.circle-shape {
  width: 30px;
  height: 30px;
  border: 2px solid #409eff;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.1);
}

.diamond-shape {
  width: 30px;
  height: 30px;
  border: 2px solid #409eff;
  transform: rotate(45deg);
  background: rgba(64, 158, 255, 0.1);
}

.triangle-shape {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 25px solid #409eff;
}

.ellipse-shape {
  width: 40px;
  height: 25px;
  border: 2px solid #409eff;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.1);
}

.node-start {
  border-radius: 50%;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border-color: #67c23a;
  color: white;
}

.node-end {
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c, #f78989);
  border-color: #f56c6c;
  color: white;
}

.node-condition {
  transform: rotate(45deg);
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  border-color: #e6a23c;
}

.node-condition .node-content {
  transform: rotate(-45deg);
}

.node-process {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-color: #409eff;
  color: white;
}

.node-data {
  background: linear-gradient(135deg, #909399, #a6a9ad);
  border-color: #909399;
  color: white;
}
</style> 