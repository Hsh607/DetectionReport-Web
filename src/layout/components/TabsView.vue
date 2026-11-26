<template>
  <div class="tabs-view">
    <div class="tabs-wrapper">
      <el-tabs
        v-model="activeTabPath"
        type="card"
        class="tabs-component"
        @tab-remove="handleRemove"
        @tab-click="handleClick"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.path"
          :label="tab.title"
          :name="tab.path"
          :closable="tabs.length > 1"
        />
      </el-tabs>
    </div>
    <!-- 页签工具栏（可选） -->
    <div class="tabs-toolbar">
      <el-dropdown @command="handleCommand">
        <el-icon><ArrowDown /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="close-other">
              关闭其他
            </el-dropdown-item>
            <el-dropdown-item command="close-all">
              关闭全部
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTabPath = computed({
    get: () => tabsStore.activeTab,
    set: (val) => {
        tabsStore.switchTab(val)
        router.push(val)
    }
})

// 监听路由变化，自动添加页签
watch(() => route.path, (newPath) => {
    if (newPath && newPath !== '/') {
        tabsStore.addTab(route)
    }
}, { immediate: true })

// 关闭页签
function handleRemove(path) {
    tabsStore.removeTab(path)
}

// 点击页签切换
function handleClick(tab) {
    const path = tab.props.name
    if (path !== route.path) {
        router.push(path)
    }
}

// 下拉菜单命令
function handleCommand(command) {
    if (command === 'close-other') {
        tabsStore.closeOtherTabs(route.path)
    } else if (command === 'close-all') {
        tabsStore.closeAllTabs()
        // 跳转到第一个页签
        if (tabsStore.tabs.length > 0) {
            router.push(tabsStore.tabs[0].path)
        }
    }
}
</script>

<style scoped>
    .tabs-view {
        display: flex;
        align-items: center;
        background: #fff;
        border-bottom: 1px solid #e4e7ed;
        padding: 0 16px;
        height: 40px;
        flex-shrink: 0;
    }

    .tabs-wrapper {
        flex: 1;
        overflow: hidden;
    }

    .tabs-component {
        height: 40px;
    }

        .tabs-component :deep(.el-tabs__header) {
            border-bottom: none;
            margin: 0;
        }

        .tabs-component :deep(.el-tabs__item) {
            height: 32px;
            line-height: 32px;
            font-size: 13px;
            margin: 4px 4px 4px 0;
            border-radius: 4px;
            padding: 0 12px;
            background: #f5f7fa;
            border: 1px solid #e4e7ed;
        }

        .tabs-component :deep(.el-tabs__item.is-active) {
            background: #409eff;
            color: #fff;
            border-color: #409eff;
        }

        .tabs-component :deep(.el-tabs__item .el-icon-close) {
            width: 14px;
            height: 14px;
            font-size: 12px;
            margin-left: 4px;
            border-radius: 50%;
        }

        .tabs-component :deep(.el-tabs__item .el-icon-close:hover) {
            background: rgba(255, 255, 255, 0.3);
        }

    .tabs-toolbar {
        display: flex;
        align-items: center;
        padding-left: 12px;
        border-left: 1px solid #e4e7ed;
        cursor: pointer;
        color: #909399;
    }

        .tabs-toolbar:hover {
            color: #409eff;
        }
</style>