/**
 * DOM操作辅助工具
 * 用于防止常见的DOM操作错误
 */

// 安全的appendChild操作
export const safeAppendChild = (parent: HTMLElement | null, child: HTMLElement | null): boolean => {
  try {
    if (parent && child && parent.appendChild && typeof parent.appendChild === 'function') {
      parent.appendChild(child)
      return true
    }
    return false
  } catch (error) {
    console.warn('Safe appendChild failed:', error)
    return false
  }
}

// 安全的DOM查询
export const safeQuerySelector = (selector: string, container?: HTMLElement | Document): HTMLElement | null => {
  try {
    const context = container || document
    if (context && context.querySelector && typeof context.querySelector === 'function') {
      return context.querySelector(selector)
    }
    return null
  } catch (error) {
    console.warn('Safe querySelector failed:', error)
    return null
  }
}

// 安全的事件监听器添加
export const safeAddEventListener = (
  element: HTMLElement | Window | null, 
  event: string, 
  handler: EventListener, 
  options?: boolean | AddEventListenerOptions
): boolean => {
  try {
    if (element && element.addEventListener && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options)
      return true
    }
    return false
  } catch (error) {
    console.warn('Safe addEventListener failed:', error)
    return false
  }
}

// 安全的事件监听器移除
export const safeRemoveEventListener = (
  element: HTMLElement | Window | null, 
  event: string, 
  handler: EventListener, 
  options?: boolean | EventListenerOptions
): boolean => {
  try {
    if (element && element.removeEventListener && typeof element.removeEventListener === 'function') {
      element.removeEventListener(event, handler, options)
      return true
    }
    return false
  } catch (error) {
    console.warn('Safe removeEventListener failed:', error)
    return false
  }
}

// Element Plus 兼容性检查
export const checkElementPlusCompatibility = (): boolean => {
  try {
    // 检查Element Plus是否正确加载
    const hasElementPlus = window && (window as any).ElementPlus
    const hasElementPlusIcons = window && (window as any).ElementPlusIconsVue
    
    return !!(hasElementPlus || hasElementPlusIcons || document.querySelector('.el-menu'))
  } catch (error) {
    console.warn('Element Plus compatibility check failed:', error)
    return false
  }
}

// 重试机制的DOM操作
export const retryDOMOperation = async (
  operation: () => boolean, 
  maxRetries: number = 3, 
  delay: number = 100
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (operation()) {
        return true
      }
    } catch (error) {
      console.warn(`DOM operation attempt ${i + 1} failed:`, error)
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return false
} 