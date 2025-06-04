import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建销售分析专用的axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// 销售分析相关API接口
export const salesAnalyticsAPI = {
  // 获取图表数据
  getChartData: (params?: { dateRange?: [string, string] }) => {
    return api({
      url: '/sales/analytics/charts',
      method: 'get',
      params
    })
  },

  // 获取渠道ID统计数据
  getChannelIdStats: (params?: { dateRange?: [string, string] }) => {
    return api({
      url: '/sales/analytics/channel-id',
      method: 'get',
      params
    })
  },

  // 获取销售订单统计
  getSalesOrdersStats: (params?: { dateRange?: [string, string] }) => {
    return api({
      url: '/sales/analytics/orders',
      method: 'get',
      params
    })
  },

  // 获取销售渠道统计
  getSalesChannelsStats: (params?: { dateRange?: [string, string] }) => {
    return api({
      url: '/sales/analytics/channels',
      method: 'get',
      params
    })
  },

  // 获取订单ID分布
  getOrderIdDistribution: (params?: { dateRange?: [string, string] }) => {
    return api({
      url: '/sales/analytics/order-id-distribution',
      method: 'get',
      params
    })
  }
}

// 销售统计相关API接口
export const salesStatisticsAPI = {
  // 获取基础统计数据
  getStatistics: (params?: { timeRange?: string }) => {
    return api({
      url: '/sales/statistics/basic',
      method: 'get',
      params
    })
  },

  // 获取详细统计数据
  getDetailedStats: (params?: { timeRange?: string }) => {
    return api({
      url: '/sales/statistics/detailed',
      method: 'get',
      params
    })
  },

  // 导出统计数据
  exportStatistics: (params?: { timeRange?: string, format?: 'csv' | 'excel' }) => {
    return api({
      url: '/sales/statistics/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 获取实时统计数据
  getRealTimeStats: () => {
    return api({
      url: '/sales/statistics/realtime',
      method: 'get'
    })
  }
}

// 数据类型定义
export interface ChartData {
  channelId: {
    categories: string[]
    data1: number[]
    data2: number[]
    data3: number[]
  }
  salesOrders: {
    categories: string[]
    values: number[]
  }
  salesChannels: {
    categories: string[]
    values: number[]
  }
  orderId: Array<{
    name: string
    value: number
  }>
}

export interface StatisticsData {
  channelId: number
  channelName: number
  createTime: number
}

export interface DetailedStatItem {
  metric: string
  value: number
  trend: '上升' | '下降' | '稳定'
  percentage: number
  description: string
  icon: string
  color: string
} 