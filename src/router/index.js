// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/layout/MainLayout.vue'
import DetectionConfig from '@/views/DetectionConfig.vue'
import DetectionEnvManage from '@/views/DetectionEnvManage.vue'
import ReportList from '@/views/ReportList.vue'

// ===== 公共路由（不需要登录） =====
const publicRoutes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { public: true }
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/views/Forbidden.vue'),
        meta: { public: true }
    }
]

// ===== 应用路由（需要登录） =====
const appRoutes = [
    {
        path: '/',
        component: MainLayout,
        // 移除 redirect，由路由守卫动态处理
        children: [
            // ===== 配置管理 =====
            {
                path: '/config',
                name: 'DetectionConfig',
                component: DetectionConfig,
                meta: { title: '检测项目模板配置' }
            },
            {
                path: '/detection-env',
                name: 'DetectionEnvManage',
                component: DetectionEnvManage,
                meta: { title: '检测项目环境查询' }
            },
            // ===== 报告管理 =====
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
                meta: { title: '新建报告' }
            },
            {
                //编辑报告动态路由
                path: '/report/edit/:id',
                name: 'ReportEdit',
                component: () => import('@/views/ReportForm/ReportForm.vue'),
                meta: { title: '编辑报告' }
            },

            // ===== 技术要求 =====
            {
                path: '/tech-requirement/manage',
                name: 'TechRequirementManage',
                component: () => import('@/views/TechRequirementManage.vue'),
                meta: { title: '技术要求管理' }
            },

            // ===== 数据统计 =====
            {
                path: '/lab-data-query',
                name: 'LabDataQuery',
                component: () => import('@/views/LabDataQuery.vue'),
                meta: { title: '实验室数据统计表' }
            },
            {
                path: '/Ja-lab-data-query',
                name: 'JaLabDataQuery',
                component: () => import('@/views/JaLabDataQuery.vue'),
                meta: { title: '吉安实验室数据统计表' }
            },

            // ===== 系统管理 =====
            {
                path: '/system/user',
                name: 'UserManage',
                component: () => import('@/views/system/UserManage.vue'),
                meta: { title: '用户管理', perm: 'user:view' }
            },
            {
                path: '/system/role',
                name: 'RoleManage',
                component: () => import('@/views/system/RoleManage.vue'),
                meta: { title: '角色管理', perm: 'role:view' }
            },
            {
                path: '/system/permission',
                name: 'PermissionManage',
                component: () => import('@/views/system/PermissionManage.vue'),
                meta: { title: '权限管理', perm: 'perm:view' }
            },
            {
                path: '/system/menu',
                name: 'MenuManage',
                component: () => import('@/views/system/MenuManage.vue'),
                meta: { title: '菜单管理', perm: 'menu:view' }
            },
            {
                path: '/profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue'),
                meta: { title: '个人中心' }
            },
            {
                path: '/task',
                name: 'TaskList',
                component: () => import('@/views/Task/TaskList.vue'),
                meta: {
                    title: '待办事项',
                    perm: 'task:view'   
                }
            },
            {
                path: '/report/detail/:id',
                name: 'ReportDetail',
                component: () => import('@/views/ReportForm/ReportForm.vue'),
                meta: { title: '报告详情' }
            },
            {
                path: '/detection-seal',
                name: 'DetectionSeal',
                component: () => import('@/views/DetectionSeal/DetectionSealManage.vue'),
                meta: { title: '检测章管理' }
            }
        ]
    }
]

const routes = [...publicRoutes, ...appRoutes]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ===== 辅助函数：递归查找第一个叶子菜单 =====
function findFirstLeafMenu(menus) {
    if (!menus || menus.length === 0) return null
    for (const menu of menus) {
        // 如果是叶子节点（菜单类型为1且有路径）
        if (menu.MenuType === 1 && menu.Path) {
            return menu
        }
        if (menu.Children && menu.Children.length > 0) {
            const child = findFirstLeafMenu(menu.Children)
            if (child) return child
        }
    }
    return null
}

// ===== 路由守卫 =====
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 1. 公开页面直接放行
    if (to.meta.public) {
        next()
        return
    }

    // 2. 检查登录状态
    if (!userStore.isLoggedIn) {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                await userStore.fetchUserInfo()
                await userStore.fetchMenus()
                await userStore.fetchPermissions()
            } catch {
                userStore.logout()
                next({ path: '/login', query: { redirect: to.fullPath } })
                return
            }
        } else {
            next({ path: '/login', query: { redirect: to.fullPath } })
            return
        }
    }

    // 3. 如果已经登录但用户信息为空，尝试获取
    if (!userStore.userInfo) {
        try {
            await userStore.fetchUserInfo()
            await userStore.fetchMenus()
            await userStore.fetchPermissions()
        } catch {
            userStore.logout()
            next({ path: '/login', query: { redirect: to.fullPath } })
            return
        }
    }

    // ========== 4. 新增：动态默认首页 ==========
    if (to.path === '/') {
        const menus = userStore.menus
        const firstMenu = findFirstLeafMenu(menus)
        if (firstMenu && firstMenu.Path) {
            // 跳转到第一个有权限的菜单路径
            next(firstMenu.Path)
            return
        } else {
            // 没有任何菜单 → 跳转 403
            next('/403')
            return
        }
    }

    // 5. 权限校验

    console.log('🔍 正在校验权限:', to.path, 'perm:', to.meta.perm)
    console.log('🔍 用户权限列表:', userStore.permissions)
    if (to.meta.perm && !userStore.hasPermission(to.meta.perm)) {
        next('/403')
        return
    }

    next()
})

export default router