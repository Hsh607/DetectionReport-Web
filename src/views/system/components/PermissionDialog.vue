<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑权限' : '新增权限'"
    width="500px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        label="权限名称"
        prop="PermissionName"
      >
        <el-input
          v-model="form.PermissionName"
          placeholder="请输入权限名称"
        />
      </el-form-item>

      <el-form-item
        label="权限编码"
        prop="PermissionCode"
      >
        <el-input
          v-model="form.PermissionCode"
          placeholder="请输入权限编码（如 perm:add）"
        />
      </el-form-item>

      <el-form-item
        label="类型"
        prop="PermissionType"
      >
        <el-select v-model="form.PermissionType">
          <el-option
            :value="0"
            label="按钮"
          />
          <el-option
            :value="1"
            label="接口"
          />
        </el-select>
      </el-form-item>

      <!-- ✅ 新增：所属菜单 -->
      <el-form-item
        label="所属菜单"
        prop="MenuId"
      >
        <el-select
          v-model="form.MenuId"
          clearable
          placeholder="请选择所属菜单"
        >
          <el-option
            :value="0"
            label="无（未分类）"
          />
          <el-option
            v-for="menu in allMenus"
            :key="menu.Id"
            :value="menu.Id"
            :label="menu.MenuName"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="排序"
        prop="SortOrder"
      >
        <el-input-number
          v-model="form.SortOrder"
          :min="0"
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
    import { addPermission, updatePermission, getMenus } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const isEdit = ref(false)
    const submitting = ref(false)
    const formRef = ref()
    const allMenus = ref([])

    // 表单数据（全部大驼峰）
    const form = reactive({
        Id: null,
        PermissionName: '',
        PermissionCode: '',
        PermissionType: 0,
        MenuId: 0,        // 默认未分类
        SortOrder: 0,
        IsActive: true
    })

    // 校验规则
    const rules = {
        PermissionName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
        PermissionCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
    }

    // 将树形菜单扁平化（用于下拉选项）
    function flattenTree(tree, result = []) {
        tree.forEach(node => {
            result.push({ Id: node.Id, MenuName: node.MenuName, ParentId: node.ParentId })
            if (node.Children && node.Children.length) {
                flattenTree(node.Children, result)
            }
        })
        return result
    }

    // 加载菜单列表
    async function loadMenus() {
        try {
            const res = await getMenus()
            const data = res?.Data || res?.data?.Data || res?.data || res || []
            allMenus.value = flattenTree(data)
        } catch {
            allMenus.value = []
            ElMessage.warning('加载菜单列表失败，请刷新重试')
        }
    }

    // 打开弹窗（新增或编辑）
    async function open(row) {
        await loadMenus()  // 先加载菜单列表
        if (row && row.Id) {
            isEdit.value = true
            Object.assign(form, {
                Id: row.Id,
                PermissionName: row.PermissionName,
                PermissionCode: row.PermissionCode,
                PermissionType: row.PermissionType ?? 0,
                MenuId: row.MenuId ?? 0,
                SortOrder: row.SortOrder ?? 0,
                IsActive: row.IsActive ?? true
            })
        } else {
            isEdit.value = false
            Object.assign(form, {
                Id: null,
                PermissionName: '',
                PermissionCode: '',
                PermissionType: 0,
                MenuId: 0,
                SortOrder: 0,
                IsActive: true
            })
        }
        nextTick(() => formRef.value?.clearValidate())
        visible.value = true
    }

    // 提交表单
    async function submit() {
        await formRef.value?.validate()
        submitting.value = true
        try {
            // 构造 payload
            const payload = {
                PermissionName: form.PermissionName,
                PermissionCode: form.PermissionCode,
                PermissionType: form.PermissionType,
                MenuId: form.MenuId,
                SortOrder: form.SortOrder,
                IsActive: form.IsActive
            }

            let res
            if (isEdit.value) {
                res = await updatePermission(form.Id, payload)
            } else {
                res = await addPermission(payload)
            }

            // ✅ 检查后端返回的成功标志
            if (res.data?.Success === false) {
                ElMessage.error(res.data?.Message || (isEdit.value ? '更新失败' : '新增失败'))
                return
            }

            ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
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