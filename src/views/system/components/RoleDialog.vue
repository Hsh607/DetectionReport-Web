<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="500px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        label="角色名称"
        prop="RoleName"
      >
        <el-input
          v-model="form.RoleName"
          placeholder="请输入角色名称"
        />
      </el-form-item>
      <el-form-item
        v-if="!isEdit"
        label="角色编码"
        prop="RoleCode"
      >
        <el-input
          v-model="form.RoleCode"
          placeholder="请输入角色编码（如 ROLE_ADMIN）"
        />
      </el-form-item>
      <el-form-item
        label="描述"
        prop="RoleDesc"
      >
        <el-input
          v-model="form.RoleDesc"
          type="textarea"
          rows="2"
          placeholder="请输入角色描述"
        />
      </el-form-item>
    </el-form>
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
    import { ref, reactive, nextTick } from 'vue'
    import { ElMessage } from 'element-plus'
    import { addRole, updateRole } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const isEdit = ref(false)
    const submitting = ref(false)
    const formRef = ref()

    // 表单数据 – 字段名与后端 DTO 完全一致（大驼峰）
    const form = reactive({
        Id: null,
        RoleName: '',
        RoleCode: '',      // 新增时需要
        RoleDesc: '',
        PermIds: []        // 保存已有权限ID，编辑时保持原样
    })

    // 校验规则（动态调整 RoleCode 必填）
    const rules = {
        RoleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        RoleCode: [
            { required: !isEdit.value, message: '请输入角色编码', trigger: 'blur' },
            { pattern: /^[A-Z_]+$/, message: '角色编码只能是大写字母和下划线', trigger: 'blur' }
        ]
    }

    function open(row) {
        if (row && row.Id) {
            // 编辑模式：回填数据
            isEdit.value = true
            Object.assign(form, {
                Id: row.Id,
                RoleName: row.RoleName,
                RoleCode: row.RoleCode || '',  // 编辑时不显示但保留原值
                RoleDesc: row.RoleDesc,
                PermIds: row.PermIds || []
            })
        } else {
            // 新增模式：重置表单
            isEdit.value = false
            Object.assign(form, {
                Id: null,
                RoleName: '',
                RoleCode: '',
                RoleDesc: '',
                PermIds: []
            })
        }
        // 清空验证状态
        nextTick(() => formRef.value?.clearValidate())
        visible.value = true
    }

    async function submit() {
        await formRef.value?.validate()
        submitting.value = true
        try {
            if (isEdit.value) {
                // 编辑：发送 UpdateRoleDto（不需 RoleCode 和 Id）
                const payload = {
                    RoleName: form.RoleName,
                    RoleDesc: form.RoleDesc,
                    PermIds: form.PermIds  // 保持原有权限不变
                }
                await updateRole(form.Id, payload)  // updateRole(id, data)
                ElMessage.success('更新成功')
            } else {
                // 新增：发送 CreateRoleDto
                const payload = {
                    RoleName: form.RoleName,
                    RoleCode: form.RoleCode,
                    RoleDesc: form.RoleDesc,
                    PermIds: []  // 新增时默认无权限
                }
                await addRole(payload)
                ElMessage.success('新增成功')
            }
            emit('success')
            visible.value = false
        } catch (error) {
            ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
            console.error(error)
        } finally {
            submitting.value = false
        }
    }

    defineExpose({ open })
</script>