import axios from 'axios'

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

export interface Contact {
  contact_id: number
  name: string
  role: string
  contact_info: string
  avatar_url?: string
  status: string
  remark?: string
  is_active: boolean
  created_at: string
  updated_at: string
  unread_count: number
}

export interface Message {
  message_id: number
  sender_id: number
  receiver_id: number
  message_content: string
  message_type: string
  file_url?: string
  file_name?: string
  is_read: boolean
  sent_at: string
  read_at?: string
  status: string
  created_at: string
  sender_name?: string
  sender_avatar?: string
  receiver_name?: string
}

export interface MessageTemplate {
  template_id: number
  title: string
  content: string
  category?: string
  usage_count: number
  is_active: boolean
  created_by?: number
  created_at: string
  updated_at: string
}

export interface QuickReply {
  reply_id: number
  text: string
  sort_order: number
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContactCreateRequest {
  name: string
  role: string
  contact_info: string
  avatar_url?: string
  status?: string
  remark?: string
}

export interface ContactUpdateRequest {
  name?: string
  role?: string
  contact_info?: string
  avatar_url?: string
  status?: string
  remark?: string
  is_active?: boolean
}

export interface MessageCreateRequest {
  receiver_id: number
  message_content: string
  message_type?: string
  file_url?: string
  file_name?: string
}

export interface ContactListResponse {
  contacts: Contact[]
  total: number
}

export const communicationAPI = {
  // 联系人管理
  getContacts: (params?: {
    skip?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }) => {
    return api.get<ContactListResponse>('/communication/contacts', { params })
  },

  createContact: (data: ContactCreateRequest) => {
    return api.post<Contact>('/communication/contacts', data)
  },

  updateContact: (contactId: number, data: ContactUpdateRequest) => {
    return api.put<Contact>(`/communication/contacts/${contactId}`, data)
  },

  deleteContact: (contactId: number) => {
    return api.delete(`/communication/contacts/${contactId}`)
  },

  // 消息管理
  getMessages: (contactId: number, params?: {
    skip?: number
    limit?: number
  }) => {
    return api.get<Message[]>(`/communication/messages/${contactId}`, { params })
  },

  sendMessage: (data: MessageCreateRequest) => {
    return api.post<Message>('/communication/messages', data)
  },

  markMessageRead: (messageId: number) => {
    return api.put(`/communication/messages/${messageId}/read`)
  },

  // 消息模板
  getMessageTemplates: (params?: {
    skip?: number
    limit?: number
    category?: string
  }) => {
    return api.get<MessageTemplate[]>('/communication/templates', { params })
  },

  createMessageTemplate: (data: {
    title: string
    content: string
    category?: string
    created_by?: number
  }) => {
    return api.post<MessageTemplate>('/communication/templates', data)
  },

  // 快捷回复
  getQuickReplies: (params?: {
    skip?: number
    limit?: number
  }) => {
    return api.get<QuickReply[]>('/communication/quick-replies', { params })
  },

  createQuickReply: (data: {
    text: string
    sort_order?: number
  }) => {
    return api.post<QuickReply>('/communication/quick-replies', data)
  }
} 