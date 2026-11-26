// stores/tabs.js
import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        tabs: [],        // 已打开的页签列表 [{ path, name, title, query }]
        activeTab: ''    // 当前激活的页签路径
    }),
    getters: {
        // 判断页签是否已存在
        tabExists: (state) => (path) => {
            return state.tabs.some(tab => tab.path === path)
        },
        // 获取缓存列表（用于 keep-alive）
        cachedViews: (state) => {
            return state.tabs.map(tab => tab.name).filter(Boolean)
        }
    },
    actions: {
        // 新增页签
        addTab(route) {
            const { path, name, meta, query } = route
            // 过滤掉不需要显示页签的路由（如 / 和 /login）
            if (path === '/' || path === '/login') return

            const title = meta?.title || path
            const tab = { path, name, title, query: { ...query } }

            if (!this.tabExists(path)) {
                this.tabs.push(tab)
            }
            // 切换到该页签
            this.activeTab = path
        },
        // 移除页签
        removeTab(path) {
            const index = this.tabs.findIndex(tab => tab.path === path)
            if (index === -1) return
            // 不允许关闭最后一个页签（或首页）
            if (this.tabs.length === 1) {
                // 可以跳转到首页或保留
                return
            }
            this.tabs.splice(index, 1)

            // 如果关闭的是当前激活页签，切换到相邻页签
            if (this.activeTab === path) {
                const nextTab = this.tabs[index] || this.tabs[index - 1]
                if (nextTab) {
                    this.activeTab = nextTab.path
                }
            }
        },
        // 切换页签
        switchTab(path) {
            this.activeTab = path
        },
        // 关闭其他页签
        closeOtherTabs(path) {
            const target = this.tabs.find(tab => tab.path === path)
            if (target) {
                this.tabs = [target]
                this.activeTab = path
            }
        },
        // 关闭所有页签（保留首页）
        closeAllTabs() {
            // 保留第一个页签（通常是首页）
            if (this.tabs.length > 0) {
                const firstTab = this.tabs[0]
                this.tabs = [firstTab]
                this.activeTab = firstTab.path
            }
        }
    }
})