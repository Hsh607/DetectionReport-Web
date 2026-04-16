import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import axios from 'axios'
import print from 'vue-print-nb'
import router from './router/index.js'

const app = createApp(App)

// 自动区分环境，本地/服务器永远不用改代码
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
axios.defaults.withCredentials = true

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

app.config.globalProperties.$axios = axios

app.use(ElementPlus, {
    locale: zhCn
})
app.use(print)
app.use(router)

app.mount('#app')