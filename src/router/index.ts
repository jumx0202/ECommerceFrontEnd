import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue'),
          meta: { title: '数据大屏', icon: 'DataBoard' }
        },
        {
          path: 'sales-analytics',
          name: 'SalesAnalytics',
          component: () => import('@/views/sales/SalesAnalytics.vue'),
          meta: { title: '分析图表', icon: 'TrendCharts' }
        },
        {
          path: 'sales-statistics',
          name: 'SalesStatistics',
          component: () => import('@/views/sales/SalesStatistics.vue'),
          meta: { title: '数据统计', icon: 'DataAnalysis' }
        },
        {
          path: 'sales-channels',
          name: 'SalesChannels',
          component: () => import('@/views/sales/SalesChannels.vue'),
          meta: { title: '销售渠道', icon: 'Shop' }
        },
        {
          path: 'sales-orders',
          name: 'SalesOrders',
          component: () => import('@/views/sales/SalesOrders.vue'),
          meta: { title: '销售订单', icon: 'Document' }
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('@/views/products/Products.vue'),
          meta: { title: '产品管理', icon: 'Goods' }
        },
        {
          path: 'inventory-dashboard',
          name: 'InventoryDashboard',
          component: () => import('@/views/inventory/InventoryDashboard.vue'),
          meta: { title: '数据大屏', icon: 'DataBoard', parent: 'inventory' }
        },
        {
          path: 'inventory',
          name: 'Inventory',
          component: () => import('@/views/inventory/Inventory.vue'),
          meta: { title: '库存信息', icon: 'Box', parent: 'inventory' }
        },
        {
          path: 'inventory-alerts',
          name: 'InventoryAlerts',
          component: () => import('@/views/inventory/InventoryAlerts.vue'),
          meta: { title: '库存预警记录', icon: 'Warning', parent: 'inventory' }
        },
        {
          path: 'flow-designer',
          name: 'FlowDesigner',
          component: () => import('@/views/workflow/FlowDesigner.vue'),
          meta: { title: '流程设计', icon: 'SetUp', parent: 'orders' }
        },
        {
          path: 'order-info',
          name: 'OrderInfo',
          component: () => import('@/views/orders/OrderInfo.vue'),
          meta: { title: '订单信息', icon: 'Document', parent: 'orders' }
        },
        {
          path: 'suppliers',
          name: 'Suppliers',
          component: () => import('@/views/supply-chain/Suppliers.vue'),
          meta: { title: '供应商管理', icon: 'OfficeBuilding' }
        },
        {
          path: 'logistics',
          name: 'Logistics',
          component: () => import('@/views/supply-chain/Logistics.vue'),
          meta: { title: '物流协同', icon: 'Van' }
        },
        {
          path: 'order-sync',
          name: 'OrderSync',
          component: () => import('@/views/sync/OrderSync.vue'),
          meta: { title: '订单同步', icon: 'Refresh' }
        },
        {
          path: 'communication',
          name: 'Communication',
          component: () => import('@/views/communication/Communication.vue'),
          meta: { title: '通信管理', icon: 'ChatDotRound' }
        }
      ]
    }
  ]
})

export default router 