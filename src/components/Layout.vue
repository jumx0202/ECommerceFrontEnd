<template>
  <div class="layout-container">
    <el-container class="layout-wrapper">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '250px'" class="sidebar">
        <div class="logo-container">
          <div class="logo">
            <el-icon :size="32" color="#409EFF">
              <Shop />
            </el-icon>
            <span v-show="!isCollapse" class="logo-text">电商管理系统</span>
          </div>
        </div>
        
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical"
          router
          :collapse="isCollapse"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <template #title>数据大屏</template>
          </el-menu-item>
          
          <el-sub-menu index="sales">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>多渠道销售</span>
            </template>
            <el-menu-item index="/sales-analytics">
              <el-icon><TrendCharts /></el-icon>
              <template #title>分析图表</template>
            </el-menu-item>
            <el-menu-item index="/sales-statistics">
              <el-icon><DataAnalysis /></el-icon>
              <template #title>数据统计</template>
            </el-menu-item>
            <el-menu-item index="/sales-channels">
              <el-icon><Shop /></el-icon>
              <template #title>销售渠道</template>
            </el-menu-item>
            <el-menu-item index="/sales-orders">
              <el-icon><Document /></el-icon>
              <template #title>销售订单</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <template #title>产品管理</template>
          </el-menu-item>
          
          <el-sub-menu index="inventory">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/inventory-dashboard">
              <el-icon><DataBoard /></el-icon>
              <template #title>数据大屏</template>
            </el-menu-item>
            <el-menu-item index="/inventory">
              <el-icon><Box /></el-icon>
              <template #title>库存信息</template>
            </el-menu-item>
            <el-menu-item index="/inventory-alerts">
              <el-icon><Warning /></el-icon>
              <template #title>库存预警记录</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="supply-chain">
            <template #title>
              <el-icon><OfficeBuilding /></el-icon>
              <span>供应链协同</span>
            </template>
            <el-menu-item index="/suppliers">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>供应商管理</template>
            </el-menu-item>
            <el-menu-item index="/logistics">
              <el-icon><Van /></el-icon>
              <template #title>物流协同</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="orders">
            <template #title>
              <el-icon><Refresh /></el-icon>
              <span>订单同步处理</span>
            </template>
            <el-menu-item index="/flow-designer">
              <el-icon><SetUp /></el-icon>
              <template #title>流程设计</template>
            </el-menu-item>
            <el-menu-item index="/order-info">
              <el-icon><Document /></el-icon>
              <template #title>订单信息</template>
            </el-menu-item>
            <el-menu-item index="/order-sync">
              <el-icon><Refresh /></el-icon>
              <template #title>渠道订单同步记录</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/communication">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>通信管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主容器 -->
      <el-container class="main-container">
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-button 
              type="text" 
              @click="handleCollapseToggle"
              class="collapse-btn"
            >
              <el-icon :size="20">
                <Expand v-if="isCollapse" />
                <Fold v-else />
              </el-icon>
            </el-button>
            
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ getCurrentPageTitle() }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="username">管理员</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safeAddEventListener, safeRemoveEventListener, checkElementPlusCompatibility } from '@/utils/domHelper'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 错误处理器引用
let errorHandlers: Array<() => void> = []

// 错误处理函数
const handleError = (error: Error) => {
  console.warn('Layout component error:', error)
  // 静默处理DOM操作错误，不影响用户体验
}

// 获取当前页面标题
const getCurrentPageTitle = () => {
  try {
    return route.meta?.title || '首页'
  } catch (error) {
    handleError(error as Error)
    return '首页'
  }
}

// 处理菜单收起/展开
const handleCollapseToggle = async () => {
  try {
    // 检查Element Plus兼容性
    if (!checkElementPlusCompatibility()) {
      console.warn('Element Plus compatibility issue detected')
      return
    }

    isCollapse.value = !isCollapse.value
    // 等待DOM更新完成后再进行其他操作
    await nextTick()
    
    // 添加延迟确保Element Plus内部操作完成
    setTimeout(() => {
      try {
        // 触发窗口大小调整事件，帮助图表等组件重新计算尺寸
        window.dispatchEvent(new Event('resize'))
      } catch (resizeError) {
        console.warn('Resize event dispatch failed:', resizeError)
      }
    }, 300)
  } catch (error) {
    handleError(error as Error)
    // 如果出错，恢复原状态
    isCollapse.value = !isCollapse.value
  }
}

// 处理用户下拉菜单操作
const handleCommand = (command: string) => {
  try {
    switch (command) {
      case 'profile':
        ElMessage.info('个人中心功能开发中...')
        break
      case 'settings':
        ElMessage.info('系统设置功能开发中...')
        break
      case 'logout':
        ElMessage.success('退出登录成功')
        router.push('/login')
        break
    }
  } catch (error) {
    handleError(error as Error)
    ElMessage.error('操作失败，请重试')
  }
}

// 全局错误处理
const setupGlobalErrorHandler = () => {
  // appendChild错误处理器
  const appendChildErrorHandler = (event: Event) => {
    const errorEvent = event as ErrorEvent
    if (errorEvent.error && errorEvent.error.message && 
        errorEvent.error.message.includes('appendChild')) {
      event.preventDefault()
      console.warn('Prevented appendChild error:', errorEvent.error)
      return false
    }
    return true
  }

  // Promise rejection错误处理器
  const promiseRejectionHandler = (event: Event) => {
    const rejectionEvent = event as PromiseRejectionEvent
    if (rejectionEvent.reason && rejectionEvent.reason.message && 
        rejectionEvent.reason.message.includes('appendChild')) {
      event.preventDefault()
      console.warn('Prevented appendChild promise rejection:', rejectionEvent.reason)
      return false
    }
    return true
  }

  // 使用安全的事件监听器添加
  if (safeAddEventListener(window, 'error', appendChildErrorHandler)) {
    errorHandlers.push(() => safeRemoveEventListener(window, 'error', appendChildErrorHandler))
  }
  
  if (safeAddEventListener(window, 'unhandledrejection', promiseRejectionHandler)) {
    errorHandlers.push(() => safeRemoveEventListener(window, 'unhandledrejection', promiseRejectionHandler))
  }
}

// 清理错误处理器
const cleanupErrorHandler = () => {
  errorHandlers.forEach(cleanup => {
    try {
      cleanup()
    } catch (error) {
      console.warn('Error cleanup failed:', error)
    }
  })
  errorHandlers = []
}

onMounted(() => {
  setupGlobalErrorHandler()
})

onUnmounted(() => {
  cleanupErrorHandler()
})
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.layout-wrapper {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  overflow: hidden;
  transition: width 0.3s ease;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1d1d1d;
  transition: all 0.3s ease;
  padding: 0 12px;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  justify-content: center;
  width: 100%;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.el-menu-vertical {
  border: none;
  height: calc(100vh - 64px);
  transition: width 0.3s ease;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 250px;
}

.el-menu-vertical.el-menu--collapse {
  width: 64px;
}

/* 收起状态下菜单项图标居中对齐 */
.sidebar .el-menu--collapse .el-menu-item {
  padding: 0;
  text-align: center;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar .el-menu--collapse .el-sub-menu .el-sub-menu__title {
  padding: 0;
  text-align: center;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar .el-menu--collapse .el-menu-item .el-icon,
.sidebar .el-menu--collapse .el-sub-menu .el-sub-menu__title .el-icon {
  margin-right: 0;
  margin-left: 0;
  flex-shrink: 0;
}

/* 收起状态下隐藏文字内容 */
.sidebar .el-menu--collapse .el-menu-item span,
.sidebar .el-menu--collapse .el-sub-menu .el-sub-menu__title span {
  display: none;
}

/* 收起状态下子菜单图标对齐 */
.sidebar .el-menu--collapse .el-sub-menu__icon-arrow {
  display: none;
}

/* 收起状态下的悬浮提示优化 */
.sidebar .el-menu--collapse .el-menu-item,
.sidebar .el-menu--collapse .el-sub-menu .el-sub-menu__title {
  height: 56px;
  line-height: 56px;
  min-width: 64px;
}

/* 收起状态下的图标尺寸统一 */
.sidebar .el-menu--collapse .el-icon {
  font-size: 18px;
}

.main-container {
  background-color: #f0f2f5;
  transition: margin-left 0.3s ease;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.collapse-btn {
  padding: 0;
  border: none;
  background: none;
  color: #666;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.main-content {
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}
</style> 