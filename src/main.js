// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'                        
import App from './App.vue'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import axios from 'axios'
import print from 'vue-print-nb'
import router from './router/index.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()        
pinia.use(piniaPluginPersistedstate)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 解决 ResizeObserver 报错
const debounce = (fn) => {
    let frameID;
    return (...params) => {
        if (frameID) cancelAnimationFrame(frameID);
        frameID = requestAnimationFrame(() => fn.apply(this, params));
    };
};
const resizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends resizeObserver {
    constructor(callback) {
        super(debounce(callback));
    }
};

// ================================================================
//  axios 全局配置
// ================================================================
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
axios.defaults.withCredentials = true

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

//  添加响应拦截器（处理 401）
// 防止并发 401 重复处理
let isHandling401 = false

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            if (isHandling401) return Promise.reject(error)
            isHandling401 = true

            // 1. 清登录态
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            sessionStorage.clear()

            // 2. 提示
            ElMessage.error('登录已过期，请重新登录')

            // 3. 记录当前路径，登录后能回来
            const currentPath = window.location.pathname + window.location.search
            const redirect = currentPath === '/login'
                ? ''
                : `?redirect=${encodeURIComponent(currentPath)}`

            // 4. 跳登录页
            window.location.href = `/login${redirect}`
        }
        return Promise.reject(error)
    }
)

app.config.globalProperties.$axios = axios

// ================================================================
// 注册 Pinia（一定要在 router 之前）
// ================================================================
app.use(pinia)                                                

app.use(ElementPlus, { locale: zhCn })
app.use(print)
app.use(router)

app.mount('#app')