<template>
    <el-container style="height: 100vh; border: 1px solid #eee;">
        <el-aside width="200px" style="background-color: #2e3b4e;">
            <el-menu default-active="/config"
                     class="el-menu-vertical-demo"
                     background-color="#2e3b4e"
                     text-color="#fff"
                     active-text-color="#ffd04b"
                     router
                     :unique-opened="true">
                <el-menu-item index="/detection-env">
                    <el-icon><Setting /></el-icon>
                    <template #title>
                        检测项目环境
                    </template>
                </el-menu-item>
                <el-menu-item index="/tech-requirement/manage">
                    <el-icon><Setting /></el-icon>
                    <template #title>
                        技术要求配置
                    </template>
                </el-menu-item>
                <el-menu-item index="/config">
                    <el-icon><Setting /></el-icon>
                    <template #title>
                        检测项目模板配置
                    </template>
                </el-menu-item>
                <el-menu-item index="/report/list">
                    <el-icon><Document /></el-icon>
                    <template #title>
                        检测报告管理
                    </template>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <el-container>
            <el-header style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; background: #fff; border-bottom: 1px solid #eee;">
                <div></div>
                <span style="font-size: 18px; font-weight: 600; color: #2e3b4e;">检测报告系统</span>
                <el-dropdown trigger="click">
                    <el-icon class="cursor-pointer" style="margin-right: 15px; font-size: 18px;"><Setting /></el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>个人中心</el-dropdown-item>
                            <el-dropdown-item>修改密码</el-dropdown-item>
                            <el-dropdown-item divided>退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-main style="padding: 20px; background-color: #f9fafc;">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
    import { onMounted } from 'vue'
    import { Setting, Document } from '@element-plus/icons-vue'
    import axios from 'axios'

    onMounted(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const userName = urlParams.get('userName')

        // ==============================================
        // 1. 处理用户信息存储
        // ==============================================
        if (token) {
            console.log("✅ 来自云表登录")
            localStorage.setItem('token', token)
            localStorage.setItem('username', userName || '云表用户')
        } else {
            console.log("✅ 本地直接打开，使用默认账户")
            localStorage.setItem('username', '测试管理员')
            // 🔥 关键：本地打开时，彻底清除可能残留的非法 token，避免干扰
            localStorage.removeItem('token')
        }
        localStorage.setItem('loginTime', new Date().toLocaleString())

        // ==============================================
        // 2. 🔥 修复请求拦截器（极简版，彻底解决编码错误）
        // ==============================================
        axios.interceptors.request.use(config => {
            // 直接获取 token，不再做任何复杂的正则校验
            const token = localStorage.getItem('token')

            // 只有当 token 确实存在且是标准字符串时，才添加头
            if (token && typeof token === 'string') {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        }, (error) => {
            return Promise.reject(error)
        })
    })
</script>

<style>
    * {
        font-family: "微软雅黑", "Microsoft Yahei", Arial, sans-serif !important;
    }

    .el-header {
        background: #fff;
        color: #333;
        line-height: 60px;
    }

    .el-aside {
        color: #fff;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .el-menu-vertical-demo .el-menu-item {
        display: flex;
        align-items: center;
    }
</style>