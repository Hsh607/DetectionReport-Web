<template>
    <div class="page-container" style="padding: 20px;">
        <div class="search-bar" style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <el-input v-model="query.name" placeholder="技术要求名称" style="width: 240px;" clearable />
            <el-select v-model="query.status" placeholder="状态" style="width: 150px;" clearable>
                <el-option label="全部" value="" />
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
            </el-select>
            <el-button type="primary" @click="getList">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="success" @click="openAdd">新增</el-button>
        </div>

        <el-table :data="tableData" border stripe style="width: 100%;" :loading="loading">
            <el-table-column label="ID" prop="Id" align="center" width="80" />
            <el-table-column label="技术要求名称" prop="Name" align="center" min-width="200" />
            <el-table-column label="备注" prop="Remark" align="center" min-width="250" show-overflow-tooltip />
            <el-table-column label="状态" align="center" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.Status === 1 ? 'success' : 'danger'">
                        {{ scope.row.Status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="创建人" prop="CreateBy" align="center" width="120" />
            <el-table-column label="创建时间" prop="CreateTime" align="center" width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.CreateTime) }}
                </template>
            </el-table-column>
            <el-table-column label="修改人" prop="UpdateBy" align="center" width="120" />
            <el-table-column label="修改时间" prop="UpdateTime" align="center" width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.UpdateTime) }}
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="150" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row.Id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination style="margin-top: 20px; justify-content: flex-end; display: flex;"
                       v-model:current-page="pagination.currentPage"
                       v-model:page-size="pagination.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="pagination.total"
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       layout="total, sizes, prev, pager, next, jumper" />

        <el-dialog v-model="dialogVisible"
                   :title="form.id ? '编辑技术要求' : '新增技术要求'"
                   width="500px"
                   :close-on-click-modal="false">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入技术要求名称" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark"
                              type="textarea"
                              :rows="3"
                              placeholder="请输入备注"
                              maxlength="500"
                              show-word-limit />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-switch v-model="form.status"
                               active-text="启用"
                               inactive-text="禁用"
                               :active-value="1"
                               :inactive-value="0" />
                </el-form-item>

                <template v-if="form.id > 0">
                    <el-form-item label="创建人">
                        <el-input v-model="form.createBy" disabled />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input :value="formatDate(form.createTime)" disabled />
                    </el-form-item>
                    <el-form-item label="修改人">
                        <el-input v-model="form.updateBy" disabled />
                    </el-form-item>
                    <el-form-item label="修改时间">
                        <el-input :value="formatDate(form.updateTime)" disabled />
                    </el-form-item>
                </template>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import axios from 'axios'

    const loading = ref(false)
    const query = reactive({ name: '', status: '' })
    const tableData = ref([])
    const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
    const dialogVisible = ref(false)
    const formRef = ref(null)

    const form = reactive({
        id: 0,
        name: '',
        remark: '',
        status: 1,
        createBy: '',
        createTime: '',
        updateBy: '',
        updateTime: ''
    })

    const rules = {
        name: [
            { required: true, message: '请输入技术要求名称', trigger: 'blur' },
            { max: 100, message: '名称长度不能超过100个字符', trigger: 'blur' }
        ]
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        const second = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }

    const getList = async () => {
        loading.value = true
        try {
            const res = await axios.get('/api/TechRequirement/list', {
                params: {
                    name: query.name || null,
                    status: query.status || null,
                    pageIndex: pagination.currentPage,
                    pageSize: pagination.pageSize
                }
            })
            if (res.data.Code === 200) {
                tableData.value = res.data.Data.list
                pagination.total = res.data.Data.total
            } else {
                ElMessage.error(res.data.Msg || '查询失败')
            }
        } catch (err) {
            ElMessage.error('查询失败')
        } finally {
            loading.value = false
        }
    }

    const resetQuery = () => {
        query.name = ''
        query.status = ''
        pagination.currentPage = 1
        getList()
    }

    const openAdd = () => {
        formRef.value?.resetFields()
        Object.assign(form, {
            id: 0,
            name: '',
            remark: '',
            status: 1,
            createBy: '',
            createTime: '',
            updateBy: '',
            updateTime: ''
        })
        dialogVisible.value = true
    }

    const openEdit = async (row) => {
        loading.value = true
        try {
            const res = await axios.get(`/api/TechRequirement/${row.Id}`)
            if (res.data.Code === 200) {
                const data = res.data.Data
                Object.assign(form, {
                    id: data.Id,
                    name: data.Name,
                    remark: data.Remark,
                    status: data.Status,
                    createBy: data.CreateBy,
                    createTime: data.CreateTime,
                    updateBy: data.UpdateBy,
                    updateTime: data.UpdateTime
                })
                dialogVisible.value = true
            }
        } catch {
            ElMessage.error('获取数据失败')
        } finally {
            loading.value = false
        }
    }

    // 🔥 修复：新增自动带用户名，彻底解决400
    const submitForm = async () => {
        await formRef.value?.validate()
        loading.value = true
        try {
            const userName = localStorage.getItem('username') || '测试管理员'

            const submitData = {
                Id: form.id,
                Name: form.name,
                Remark: form.remark,
                Status: form.status,
                CreateBy: form.id ? form.createBy : userName,
                CreateTime: form.id ? form.createTime : new Date().toISOString(),
                UpdateBy: userName,
                UpdateTime: new Date().toISOString()
            }

            let res
            if (form.id) {
                res = await axios.put('/api/TechRequirement/update', submitData)
            } else {
                res = await axios.post('/api/TechRequirement/add', submitData)
            }

            if (res.data.Code === 200) {
                ElMessage.success('操作成功')
                dialogVisible.value = false
                getList()
            } else {
                ElMessage.error(res.data.Msg)
            }
        } catch {
            ElMessage.error('操作失败')
        } finally {
            loading.value = false
        }
    }

    const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm('确认删除？', '警告', { type: 'warning' })
            const res = await axios.delete(`/api/TechRequirement/delete/${id}`)
            if (res.data.Code === 200) {
                ElMessage.success('删除成功')
                getList()
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('删除失败')
        }
    }

    const handleSizeChange = (size) => {
        pagination.pageSize = size
        pagination.currentPage = 1
        getList()
    }

    const handleCurrentChange = (page) => {
        pagination.currentPage = page
        getList()
    }

    onMounted(() => {
        getList()
    })
</script>

<style scoped>
    .page-container {
        background: #f5f5f5;
        min-height: calc(100vh - 84px);
    }
</style>