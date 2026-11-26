<template>
  <el-dialog
    v-model="visible"
    title="分配菜单"
    width="500px"
  >
    <el-tree
      ref="treeRef"
      :data="menuTree"
      show-checkbox
      node-key="Id"
      default-expand-all
      :props="{ label: 'MenuName', children: 'Children' }"
    />
    <template #footer>
      <el-button @click="visible = false">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
    import { ref, nextTick } from 'vue'
    import { ElMessage } from 'element-plus'
    import { getMenus, assignMenus } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const currentRole = ref(null)
    const menuTree = ref([])
    const treeRef = ref()
    const submitting = ref(false)

    async function open(row) {
        currentRole.value = row
        try {
            const res = await getMenus()
            const data = res?.Data || res?.data?.Data || res?.data || res || []
            menuTree.value = data

            await nextTick()

            if (treeRef.value) {
                // 清空所有选中
                treeRef.value.setCheckedKeys([])

                // ⭐ 关键：只回显叶子节点（子菜单），不包括父节点
                // 1. 先获取所有叶子节点的 ID
                const leafIds = getAllLeafIds(data)
                // 2. 取 row.MenuIds 与 leafIds 的交集（只保留叶子节点）
                const menuIds = row.MenuIds || []
                const leafMenuIds = menuIds.filter(id => leafIds.includes(id))

                if (leafMenuIds.length) {
                    setTimeout(() => {
                        treeRef.value.setCheckedKeys(leafMenuIds, false)
                        console.log('回显的叶子菜单 IDs:', leafMenuIds)
                    }, 50)
                }
            }

            visible.value = true
        } catch (error) {
            ElMessage.error('加载菜单失败')
            console.error(error)
        }
    }

    // 辅助函数：获取树中所有叶子节点的 ID
    function getAllLeafIds(tree) {
        const ids = []
        function traverse(nodes) {
            for (const node of nodes) {
                if (!node.Children || node.Children.length === 0) {
                    ids.push(node.Id)
                } else {
                    traverse(node.Children)
                }
            }
        }
        traverse(tree)
        return ids
    }

    async function submit() {
        const checkedKeys = treeRef.value?.getCheckedKeys() || []

        // 补全父节点（用于保存到数据库）
        const allMenuIds = new Set(checkedKeys)

        // 递归查找选中节点的父节点
        function collectParents(tree) {
            for (const node of tree) {
                if (node.Children && node.Children.length) {
                    // 检查子节点是否有被选中的
                    const hasCheckedChild = node.Children.some(child => checkedKeys.includes(child.Id))
                    if (hasCheckedChild) {
                        allMenuIds.add(node.Id)  // 父节点加入集合
                    }
                    collectParents(node.Children)
                }
            }
        }
        collectParents(menuTree.value)

        const finalMenuIds = Array.from(allMenuIds)

        submitting.value = true
        try {
            await assignMenus(currentRole.value.Id, finalMenuIds)
            ElMessage.success('分配菜单成功')
            emit('success')
            visible.value = false
        } catch (error) {
            ElMessage.error('分配失败')
            console.error(error)
        } finally {
            submitting.value = false
        }
    }

    defineExpose({ open })
</script>