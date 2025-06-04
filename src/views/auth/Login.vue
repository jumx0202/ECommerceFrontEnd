<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#409EFF">
            <Shop />
          </el-icon>
        </div>
        <h1 class="title">电商管理系统</h1>
        <p class="subtitle">多渠道销售与库存管理一体化平台</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            size="large"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>默认账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { authAPI } from '@/api'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const loginFormRef = ref()

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

// 登录方法
const handleLogin = async () => {
  try {
    // 表单验证
    const valid = await loginFormRef.value?.validate()
    if (!valid) return

    loading.value = true

    // 调用登录API
    const response = await authAPI.login({
      username: loginForm.username,
      password: loginForm.password
    })

    const { access_token, token_type } = response.data

    // 存储token
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('token_type', token_type)

    // 验证token并获取用户信息
    const userResponse = await authAPI.testToken()
    const userInfo = userResponse.data
    
    // 存储用户信息
    localStorage.setItem('user_info', JSON.stringify(userInfo))

    ElNotification({
      title: '登录成功',
      message: `欢迎回来，${userInfo.username}！`,
      type: 'success',
      duration: 3000
    })

    // 跳转到首页
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.response?.data?.detail || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  loginFormRef.value?.resetFields()
  loginForm.username = 'admin'
  loginForm.password = 'admin123'
  loginForm.remember = false
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwYXRoIGQ9Im0wIDBoMTAwdjEwMGgtMTAweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+') repeat;
  opacity: 0.1;
}

.login-box {
  width: 400px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  background: #409EFF;
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
  background: #66B1FF;
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style> 