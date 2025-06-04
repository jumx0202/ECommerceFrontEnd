# 电商管理系统前端

## 项目介绍

这是一个基于Vue 3开发的电商管理系统前端，提供了产品管理、库存管理、订单处理、用户管理等功能的界面实现。采用现代化的UI设计，为用户提供流畅的操作体验。

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **图表库**: ECharts

## 功能特性

- 产品管理：产品的添加、编辑、删除、查询
- 库存管理：库存监控、库存调整、库存预警
- 订单管理：订单查看、状态更新、订单处理
- 数据大屏：销售数据分析、库存状态可视化
- 用户系统：用户登录、权限控制、个人设置

## 环境要求

- Node.js 16+
- npm 7+ 或 yarn 1.22+

## 安装与运行

### 1. 克隆项目

```bash
git clone <项目仓库URL>
cd ECommerce/FrontEnd
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 配置环境变量

创建`.env.local`文件并配置后端API地址：

```
VITE_API_BASE_URL=http://localhost:8000
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

应用将在`http://localhost:5173`上运行。

### 5. 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 项目结构

```
src/
├── api/                # API请求
├── assets/             # 静态资源
├── components/         # 公共组件
├── hooks/              # 自定义hooks
├── layouts/            # 布局组件
├── router/             # 路由配置
├── stores/             # Pinia状态管理
├── styles/             # 全局样式
├── utils/              # 工具函数
└── views/              # 页面组件
    ├── dashboard/      # 仪表盘页面
    ├── inventory/      # 库存管理页面
    ├── orders/         # 订单管理页面
    ├── products/       # 产品管理页面
    └── user/           # 用户页面

index.html              # HTML模板
vite.config.js          # Vite配置
```

## 主要页面

- **登录页**: 用户认证
- **仪表盘**: 系统概览，关键数据指标
- **产品管理**: 产品CRUD操作
- **库存管理**: 库存监控与调整
- **订单管理**: 订单处理与跟踪
- **数据分析**: 销售与库存数据可视化

## 开发指南

### 添加新页面

1. 在`src/views/`下创建新的页面组件
2. 在`src/router/routes.js`中添加路由配置
3. 如需添加API请求，在`src/api/`中添加相应的接口函数

### 状态管理

使用Pinia进行状态管理：

```javascript
// 创建新的store
// src/stores/exampleStore.js
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', {
  state: () => ({
    // 状态
  }),
  getters: {
    // 计算属性
  },
  actions: {
    // 方法
  }
})
```

### 组件复用

创建通用组件并在需要的地方引入：

```vue
<script setup>
import CommonComponent from '@/components/CommonComponent.vue'
</script>

<template>
  <CommonComponent />
</template>
```

## 构建与部署

### 开发环境

```bash
npm run dev
```

### 测试环境

```bash
npm run build:test
```

### 生产环境

```bash
npm run build
```

构建产物将生成在`dist`目录中。

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 贡献指南

1. Fork该项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT
