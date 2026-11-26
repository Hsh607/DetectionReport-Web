<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        v-if="!isEdit"
        label="用户名"
        prop="UserName"
      >
        <el-input
          v-model="form.UserName"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item
        label="真实姓名"
        prop="RealName"
      >
        <el-input
          v-model="form.RealName"
          placeholder="请输入真实姓名"
        />
      </el-form-item>
      <el-form-item
        label="邮箱"
        prop="Email"
      >
        <el-input
          v-model="form.Email"
          placeholder="请输入邮箱"
        />
      </el-form-item>
      <el-form-item
        label="手机号"
        prop="Phone"
      >
        <el-input
          v-model="form.Phone"
          placeholder="请输入手机号"
        />
      </el-form-item>
      <el-form-item
        v-if="!isEdit"
        label="密码"
        prop="Password"
      >
        <el-input
          v-model="form.Password"
          type="password"
          show-password
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="form.IsActive"
          active-text="启用"
          inactive-text="禁用"
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
    import { ref, reactive, nextTick, computed } from 'vue'
    import { ElMessage } from 'element-plus'
    import { addUser, updateUser } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const isEdit = ref(false)
    const submitting = ref(false)
    const formRef = ref()

    // 表单数据 – 字段名与后端 DTO 完全一致（大驼峰）
    const form = reactive({
        Id: null,
        UserName: '',
        RealName: '',
        Email: '',
        Phone: '',
        Password: '',
        IsActive: true,
        // 注意：RoleIds 不在此处管理，如需分配角色，可通过单独组件处理
    })

    // 校验规则（动态调整密码必填）
    const rules = computed(() => ({
        UserName: [{ required: !isEdit.value, message: '请输入用户名', trigger: 'blur' }],
        RealName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        Email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        Phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
        ],
        Password: [
            { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
            { min: 4, message: '密码至少4位', trigger: 'blur' }
        ]
    }))

    // 打开弹窗：新增或编辑
    function open(row) {
        if (row && row.Id) {
            // 编辑模式：回填数据（直接赋值，字段名一致）
            isEdit.value = true
            Object.assign(form, {
                Id: row.Id,
                UserName: row.UserName,
                RealName: row.RealName,
                Email: row.Email,
                Phone: row.Phone,
                IsActive: row.IsActive,
                Password: ''  // 编辑时不显示密码，清空
            })
        } else {
            // 新增模式：重置表单
            isEdit.value = false
            Object.assign(form, {
                Id: null,
                UserName: '',
                RealName: '',
                Email: '',
                Phone: '',
                Password: '',
                IsActive: true
            })
        }
        // 清空验证状态
        nextTick(() => formRef.value?.clearValidate())
        visible.value = true
    }

    // 提交表单
    async function submit() {
        await formRef.value?.validate()
        submitting.value = true
        try {
            if (isEdit.value) {
                // 编辑：只发送允许更新的字段（不包含 UserName 和 Password）
                const payload = {
                    RealName: form.RealName,
                    Email: form.Email,
                    Phone: form.Phone,
                    IsActive: form.IsActive
                    // 若需要更新角色，可添加 RoleIds，但此处未处理，可另行扩展
                }
                await updateUser(form.Id, payload)
                ElMessage.success('更新成功')
            } else {
                // 新增：发送完整信息（包含 UserName 和 Password）
                const payload = {
                    UserName: form.UserName,
                    Password: form.Password,
                    RealName: form.RealName,
                    Email: form.Email,
                    Phone: form.Phone,
                    IsActive: form.IsActive
                }
                await addUser(payload)
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