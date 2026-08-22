import { createRouter, createWebHistory } from 'vue-router'
// 原有页面
import DetectionConfig from '@/views/DetectionConfig.vue'
import DetectionEnvManage from '@/views/DetectionEnvManage.vue'

import ReportList from '@/views/ReportList.vue'


const routes = [
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
        component: () => import('@/views/ReportForm/ReportForm.vue'),
        meta: { title: '检测报告录入' }
    },

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
    },
    {
        path: '/lab-data-query',
        name: 'LabDataQuery',
        component: () => import('@/views/LabDataQuery.vue'),
        meta: { title: '实验室数据统计表' }
    }
    ,
    {
        path: '/Ja-lab-data-query',
        name: 'JaLabDataQuery',
        component: () => import('@/views/JaLabDataQuery.vue'),
        meta: { title: '吉安实验室数据统计表' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router