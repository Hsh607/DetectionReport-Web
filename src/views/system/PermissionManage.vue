<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button
        v-permission="'perm:add'"
        type="primary"
        @click="handleAdd"
      >
        + 新增权限
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      row-key="Id"
      default-expand-all
    >
      <el-table-column
        prop="Id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="PermissionName"
        label="权限名称"
        min-width="150"
      />
      <el-table-column
        prop="PermissionCode"
        label="权限编码"
        min-width="180"
      />
      <!-- ✅ 新增：所属菜单 -->
      <el-table-column
        label="所属菜单"
        min-width="120"
      >
        <template #default="{ row }">
          {{ getMenuName(row.MenuId) || '未分类' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="PermissionType"
        label="类型"
        width="100"
      >
        <template #default="{ row }">
          {{ row.PermissionType === 0 ? '按钮' : '接口' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-permission="'perm:edit'"
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'perm:delete'"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <PermissionDialog
      ref="permissionDialogRef"
      @success="loadData"
    />
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getPermissions, deletePermission, getMenus } from '@/api/rbac'
    import PermissionDialog from './components/PermissionDialog.vue'

    const loading = ref(false)
    const tableData = ref([])
    const permissionDialogRef = ref()
    const menuMap = ref(new Map()) // menuId -> menuName

    // 获取菜单名称
    function getMenuName(menuId) {
        if (!menuId) return null
        return menuMap.value.get(menuId) || null
    }

    // 扁平化菜单树
    function flattenTree(tree, result = []) {
        tree.forEach(node => {
            result.push({ Id: node.Id, MenuName: node.MenuName })
            if (node.Children && node.Children.length) {
                flattenTree(node.Children, result)
            }
        })
        return result
    }

    async function loadData() {
        loading.value = true
        try {
            const [permRes, menuRes] = await Promise.all([
                getPermissions(),
                getMenus()
            ])

            // 处理菜单数据
            const menuData = menuRes?.Data || menuRes?.data?.Data || menuRes?.data || menuRes || []
            const flatMenus = flattenTree(menuData)
            const map = new Map()
            flatMenus.forEach(m => map.set(m.Id, m.MenuName))
            menuMap.value = map

            // 处理权限数据
            let data = permRes?.Data || permRes?.data?.Data || permRes?.data || permRes || []
            if (!Array.isArray(data)) {
                console.warn('权限数据不是数组', permRes)
                data = []
            }

            // ✅ 排序：先按 PermissionCode，再按 SortOrder
            data.sort((a, b) => {
                const codeA = a.PermissionCode || ''
                const codeB = b.PermissionCode || ''
                if (codeA !== codeB) {
                    return codeA.localeCompare(codeB)
                }
                const orderA = a.SortOrder ?? 0
                const orderB = b.SortOrder ?? 0
                return orderA - orderB
            })

            tableData.value = data
        } catch (error) {
            ElMessage.error('加载数据失败')
            console.error(error)
        } finally {
            loading.value = false
        }
    }

    function handleAdd() { permissionDialogRef.value?.open() }
    function handleEdit(row) { permissionDialogRef.value?.open(row) }

    function handleDelete(row) {
        ElMessageBox.confirm(`确定删除权限 "${row.PermissionName}" 吗？`, '警告', { type: 'warning' })
            .then(async () => {
                const res = await deletePermission(row.Id)
                if (res.data?.Success === false) {
                    ElMessage.error(res.data?.Message || '删除失败')
                    return
                }
                ElMessage.success('删除成功')
                loadData()
            })
            .catch(() => { })
    }

    onMounted(loadData)
</script>

<style scoped>
    .page-container {
        padding: 20px;
    }

    .toolbar {
        margin-bottom: 20px;
    }
</style>