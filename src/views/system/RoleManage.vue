<!-- src/views/system/RoleManage.vue -->
<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button
        v-permission="'role:add'"
        type="primary"
        @click="handleAdd"
      >
        + 新增角色
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
    >
      <el-table-column
        prop="Id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="RoleName"
        label="角色名称"
        min-width="150"
      />
      <el-table-column
        prop="RoleDesc"
        label="描述"
        min-width="200"
      />
      <el-table-column
        label="系统角色"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.IsSystem ? 'warning' : ''"
            size="small"
          >
            {{ row.IsSystem ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="权限数"
        width="100"
      >
        <template #default="{ row }">
          {{ row.PermIds?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-tooltip content="编辑">
            <el-button
              v-permission="'role:edit'"
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="分配菜单">
            <el-button
              v-permission="'role:menu'"
              type="success"
              link
              size="small"
              @click="handleMenu(row)"
            >
              <el-icon><Menu /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="分配权限">
            <el-button
              v-permission="'role:permission'"
              type="warning"
              link
              size="small"
              @click="handlePermission(row)"
            >
              <el-icon><Lock /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="删除">
            <el-button
              v-permission="'role:delete'"
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <RoleDialog
      ref="roleDialogRef"
      @success="loadData"
    />
    <PermissionAssignDialog
      ref="permissionAssignDialogRef"
      @success="loadData"
    />
    <MenuAssignDialog
      ref="menuAssignDialogRef"
      @success="loadData"
    />
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getRoles, deleteRole } from '@/api/rbac'
    import RoleDialog from './components/RoleDialog.vue'
    import PermissionAssignDialog from './components/PermissionAssignDialog.vue'
    import MenuAssignDialog from './components/MenuAssignDialog.vue'


    const loading = ref(false)
    const tableData = ref([])
    const roleDialogRef = ref()
    const permissionAssignDialogRef = ref()

    const menuAssignDialogRef = ref()

    function handleMenu(row) {
        menuAssignDialogRef.value?.open(row)
    }

    async function loadData() {
        loading.value = true
        try {
            const res = await getRoles()
            console.log('完整响应:', res)
            console.log('res.data:', res.data)
            console.log('res.data.Data:', res.data?.Data)
            tableData.value = res.data?.Data || res.data || []
        } catch {
            ElMessage.error('加载角色失败')
        } finally {
            loading.value = false
        }
    }

    function handleAdd() { roleDialogRef.value?.open() }
    function handleEdit(row) { roleDialogRef.value?.open(row) }
    function handlePermission(row) { permissionAssignDialogRef.value?.open(row) }

    function handleDelete(row) {
        if (row.IsSystem) {   // ✅ 大驼峰
            ElMessage.warning('系统角色不可删除')
            return
        }
        ElMessageBox.confirm(`确定删除角色 "${row.RoleName}" 吗？`, '警告', { type: 'warning' })
            .then(async () => {
                await deleteRole(row.Id)  // ✅ 大驼峰
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