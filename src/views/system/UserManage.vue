<!-- src/views/system/UserManage.vue -->
<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card
      class="search-card"
      shadow="never"
    >
      <el-form
        :inline="true"
        :model="searchForm"
        size="default"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.isActive"
            placeholder="全部"
            clearable
          >
            <el-option
              label="启用"
              :value="true"
            />
            <el-option
              label="禁用"
              :value="false"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSearch"
          >
            查询
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button
        v-permission="'user:add'"
        type="primary"
        @click="handleAdd"
      >
        + 新增用户
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width:100%;"
    >
      <el-table-column
        prop="Id"
        label="ID"
        width="80"
        align="center"
      />
      <el-table-column
        prop="UserName"
        label="用户名"
        min-width="120"
      />
      <el-table-column
        prop="RealName"
        label="姓名"
        min-width="120"
      />
      <el-table-column
        prop="Email"
        label="邮箱"
        min-width="180"
      />
      <el-table-column
        prop="Phone"
        label="手机号"
        min-width="140"
      />
      <el-table-column
        prop="IsActive"
        label="状态"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.IsActive ? 'success' : 'danger'"
            size="small"
          >
            {{ row.IsActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="LastLoginTime"
        label="最后登录"
        min-width="170"
      />
      <el-table-column
        label="操作"
        width="400"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-permission="'user:edit'"
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'user:role'"
            type="warning"
            size="small"
            @click="handleRole(row)"
          >
            分配角色
          </el-button>
          <el-button
            type="warning"
            size="small"
            @click="handleResetPwd(row)"
          >
            重置密码
          </el-button>
          <el-button
            v-permission="'user:delete'"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <UserDialog
      ref="userDialogRef"
      @success="loadData"
    />

    <!-- 分配角色弹窗 -->
    <RoleAssignDialog
      ref="roleAssignDialogRef"
      @success="loadData"
    />

    <!-- 重置密码结果弹窗 -->
    <el-dialog
      v-model="resetPwdVisible"
      title="重置成功"
      width="480px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div style="text-align: center; padding: 10px 0;">
        <el-icon
          color="#67c23a"
          :size="48"
        >
          <CircleCheck />
        </el-icon>
        <p style="margin: 16px 0 8px; font-size: 16px; font-weight: 600;">
          用户【{{ resetPwdUserName }}】密码已重置
        </p>
        <p style="color: #909399; font-size: 13px; margin: 0;">
          请复制以下临时密码并通知用户
        </p>

        <div class="temp-pwd-box">
          <span class="temp-pwd-text">{{ resetPwdValue }}</span>
          <el-button
            type="primary"
            size="small"
            @click="copyTempPwd"
          >
            复制
          </el-button>
        </div>

        <p style="color: #f56c6c; font-size: 12px; margin: 16px 0 0 0;">
          ⚠️ 关闭后无法再次查看，请立即复制
        </p>
      </div>
      <template #footer>
        <el-button
          type="primary"
          @click="resetPwdVisible = false"
        >
          我已复制，关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import UserDialog from './components/UserDialog.vue'
    import RoleAssignDialog from './components/RoleAssignDialog.vue'
    import { CircleCheck } from '@element-plus/icons-vue'        
    import { getUsers, deleteUser, resetUserPassword } from '@/api/rbac' 

    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const searchForm = reactive({ userName: '', isActive: undefined })

    const userDialogRef = ref()
    const roleAssignDialogRef = ref()

    const resetPwdVisible = ref(false)
    const resetPwdUserName = ref('')
    const resetPwdValue = ref('')

    async function loadData() {
        loading.value = true
        try {
            const res = await getUsers({
                page: page.value,
                size: pageSize.value,
                userName: searchForm.userName || undefined,
                isActive: searchForm.isActive
            })
            // ✅ 使用 res.data（因为拦截器返回完整 response）
            tableData.value = res.data?.Data?.List || res.data?.List || []
            total.value = res.data?.Data?.Total || res.data?.Total || 0
        } catch (error) {
            ElMessage.error('加载数据失败')
        } finally {
            loading.value = false
        }
    }

    function handleSearch() { page.value = 1; loadData() }
    function resetSearch() {
        searchForm.userName = ''
        searchForm.isActive = undefined
        handleSearch()
    }

    function handleAdd() { userDialogRef.value?.open() }
    function handleEdit(row) { userDialogRef.value?.open(row) }
    function handleRole(row) { roleAssignDialogRef.value?.open(row) }

    function handleDelete(row) {
        ElMessageBox.confirm(`确定删除用户 "${row.UserName}" 吗？`, '警告', { type: 'warning' })
            .then(async () => {
                await deleteUser(row.Id)
                ElMessage.success('删除成功')
                loadData()
            })
            .catch(() => { })
    }

    //  重置密码
    async function handleResetPwd(row) {
        try {
            await ElMessageBox.confirm(
                `确认重置用户【${row.UserName}】的密码？\n\n重置后旧密码立即失效，用户需要用临时密码登录。`,
                '重置密码确认',
                {
                    type: 'warning',
                    confirmButtonText: '确认重置',
                    cancelButtonText: '取消'
                }
            )
        } catch {
            return
        }

        try {
            const res = await resetUserPassword(row.Id)
            if (res.data.success) {
                resetPwdUserName.value = row.UserName
                resetPwdValue.value = res.data.data.tempPassword
                resetPwdVisible.value = true
            } else {
                ElMessage.error(res.data.message || '重置失败')
            }
        } catch (err) {
            ElMessage.error('请求失败，请重试')
        }
    }

    //  复制临时密码
    async function copyTempPwd() {
        try {
            await navigator.clipboard.writeText(resetPwdValue.value)
            ElMessage.success('已复制到剪贴板')
        } catch {
            const input = document.createElement('input')
            input.value = resetPwdValue.value
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
            ElMessage.success('已复制到剪贴板')
        }
    }

    onMounted(loadData)
</script>

<style scoped>
    .page-container {
        padding: 20px;
    }

    .search-card {
        margin-bottom: 20px;
    }

    .toolbar {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }

    .temp-pwd-box {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: #f5f7fa;
        border: 2px dashed #409eff;
        border-radius: 8px;
        padding: 16px 24px;
        margin: 20px 0;
    }

    .temp-pwd-text {
        font-family: 'Courier New', monospace;
        font-size: 22px;
        font-weight: 700;
        color: #409eff;
        letter-spacing: 2px;
    }
</style>