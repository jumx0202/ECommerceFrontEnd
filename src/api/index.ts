import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// API基础配置
const API_BASE_URL = 'http://localhost:8000/api/v1'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
        ElMessage.error('登录已过期，请重新登录')
      } else if (status === 403) {
        ElMessage.error('权限不足')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器错误，请稍后重试')
      } else {
        ElMessage.error(data.detail || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接错误')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

// API接口定义
export const authAPI = {
  // 登录
  login: (credentials: { username: string; password: string }) => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    return api.post('/login/access-token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  
  // 验证token
  testToken: () => api.post('/test-token')
}

export const dashboardAPI = {
  // 获取统计数据
  getStatistics: () => api.get('/dashboard/statistics'),
  
  // 获取销售趋势
  getSalesTrend: () => api.get('/dashboard/charts/sales-trend'),
  
  // 获取渠道分布
  getChannelDistribution: () => api.get('/dashboard/charts/channel-distribution'),
  
  // 获取库存预警数据
  getInventoryAlerts: () => api.get('/dashboard/inventory/alerts'),
  
  // 获取最近订单
  getRecentOrders: (limit?: number) => api.get('/dashboard/recent-orders', { params: { limit } })
}

export const salesChannelsAPI = {
  // 获取销售渠道列表
  getChannels: (params?: { skip?: number; limit?: number }) => 
    api.get('/sales-channels/', { params }),
  
  // 创建销售渠道
  createChannel: (data: any) => api.post('/sales-channels/', data),
  
  // 获取单个渠道
  getChannel: (id: number) => api.get(`/sales-channels/${id}/`),
  
  // 更新渠道
  updateChannel: (id: number, data: any) => api.put(`/sales-channels/${id}/`, data),
  
  // 删除渠道
  deleteChannel: (id: number) => api.delete(`/sales-channels/${id}/`)
}

export const salesOrdersAPI = {
  // 获取销售订单列表
  getOrders: (params?: any) => api.get('/sales-orders/', { params }),
  
  // 创建销售订单
  createOrder: (data: any) => api.post('/sales-orders/', data),
  
  // 获取单个订单
  getOrder: (id: string) => api.get(`/sales-orders/${id}/`),
  
  // 更新订单
  updateOrder: (id: string, data: any) => api.put(`/sales-orders/${id}/`, data),
  
  // 删除订单
  deleteOrder: (id: string) => api.delete(`/sales-orders/${id}/`)
}

export const productsAPI = {
  // 获取产品列表
  getProducts: (params?: any) => api.get('/products/', { params }),
  
  // 创建产品
  createProduct: (data: any) => api.post('/products/', data),
  
  // 获取单个产品
  getProduct: (id: number) => api.get(`/products/${id}/`),
  
  // 更新产品
  updateProduct: (id: number, data: any) => api.put(`/products/${id}/`, data),
  
  // 删除产品
  deleteProduct: (id: number) => api.delete(`/products/${id}/`)
}

export const inventoryAPI = {
  // 获取库存列表
  getInventory: (params?: any) => api.get('/inventory/', { params }),
  
  // 更新库存
  updateInventory: (id: number, data: any) => api.put(`/inventory/${id}/`, data),
  
  // 获取库存预警
  getAlerts: () => api.get('/inventory/alerts/'),
  
  // 库存调整
  adjustInventory: (data: any) => api.post('/inventory/adjust/', data)
}

export const suppliersAPI = {
  // 获取供应商列表
  getSuppliers: (params?: any) => api.get('/suppliers/', { params }),
  
  // 创建供应商
  createSupplier: (data: any) => api.post('/suppliers/', data),
  
  // 获取单个供应商
  getSupplier: (id: number) => api.get(`/suppliers/${id}/`),
  
  // 更新供应商
  updateSupplier: (id: number, data: any) => api.put(`/suppliers/${id}/`, data),
  
  // 删除供应商
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}/`)
}

export const logisticsAPI = {
  // 获取物流信息列表
  getLogistics: (params?: any) => api.get('/logistics/', { params }),
  
  // 创建物流信息
  createLogistics: (data: any) => api.post('/logistics/', data),
  
  // 更新物流信息
  updateLogistics: (id: number, data: any) => api.put(`/logistics/${id}/`, data),
  
  // 删除物流信息
  deleteLogistics: (id: number) => api.delete(`/logistics/${id}/`)
}

export const orderSyncAPI = {
  // 获取同步订单
  getSyncOrders: (params?: any) => api.get('/order-sync/orders/', { params }),
  
  // 获取同步日志
  getSyncLogs: (params?: any) => api.get('/order-sync/logs/', { params }),
  
  // 创建同步订单
  createSyncOrder: (data: any) => api.post('/order-sync/orders/', data),
  
  // 重新同步订单
  resyncOrder: (id: string) => api.post(`/order-sync/orders/${id}/resync/`)
}

// 导出通信API
export { communicationAPI } from './communication'

// 导出所有接口
export default api 