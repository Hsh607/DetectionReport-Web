<!-- eslint-disable -->
<template>
    <el-dialog :title="isEdit ? '编辑菜单' : '新增菜单'" v-model="visible" width="500px">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="父级菜单" prop="ParentId">
                <el-select v-model="form.ParentId" clearable>
                    <el-option :value="0" label="顶级目录" />
                    <el-option v-for="menu in allMenus"
                               :key="menu.Id"
                               :value="menu.Id"
                               :label="menu.MenuName"
                               :disabled="menu.Id === form.Id" />
                </el-select>
            </el-form-item>
            <el-form-item label="菜单名称" prop="MenuName">
                <el-input v-model="form.MenuName" />
            </el-form-item>
            <el-form-item label="菜单编码" prop="MenuCode">
                <el-input v-model="form.MenuCode" />
            </el-form-item>
            <el-form-item label="类型" prop="MenuType">
                <el-select v-model="form.MenuType">
                    <el-option :value="0" label="目录" />
                    <el-option :value="1" label="菜单" />
                    <el-option :value="2" label="按钮" />
                </el-select>
            </el-form-item>
            <el-form-item label="路径" prop="Path" v-if="form.MenuType !== 2">
                <el-input v-model="form.Path" />
            </el-form-item>
            <el-form-item label="图标" prop="Icon">
                <el-input v-model="form.Icon" />
            </el-form-item>
            <el-form-item label="排序" prop="SortOrder">
                <el-input-number v-model="form.SortOrder" :min="0" />
            </el-form-item>
            <el-form-item label="可见">
                <el-switch v-model="form.IsVisible" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
    /* eslint-disable */
    import { ref, reactive } from 'vue'
    import { ElMessage } from 'element-plus'
    import { getMenus as getAllMenus, addMenu, updateMenu } from '@/api/rbac'

    const emit = defineEmits(['success'])
    const visible = ref(false)
    const isEdit = ref(false)
    const submitting = ref(false)
    const formRef = ref()
    const allMenus = ref([])

    // 表单数据 – 使用大驼峰与后端一致
    const form = reactive({
        Id: null,
        ParentId: 0,
        MenuName: '',
        MenuCode: '',
        MenuType: 0,
        Path: '',
        Icon: '',
        SortOrder: 0,
        IsVisible: true
    })

    // 校验规则（字段名也改为大驼峰）
    const rules = {
        MenuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        MenuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }]
    }

    // 获取所有菜单（用于父级选择）
    async function loadAllMenus() {
        try {
            const res = await getAllMenus()
            const data = res?.Data || res?.data?.Data || res?.data || res || []
            // 树形数据需要扁平化，以便在下拉中展示
            allMenus.value = flattenTree(data)
        } catch {
            allMenus.value = []
            ElMessage.warning('加载菜单列表失败')
        }
    }

    // 树形扁平化辅助函数
    function flattenTree(tree, result = []) {
        tree.forEach(node => {
            result.push({ Id: node.Id, MenuName: node.MenuName, ParentId: node.ParentId })
            if (node.Children && node.Children.length) {
                flattenTree(node.Children, result)
            }
        })
        return result
    }

    function open(row) {
        if (row && row.Id) {
            isEdit.value = true
            // 回填数据（字段名已匹配）
            Object.assign(form, {
                Id: row.Id,
                ParentId: row.ParentId || 0,
                MenuName: row.MenuName,
                MenuCode: row.MenuCode,
                MenuType: row.MenuType,
                Path: row.Path || '',
                Icon: row.Icon || '',
                SortOrder: row.SortOrder || 0,
                IsVisible: row.IsVisible !== undefined ? row.IsVisible : true
            })
        } else {
            isEdit.value = false
            Object.assign(form, {
                Id: null,
                ParentId: 0,
                MenuName: '',
                MenuCode: '',
                MenuType: 0,
                Path: '',
                Icon: '',
                SortOrder: 0,
                IsVisible: true
            })
        }
        loadAllMenus()
        visible.value = true
    }

    async function submit() {
        await formRef.value?.validate()
        submitting.value = true
        try {
            // 构造符合后端 DTO 的数据（不需要 Id）
            const payload = {
                MenuName: form.MenuName,
                MenuCode: form.MenuCode,
                ParentId: form.ParentId,
                MenuType: form.MenuType,
                Path: form.Path,
                Icon: form.Icon,
                SortOrder: form.SortOrder,
                IsVisible: form.IsVisible
            }
            if (isEdit.value) {
                await updateMenu(form.Id, payload)   // updateMenu(id, data)
            } else {
                await addMenu(payload)
            }
            ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
            emit('success')
            visible.value = false
        } catch {
            ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
        } finally {
            submitting.value = false
        }
    }

    defineExpose({ open })
</script>