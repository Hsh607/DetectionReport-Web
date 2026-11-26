// src/stores/user.js
import { defineStore } from 'pinia'
import { login as loginApi, getCurrentUser, getMenus, getPermissions } from '@/api/auth'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: null,
        permissions: [],
        menus: []
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
        userId: (state) => state.userInfo?.Id || state.userInfo?.UserId || null,
        userName: (state) => state.userInfo?.UserName || '',
        realName: (state) => state.userInfo?.RealName || state.userInfo?.UserName || '',
        avatar: (state) => state.userInfo?.avatarUrl || '',
        hasPermission: (state) => (permCode) => {
            if (!state.permissions || state.permissions.length === 0) return false
            return state.permissions.includes(permCode) || state.permissions.includes('*')
        }
    },
    actions: {
        async login(credentials) {
            const res = await loginApi(credentials)
            console.log('✅ 登录接口返回的权限列表:', res.data.Permissions)

            // ✅ 改为 res.data.Success
            if (res.data.Success) {

                this.token = res.data.Token
                localStorage.setItem('token', res.data.Token)
                this.userInfo = res.data.UserInfo
                this.menus = res.data.Menus || []
                this.permissions = res.data.Permissions || []
                return res.data
            }
            throw new Error(res.data.Message || '登录失败')
        },

        async fetchUserInfo() {
            const res = await getCurrentUser()
            if (res.data) {
                this.userInfo = res.data
                return res.data
            }
            throw new Error('获取用户信息失败')
        },

        async fetchMenus() {
            const res = await getMenus()
            // 如果是数组，直接使用；如果是 { Data: [...] }，使用 res.Data；如果是完整 response，使用 res.data
            let menuData = []
            if (Array.isArray(res)) {
                menuData = res
            } else if (res.data && Array.isArray(res.data)) {
                menuData = res.data
            } else if (res.Data && Array.isArray(res.Data)) {
                menuData = res.Data
            }
            this.menus = menuData
            return menuData
        },

        async fetchPermissions() {
            const res = await getPermissions()
            console.log('权限接口返回:', res.data)
            if (Array.isArray(res.data)) {
                this.permissions = res.data
                return res.data
            }
            this.permissions = []
        },

        async logout() {
            this.token = ''
            this.userInfo = null
            this.permissions = []
            this.menus = []
            localStorage.removeItem('token')
        }
    },
    
    persist: {
        key: 'user-store',
        storage: localStorage,
        paths: ['token', 'userInfo', 'permissions', 'menus']
    }
})