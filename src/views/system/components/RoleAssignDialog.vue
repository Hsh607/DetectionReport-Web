<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="500px"
  >
    <el-checkbox-group v-model="selectedRoleIds">
      <el-checkbox
        v-for="role in allRoles"
        :key="role.Id"
        :label="role.Id"
      >
        {{ role.RoleName }}
      </el-checkbox>
    </el-checkbox-group>
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
    import { ref } from 'vue'
    import { ElMessage } from 'element-plus'
    import { getRoles, updateUser } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const currentUserId = ref(null)
    const currentUser = ref(null)  // 存储完整用户信息
    const allRoles = ref([])
    const selectedRoleIds = ref([])
    const submitting = ref(false)

    async function open(row) {
        currentUserId.value = row.Id          // 注意字段名大写
        currentUser.value = row               // 保存整行数据
        const res = await getRoles()
        let roles = res?.Data || res?.data?.Data || res?.data || res || []
        if (!Array.isArray(roles)) roles = []
        allRoles.value = roles
        selectedRoleIds.value = row.RoleIds || []  // 后端返回字段是 RoleIds
        visible.value = true
    }

    async function submit() {
        submitting.value = true
        try {
            // 构造符合 UpdateUserDto 的完整请求体
            const payload = {
                RealName: currentUser.value.RealName,
                Email: currentUser.value.Email,
                Phone: currentUser.value.Phone,
                IsActive: currentUser.value.IsActive,
                RoleIds: selectedRoleIds.value
            }
            await updateUser(currentUserId.value, payload)
            ElMessage.success('分配角色成功')
            emit('success')
            visible.value = false
        } catch {
            ElMessage.error('分配失败')
        } finally {
            submitting.value = false
        }
    }

    defineExpose({ open })
</script>