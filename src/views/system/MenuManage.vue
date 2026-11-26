<!-- src/views/system/MenuManage.vue -->
<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button
        v-permission="'menu:add'"
        type="primary"
        @click="handleAdd"
      >
        + 新增菜单
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      row-key="Id"
      default-expand-all
      :tree-props="{ children: 'Children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="Id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="MenuName"
        label="菜单名称"
        min-width="150"
      />
      <el-table-column
        prop="MenuCode"
        label="菜单编码"
        min-width="150"
      />
      <el-table-column
        prop="Path"
        label="路径"
        min-width="150"
      />
      <el-table-column
        prop="MenuType"
        label="类型"
        width="80"
      >
        <template #default="{ row }">
          {{ row.MenuType === 0 ? '目录' : row.MenuType === 1 ? '菜单' : '按钮' }}
        </template>
      </el-table-column>
      <el-table-column
        label="图标"
        width="80"
      >
        <template #default="{ row }">
          <el-icon v-if="row.Icon">
            <component :is="row.Icon" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-permission="'menu:edit'"
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'menu:delete'"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <MenuDialog
      ref="menuDialogRef"
      @success="loadData"
    />
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getMenus } from '@/api/rbac'  // 注意：获取菜单列表可以用 Auth 的接口，但建议单独在 rbac 中增加 getMenuList
    import { deleteMenu } from '@/api/rbac'  // 需在 api/rbac.js 中添加
    import MenuDialog from './components/MenuDialog.vue'

    const loading = ref(false)
    const tableData = ref([])
    const menuDialogRef = ref()

    async function loadData() {
        loading.value = true
        try {
            const res = await getMenus()
            // 兼容多种响应结构：res.Data / res.data.Data / res.data / res
            let data = res?.Data || res?.data?.Data || res?.data || res || []
            if (!Array.isArray(data)) {
                console.warn('菜单数据不是数组，检查API返回结构:', res)
                data = []
            }
            tableData.value = data
        } catch (error) {
            ElMessage.error('加载菜单失败')
            console.error(error)
        } finally {
            loading.value = false
        }
    }

    function handleAdd() { menuDialogRef.value?.open() }
    function handleEdit(row) { menuDialogRef.value?.open(row) }

    function handleDelete(row) {
        ElMessageBox.confirm(`确定删除菜单 "${row.MenuName}" 及其子菜单吗？`, '警告', { type: 'warning' })
            .then(async () => {
                await deleteMenu(row.Id)   // 注意 Id 大写
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