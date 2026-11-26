<template>
  <el-dialog
    v-model="visible"
    title="分配权限"
    width="600px"
  >
    <el-tree
      ref="treeRef"
      :data="permissionTree"
      show-checkbox
      node-key="Id"
      default-expand-all
      :props="{ label: 'PermissionName', children: 'children' }"
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
    import { getPermissions, updateRole, getMenus } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const currentRoleId = ref(null)
    const permissionTree = ref([])
    const treeRef = ref()
    const submitting = ref(false)
    const currentRole = ref(null)

    // 将树形菜单扁平化
    function flattenMenuTree(tree, result = []) {
        tree.forEach(node => {
            result.push({ Id: node.Id, MenuName: node.MenuName })
            if (node.Children && node.Children.length) {
                flattenMenuTree(node.Children, result)
            }
        })
        return result
    }

    function buildTree(permissions, menuMap) {
        const groupMap = new Map()
        permissions.forEach(p => {
            const key = p.MenuId || 0
            if (!groupMap.has(key)) groupMap.set(key, [])
            groupMap.get(key).push({
                Id: p.Id,
                PermissionName: p.PermissionName,
                PermissionCode: p.PermissionCode,
                MenuId: p.MenuId,
                IsActive: p.IsActive,
            })
        })

        const tree = []
        for (const [menuId, perms] of groupMap) {
            if (menuId === 0) continue
            const menuName = menuMap.get(menuId) || `菜单 ${menuId}`
            tree.push({
                Id: `group-${menuId}`,
                PermissionName: menuName,
                children: perms
            })
        }
        const uncategorized = groupMap.get(0)
        if (uncategorized && uncategorized.length) {
            tree.push({
                Id: 'group-uncategorized',
                PermissionName: '未分类',
                children: uncategorized
            })
        }
        return tree
    }

    async function open(row) {
        console.log('传入的角色数据:', row)
        console.log('该角色拥有的权限ID:', row.PermIds)

        currentRole.value = row
        currentRoleId.value = row.Id
        try {
            const permRes = await getPermissions()
            const permList = permRes?.Data || permRes?.data?.Data || permRes?.data || permRes || []
            if (!Array.isArray(permList)) {
                ElMessage.error('权限数据格式错误')
                return
            }

            // 加载菜单列表构建映射
            const menuRes = await getMenus()
            const menuData = menuRes?.Data || menuRes?.data?.Data || menuRes?.data || menuRes || []
            const flatMenus = flattenMenuTree(menuData)
            const menuMap = new Map()
            flatMenus.forEach(m => menuMap.set(m.Id, m.MenuName))

            permissionTree.value = buildTree(permList, menuMap)

            await nextTick()
            setTimeout(() => {
                if (treeRef.value) {
                    treeRef.value.setCheckedKeys([])
                    if (row.PermIds && row.PermIds.length) {
                        treeRef.value.setCheckedKeys(row.PermIds, false) // false 表示不自动展开
                    }
                }
            }, 50)
            visible.value = true
        } catch (error) {
            ElMessage.error('加载权限列表失败')
            console.error(error)
        }
    }

    async function submit() {
        const checkedKeys = treeRef.value?.getCheckedKeys() || []
        const permIds = checkedKeys.filter(key => typeof key === 'number')
        submitting.value = true
        try {
            const payload = {
                RoleName: currentRole.value.RoleName,
                RoleDesc: currentRole.value.RoleDesc,
                PermIds: permIds
            }
            await updateRole(currentRoleId.value, payload)
            ElMessage.success('分配权限成功')
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