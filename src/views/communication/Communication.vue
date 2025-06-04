<template>
  <div class="communication page-container">
    <!-- 页面标题 -->
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">通信管理</span>
      </template>
    </el-page-header>

    <div class="communication-layout">
      <!-- 左侧联系人列表 -->
      <div class="contacts-sidebar">
        <el-card shadow="hover" class="contacts-card">
          <template #header>
            <div class="card-header">
              <span>联系人</span>
              <el-button type="primary" size="small" @click="showAddContactDialog">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
          </template>

          <!-- 搜索联系人 -->
          <el-input
            v-model="contactSearchTerm"
            placeholder="搜索联系人"
            class="contact-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 联系人列表 -->
          <div class="contacts-list">
            <div
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-item"
              :class="{ active: selectedContact?.id === contact.id }"
              @click="selectContact(contact)"
            >
              <el-avatar :src="contact.avatar" class="contact-avatar">
                {{ contact.name.charAt(0) }}
              </el-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-role">{{ contact.role }}</div>
                <div class="contact-status" :class="contact.status">
                  {{ getStatusText(contact.status) }}
                </div>
              </div>
              <div class="contact-actions">
                <el-badge :value="contact.unreadCount" :hidden="!contact.unreadCount">
                  <el-icon class="message-icon"><ChatDotRound /></el-icon>
                </el-badge>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <el-card shadow="hover" class="chat-card" v-if="selectedContact">
          <!-- 聊天头部 -->
          <template #header>
            <div class="chat-header">
              <div class="chat-contact-info">
                <el-avatar :src="selectedContact.avatar" size="small">
                  {{ selectedContact.name.charAt(0) }}
                </el-avatar>
                <div class="chat-contact-details">
                  <span class="chat-contact-name">{{ selectedContact.name }}</span>
                  <span class="chat-contact-role">{{ selectedContact.role }}</span>
                </div>
                <el-tag 
                  :type="getStatusTagType(selectedContact.status)" 
                  size="small"
                >
                  {{ getStatusText(selectedContact.status) }}
                </el-tag>
              </div>
              <div class="chat-actions">
                <el-button size="small" @click="clearChatHistory">
                  <el-icon><Delete /></el-icon>
                  清空聊天
                </el-button>
                <el-button type="primary" size="small" @click="showMessageTemplates">
                  <el-icon><Document /></el-icon>
                  模板
                </el-button>
              </div>
            </div>
          </template>

          <!-- 聊天消息区域 -->
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="message in currentMessages"
              :key="message.id"
              class="message-item"
              :class="{ 'own-message': message.senderId === currentUserId }"
            >
              <div class="message-avatar">
                <el-avatar :src="message.senderAvatar" size="small">
                  {{ message.senderName.charAt(0) }}
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                </div>
                <div class="message-text" v-if="message.type === 'text'">
                  {{ message.content }}
                </div>
                <div class="message-file" v-else-if="message.type === 'file'">
                  <el-icon><Paperclip /></el-icon>
                  <span>{{ message.fileName }}</span>
                </div>
                <div class="message-image" v-else-if="message.type === 'image'">
                  <el-image :src="message.imageUrl" style="max-width: 200px" />
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天输入区域 -->
          <div class="chat-input-area">
            <div class="input-toolbar">
              <el-button size="small" @click="showEmojiPicker">
                <el-icon><ChatLineRound /></el-icon>
              </el-button>
              <el-upload
                action="#"
                :before-upload="handleFileUpload"
                :show-file-list="false"
                accept="image/*,application/pdf,application/msword"
              >
                <el-button size="small">
                  <el-icon><Paperclip /></el-icon>
                </el-button>
              </el-upload>
              <el-button size="small" @click="showQuickReply">
                <el-icon><Lightning /></el-icon>
                快捷回复
              </el-button>
            </div>
            <div class="input-container">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="3"
                placeholder="输入消息内容..."
                @keydown.ctrl.enter="sendMessage"
                class="message-input"
              />
              <el-button
                type="primary"
                @click="sendMessage"
                :disabled="!messageInput.trim()"
                class="send-button"
              >
                发送
                <el-icon><Promotion /></el-icon>
              </el-button>
            </div>
            <div class="input-hint">
              按 Ctrl+Enter 快速发送
            </div>
          </div>
        </el-card>

        <!-- 未选择联系人时的提示 -->
        <div v-else class="no-contact-selected">
          <el-empty description="请选择一个联系人开始对话">
            <el-button type="primary" @click="showAddContactDialog">
              添加新联系人
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 添加联系人对话框 -->
    <el-dialog
      v-model="addContactDialogVisible"
      title="添加联系人"
      width="500px"
    >
      <el-form :model="contactForm" :rules="contactRules" ref="contactFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="contactForm.name" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="contactForm.role" placeholder="选择角色">
            <el-option label="系统管理员" value="admin" />
            <el-option label="渠道方" value="channel" />
            <el-option label="供应商" value="supplier" />
            <el-option label="客户" value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="contactForm.contact" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="contactForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addContactDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContact">确定</el-button>
      </template>
    </el-dialog>

    <!-- 消息模板对话框 -->
    <el-dialog
      v-model="messageTemplatesDialogVisible"
      title="消息模板"
      width="600px"
    >
      <div class="message-templates">
        <div
          v-for="template in messageTemplates"
          :key="template.template_id"
          class="template-item"
          @click="useTemplate(template)"
        >
          <div class="template-title">{{ template.title }}</div>
          <div class="template-content">{{ template.content }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 快捷回复对话框 -->
    <el-dialog
      v-model="quickReplyDialogVisible"
      title="快捷回复"
      width="500px"
    >
      <div class="quick-replies">
        <el-button
          v-for="reply in quickReplies"
          :key="reply.reply_id"
          class="quick-reply-btn"
          @click="useQuickReply(reply)"
        >
          {{ reply.text }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, ChatDotRound, Delete, Document,
  Paperclip, ChatLineRound, Lightning, Promotion
} from '@element-plus/icons-vue'
import { communicationAPI, type Contact, type Message, type MessageTemplate, type QuickReply } from '@/api/communication'

// 类型定义
interface ContactItem {
  id: string
  name: string
  role: string
  status: string
  avatar?: string
  contact: string
  remark?: string
  unreadCount: number
}

interface MessageItem {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'file' | 'image'
  timestamp: Date
  fileName?: string
  imageUrl?: string
  isRead?: boolean
}

// 响应式数据
const contactSearchTerm = ref('')
const selectedContact = ref<ContactItem | null>(null)
const messageInput = ref('')
const currentUserId = ref('current-user')
const addContactDialogVisible = ref(false)
const messageTemplatesDialogVisible = ref(false)
const quickReplyDialogVisible = ref(false)
const chatMessagesRef = ref<HTMLElement>()
const loading = ref(false)

// 联系人表单
const contactForm = reactive({
  name: '',
  role: '',
  contact: '',
  remark: ''
})

const contactRules = {
  name: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

// 联系人列表（将从API获取）
const contacts = ref<ContactItem[]>([])

// 消息记录（将从API获取）
const messages = ref<Record<string, MessageItem[]>>({})

// 消息模板（将从API获取）
const messageTemplates = ref<MessageTemplate[]>([])

// 快捷回复（将从API获取）
const quickReplies = ref<QuickReply[]>([])

// 计算属性
const filteredContacts = computed(() => {
  if (!contactSearchTerm.value) {
    return contacts.value
  }
  return contacts.value.filter(contact =>
    contact.name.toLowerCase().includes(contactSearchTerm.value.toLowerCase()) ||
    contact.role.toLowerCase().includes(contactSearchTerm.value.toLowerCase())
  )
})

const currentMessages = computed(() => {
  return selectedContact.value ? (messages.value[selectedContact.value.id] || []) : []
})

// API 数据获取方法
const loadContacts = async () => {
  try {
    loading.value = true
    const response = await communicationAPI.getContacts()
    const apiContacts = response.data.contacts
    
    // 转换API数据格式为前端格式
    contacts.value = apiContacts.map((contact: Contact) => ({
      id: contact.contact_id.toString(),
      name: contact.name,
      role: contact.role,
      status: contact.status,
      avatar: contact.avatar_url,
      contact: contact.contact_info,
      remark: contact.remark,
      unreadCount: contact.unread_count
    }))
    
    console.log('已加载联系人:', contacts.value.length)
  } catch (error) {
    console.error('加载联系人失败:', error)
    ElMessage.error('加载联系人失败')
  } finally {
    loading.value = false
  }
}

const loadMessages = async (contactId: string) => {
  try {
    const response = await communicationAPI.getMessages(parseInt(contactId))
    const apiMessages = response.data
    
    // 转换API数据格式为前端格式
    messages.value[contactId] = apiMessages.map((msg: Message) => ({
      id: msg.message_id.toString(),
      senderId: msg.sender_id.toString(),
      senderName: msg.sender_name || '未知用户',
      senderAvatar: msg.sender_avatar,
      content: msg.message_content,
      type: msg.message_type as 'text' | 'file' | 'image',
      timestamp: new Date(msg.sent_at),
      fileName: msg.file_name,
      imageUrl: msg.file_url,
      isRead: msg.is_read
    }))
    
    console.log(`已加载联系人 ${contactId} 的消息:`, messages.value[contactId].length)
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  }
}

const loadMessageTemplates = async () => {
  try {
    const response = await communicationAPI.getMessageTemplates()
    messageTemplates.value = response.data
    console.log('已加载消息模板:', messageTemplates.value.length)
  } catch (error) {
    console.error('加载消息模板失败:', error)
    ElMessage.error('加载消息模板失败')
  }
}

const loadQuickReplies = async () => {
  try {
    const response = await communicationAPI.getQuickReplies()
    quickReplies.value = response.data
    console.log('已加载快捷回复:', quickReplies.value.length)
  } catch (error) {
    console.error('加载快捷回复失败:', error)
    ElMessage.error('加载快捷回复失败')
  }
}

// 方法
const selectContact = async (contact: ContactItem) => {
  selectedContact.value = contact
  
  // 加载与该联系人的聊天记录
  await loadMessages(contact.id)
  
  // 清除未读消息数
  contact.unreadCount = 0
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || !selectedContact.value) return

  try {
    // 调用API发送消息
    const response = await communicationAPI.sendMessage({
      receiver_id: parseInt(selectedContact.value.id),
      message_content: messageInput.value.trim(),
      message_type: 'text'
    })

    const apiMessage = response.data
    
    // 添加到本地消息列表
    const newMessage: MessageItem = {
      id: apiMessage.message_id.toString(),
      senderId: apiMessage.sender_id.toString(),
      senderName: apiMessage.sender_name || '我',
      content: apiMessage.message_content,
      type: apiMessage.message_type as 'text' | 'file' | 'image',
      timestamp: new Date(apiMessage.sent_at),
      isRead: apiMessage.is_read
    }

    if (!messages.value[selectedContact.value.id]) {
      messages.value[selectedContact.value.id] = []
    }
    messages.value[selectedContact.value.id].push(newMessage)

    messageInput.value = ''
    ElMessage.success('消息发送成功')

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  }
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const showAddContactDialog = () => {
  Object.keys(contactForm).forEach(key => {
    contactForm[key as keyof typeof contactForm] = ''
  })
  addContactDialogVisible.value = true
}

const saveContact = async () => {
  try {
    // 调用API创建联系人
    const response = await communicationAPI.createContact({
      name: contactForm.name,
      role: contactForm.role,
      contact_info: contactForm.contact,
      status: 'offline',
      remark: contactForm.remark
    })

    const apiContact = response.data
    
    // 添加到本地联系人列表
    const newContact: ContactItem = {
      id: apiContact.contact_id.toString(),
      name: apiContact.name,
      role: apiContact.role,
      status: apiContact.status,
      contact: apiContact.contact_info,
      remark: apiContact.remark,
      unreadCount: apiContact.unread_count,
      avatar: apiContact.avatar_url
    }

    contacts.value.push(newContact)
    addContactDialogVisible.value = false
    ElMessage.success('联系人添加成功')
  } catch (error) {
    console.error('添加联系人失败:', error)
    ElMessage.error('添加联系人失败')
  }
}

const clearChatHistory = () => {
  if (!selectedContact.value) return

  ElMessageBox.confirm('确定要清空与此联系人的聊天记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messages.value[selectedContact.value!.id] = []
    ElMessage.success('聊天记录已清空')
  })
}

const showMessageTemplates = async () => {
  if (messageTemplates.value.length === 0) {
    await loadMessageTemplates()
  }
  messageTemplatesDialogVisible.value = true
}

const useTemplate = (template: MessageTemplate) => {
  messageInput.value = template.content
  messageTemplatesDialogVisible.value = false
}

const showQuickReply = async () => {
  if (quickReplies.value.length === 0) {
    await loadQuickReplies()
  }
  quickReplyDialogVisible.value = true
}

const useQuickReply = (reply: QuickReply) => {
  messageInput.value = reply.text
  quickReplyDialogVisible.value = false
}

const showEmojiPicker = () => {
  ElMessage.info('表情功能开发中...')
}

const handleFileUpload = async (file: File) => {
  if (!selectedContact.value) return false

  try {
    // TODO: 实现文件上传到服务器的逻辑
    // 这里暂时模拟文件上传
    const fileUrl = `uploads/${file.name}`
    
    const response = await communicationAPI.sendMessage({
      receiver_id: parseInt(selectedContact.value.id),
      message_content: '发送了文件',
      message_type: 'file',
      file_url: fileUrl,
      file_name: file.name
    })

    const apiMessage = response.data
    
    const newMessage: MessageItem = {
      id: apiMessage.message_id.toString(),
      senderId: apiMessage.sender_id.toString(),
      senderName: apiMessage.sender_name || '我',
      content: '发送了文件',
      type: 'file',
      fileName: file.name,
      timestamp: new Date(apiMessage.sent_at)
    }

    if (!messages.value[selectedContact.value.id]) {
      messages.value[selectedContact.value.id] = []
    }
    messages.value[selectedContact.value.id].push(newMessage)

    ElMessage.success('文件发送成功')
  } catch (error) {
    console.error('文件发送失败:', error)
    ElMessage.error('文件发送失败')
  }
  
  return false // 阻止自动上传
}

// 工具方法
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'busy': '忙碌'
  }
  return texts[status] || status
}

const getStatusTagType = (status: string): string => {
  const types: Record<string, string> = {
    'online': 'success',
    'offline': 'info',
    'busy': 'warning'
  }
  return types[status] || 'info'
}

const formatMessageTime = (time: Date): string => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else {
    return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

const goBack = () => {
  // 返回上一页逻辑
}

// 生命周期
onMounted(async () => {
  // 加载初始数据
  await Promise.all([
    loadContacts(),
    loadMessageTemplates(),
    loadQuickReplies()
  ])
  
  // 默认选择第一个联系人
  if (contacts.value.length > 0) {
    await selectContact(contacts.value[0])
  }
})
</script>

<style scoped>
.communication-container {
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
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

.communication-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
}

/* 左侧联系人列表 */
.contacts-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.contacts-card {
  height: 100%;
  border-radius: 12px;
}

.contact-search {
  margin-bottom: 16px;
}

.contacts-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.contact-item:hover {
  background: rgba(116, 185, 255, 0.1);
}

.contact-item.active {
  background: rgba(116, 185, 255, 0.2);
  border: 1px solid #74b9ff;
}

.contact-avatar {
  margin-right: 12px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.contact-role {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.contact-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.contact-status.online {
  background: #67c23a;
  color: white;
}

.contact-status.offline {
  background: #909399;
  color: white;
}

.contact-status.busy {
  background: #e6a23c;
  color: white;
}

.contact-actions {
  margin-left: 8px;
}

.message-icon {
  color: #74b9ff;
}

/* 右侧聊天区域 */
.chat-area {
  flex: 1;
}

.chat-card {
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-contact-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-contact-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-contact-name {
  font-weight: 600;
}

.chat-contact-role {
  font-size: 12px;
  color: #666;
}

/* 聊天消息 */
.chat-messages {
  flex: 1;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 8px;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-item.own-message .message-content {
  background: #409EFF;
  color: white;
}

.message-item:not(.own-message) .message-content {
  border-top-left-radius: 4px;
}

.message-item.own-message .message-content {
  border-top-right-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.sender-name {
  font-weight: 600;
}

.message-time {
  color: #666;
}

.message-item.own-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-text {
  line-height: 1.5;
  word-break: break-word;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.message-item.own-message .message-file {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.message-image {
  margin-top: 8px;
}

.message-image img {
  max-width: 200px;
  border-radius: 8px;
  cursor: pointer;
}

/* 聊天输入区域 */
.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e1e8ed;
  background: white;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.send-button {
  align-self: flex-end;
}

.input-hint {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: center;
}

/* 无联系人选中状态 */
.no-contact-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
}

/* 消息模板 */
.message-templates {
  display: grid;
  gap: 12px;
}

.template-item {
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #74b9ff;
  background: rgba(116, 185, 255, 0.1);
}

.template-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.template-content {
  color: #666;
  font-size: 14px;
}

/* 快捷回复 */
.quick-replies {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-reply-btn {
  width: 100%;
  text-align: left;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .communication-container {
    padding: 10px;
  }

  .communication-layout {
    flex-direction: column;
    height: auto;
  }

  .contacts-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .contacts-list {
    max-height: 300px;
  }

  .message-content {
    max-width: 85%;
  }

  .input-container {
    flex-direction: column;
    gap: 8px;
  }

  .send-button {
    align-self: stretch;
  }
}
</style> 