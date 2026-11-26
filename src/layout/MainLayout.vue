<!-- src/layout/MainLayout.vue -->
<template>
  <el-container style="height: 100vh; border: 1px solid #eee;">
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      style="background-color: #2e3b4e;"
    >
      <div class="logo">
        <span v-if="!isCollapse">🔬 诺码科技解决方案</span>
        <span v-else>🔬</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical-demo"
        background-color="#2e3b4e"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        :collapse="isCollapse"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
        <template
          v-for="menu in menus"
          :key="menu.Id"
        >
          <el-sub-menu
            v-if="menu.Children && menu.Children.length"
            :index="menu.Path || String(menu.Id)"
          >
            <template #title>
              <el-icon><component :is="menu.Icon || 'Menu'" /></el-icon>
              <span>{{ menu.MenuName }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.Children"
              :key="child.Id"
              :index="child.Path || String(child.Id)"
            >
              {{ child.MenuName }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="menu.Path || String(menu.Id)"
          >
            <el-icon><component :is="menu.Icon || 'Menu'" /></el-icon>
            <span>{{ menu.MenuName }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon
            size="20"
            style="cursor:pointer;"
            @click="isCollapse = !isCollapse"
          >
            <Expand v-if="isCollapse" /><Fold v-else />
          </el-icon>
          <span style="margin-left: 16px;">{{ route.meta?.title || '首页' }}</span>
        </div>
        <div class="header-right">
          <el-dropdown
            trigger="click"
            @command="handleCommand"
          >
            <el-avatar
              :size="32"
              :src="userStore.avatar || ''"
            >
              {{ userStore.realName?.charAt(0) }}
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  command="logout"
                >
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- ✅ 新增：页签栏 -->
      <TabsView />

      <el-main style="padding:0; background:#f9fafc;">
        <!-- ✅ 新增：keep-alive 缓存页面 -->
        <keep-alive :include="cachedViews">
          <router-view :key="$route.fullPath" />
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { Expand, Fold } from '@element-plus/icons-vue'
    import { useUserStore } from '@/stores/user'
    import { useTabsStore } from '@/stores/tabs'
    import TabsView from './components/TabsView.vue'

    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const tabsStore = useTabsStore()
    const isCollapse = ref(false)

    // ✅ 缓存页面列表
    const cachedViews = computed(() => tabsStore.cachedViews)

    // ✅ 菜单点击：添加页签
    function handleMenuSelect(index) {
        // 如果点击的是当前已激活的路由，不重复添加
        if (index === route.path) return
        // 根据路径解析路由信息
        const matched = router.getRoutes().find(r => r.path === index)
        if (matched) {
            const fullRoute = router.resolve({ path: index })
            tabsStore.addTab(fullRoute)
        }
        // router 属性会自动跳转，不需要再调用 router.push
    }

    function handleCommand(command) {
        if (command === 'logout') {
            userStore.logout()
            router.push('/login')
        } else if (command === 'profile') {
            router.push('/profile')
        } else if (command === 'password') {
            router.push('/profile?tab=password')
        }
    }

    const menus = computed(() => {
        console.log('当前 menus:', userStore.menus)
        console.log('用户权限列表:', userStore.permissions)

        return userStore.menus || []
    })
</script>

<style scoped>
    .el-aside {
        color: #fff;
        overflow: hidden;
        transition: width 0.3s;
    }

    .logo {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .el-menu {
        border-right: none;
        height: calc(100vh - 60px);
        overflow-y: auto;
    }

    .el-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        border-bottom: 1px solid #eee;
        padding: 0 20px;
        height: 50px;
    }

    .header-left {
        display: flex;
        align-items: center;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    /* ✅ el-main 去掉 padding，让页面内容自己控制内边距 */
    .el-main {
        padding: 0;
        background: #f9fafc;
        height: calc(100vh - 50px - 40px); /* 减去 header + tabs 高度 */
        overflow: auto;
    }

        /* ✅ 确保页面容器占满 */
        .el-main :deep(.page-container) {
            height: 100%;
            padding: 20px;
        }
</style>