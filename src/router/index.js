import { createRouter, createWebHistory } from 'vue-router'
// 原有页面
import DetectionConfig from '@/views/DetectionConfig.vue'
import DetectionEnvManage from '@/views/DetectionEnvManage.vue'

import ReportList from '@/views/ReportList.vue'
import ReportForm from '@/views/ReportForm.vue'

const routes = [
    // 默认首页重定向到报告列表（更符合业务逻辑）
    { path: '/', redirect: '/report/list' },

    {
        path: '/config',
        name: 'DetectionConfig',
        component: DetectionConfig
    },

    {
        path: '/report/list',
        name: 'ReportList',
        component: ReportList,
        meta: { title: '检测报告管理' }
    },

    {
        path: '/report/form',
        name: 'ReportForm',
        component: ReportForm,
        meta: { title: '检测报告录入' }
    },

    // 3. 原有检测环境管理（保留不动）
    {
        path: '/detection-env',
        name: 'DetectionEnvManage',
        component: DetectionEnvManage,
        meta: { title: '检测项目环境查询' }
    },
    {
        path: '/tech-requirement/manage',
        name: 'TechRequirementManage',
        component: () => import('@/views/TechRequirementManage.vue'),
        meta: { title: '技术要求管理', icon: 'el-icon-document' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router