<template>
    <div class="column-config-container">
        <!-- 搜索+新增按钮 -->
        <div class="search-bar" style="margin-bottom: 20px;">
            <el-input v-model="searchKey"
                      placeholder="请输入检测项目/列名搜索"
                      style="width: 300px; margin-right: 10px;"
                      @keyup.enter="fetchColumnConfig" />
            <el-button type="primary" @click="fetchColumnConfig">搜索</el-button>
            <el-button type="success" @click="openAddDialog" style="margin-left: 10px;">新增列配置</el-button>
        </div>

        <!-- 列配置表格（新增：检测项目名称、检测要求名称列） -->
        <el-table :data="tableData"
                  border
                  style="width: 100%;"
                  v-loading="loading"
                  @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="itemCode" label="检测项目编码" width="120" />
            <el-table-column prop="itemNameCn" label="检测项目名称" width="120" /> <!-- 新增列 -->
            <el-table-column prop="reqCode" label="检测要求编码" width="150" />
            <el-table-column prop="reqNameCn" label="检测要求名称" width="150" /> <!-- 新增列 -->
            <el-table-column prop="colType" label="列类型" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.colType === 'Base' ? 'primary' : 'success'">
                        {{ scope.row.colType === 'Base' ? '基础列' : '扩展列' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="colNameCn" label="列中文名称" width="120" />
            <el-table-column prop="colProp" label="数据字段名" width="120" />
            <el-table-column prop="colSort" label="列排序" width="80" />
            <el-table-column prop="isShow" label="是否显示" width="100">
                <template #default="scope">
                    <el-switch v-model="scope.row.isShow" disabled />
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页（模拟，无真实分页） -->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="currentPage"
                       :page-sizes="[5, 10, 20, 50]"
                       :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total"
                       style="margin-top: 20px; text-align: right;">
        </el-pagination>

        <!-- 新增/编辑弹窗（新增：检测项目名称、检测要求名称表单项） -->
        <el-dialog v-model="dialogVisible"
                   :title="dialogType === 'add' ? '新增列配置' : '编辑列配置'"
                   width="600px">
            <el-form ref="formRef"
                     :model="formData"
                     :rules="formRules"
                     label-width="120px">
                <el-form-item label="检测项目编码" prop="itemCode">
                    <el-input v-model="formData.itemCode" placeholder="如TENSILE/COMPRESSION" />
                </el-form-item>
                <el-form-item label="检测项目名称" prop="itemNameCn">
                    <!-- 新增表单项 -->
                    <el-input v-model="formData.itemNameCn" placeholder="如拉伸试验/压缩试验" />
                </el-form-item>
                <el-form-item label="检测要求编码" prop="reqCode">
                    <el-input v-model="formData.reqCode" placeholder="如GB228-2023/ASTM E8" />
                </el-form-item>
                <el-form-item label="检测要求名称" prop="reqNameCn">
                    <!-- 新增表单项 -->
                    <el-input v-model="formData.reqNameCn" placeholder="如金属材料拉伸试验方法/ASTM拉伸标准" />
                </el-form-item>
                <el-form-item label="列类型" prop="colType">
                    <el-select v-model="formData.colType" placeholder="请选择列类型">
                        <el-option label="基础列" value="Base" />
                        <el-option label="扩展列" value="Extend" />
                    </el-select>
                </el-form-item>
                <el-form-item label="列中文名称" prop="colNameCn">
                    <el-input v-model="formData.colNameCn" placeholder="如试样编号/抗拉强度" />
                </el-form-item>
                <el-form-item label="数据字段名" prop="colProp">
                    <el-input v-model="formData.colProp" placeholder="如sampleCode/tensileStrength" />
                </el-form-item>
                <el-form-item label="列排序" prop="colSort">
                    <el-input-number v-model="formData.colSort" min="1" max="99" />
                </el-form-item>
                <el-form-item label="是否显示" prop="isShow">
                    <el-switch v-model="formData.isShow" />
                </el-form-item>
                <el-form-item label="列宽(px)" prop="colWidth">
                    <el-input-number v-model="formData.colWidth" min="80" max="500" />
                </el-form-item>
                <el-form-item label="字体" prop="cnFont">
                    <el-input v-model="formData.cnFont" placeholder="如Microsoft Yahei/Arial" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { columnConfigApi } from '@/api/columnConfig'

    // 响应式数据
    const loading = ref(false)
    const tableData = ref([])
    const searchKey = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectedRows = ref([])

    // 弹窗相关
    const dialogVisible = ref(false)
    const dialogType = ref('add') // add/edit
    const formRef = ref(null)
    const formData = reactive({
        id: 0,
        itemCode: '',
        itemNameCn: '', // 新增：检测项目名称
        reqCode: '',
        reqNameCn: '', // 新增：检测要求名称
        colType: '',
        colNameCn: '',
        colProp: '',
        colSort: 1,
        isShow: true,
        colWidth: 180,
        cnFont: 'Microsoft Yahei'
    })

    // 表单校验规则（新增：检测项目名称、检测要求名称校验）
    const formRules = reactive({
        itemCode: [{ required: true, message: '请输入检测项目编码', trigger: 'blur' }],
        itemNameCn: [{ required: true, message: '请输入检测项目名称', trigger: 'blur' }], // 新增校验
        reqCode: [{ required: true, message: '请输入检测要求编码', trigger: 'blur' }],
        reqNameCn: [{ required: true, message: '请输入检测要求名称', trigger: 'blur' }], // 新增校验
        colType: [{ required: true, message: '请选择列类型', trigger: 'change' }],
        colNameCn: [{ required: true, message: '请输入列中文名称', trigger: 'blur' }],
        colProp: [{ required: true, message: '请输入数据字段名', trigger: 'blur' }],
        colSort: [{ required: true, message: '请输入列排序', trigger: 'blur' }]
    })

    // 页面加载时获取所有列配置
    onMounted(() => {
        fetchColumnConfig()
    })

    // 获取列配置列表（更新模拟数据：补充检测项目/要求名称）
    const fetchColumnConfig = async () => {
        loading.value = true
        try {
            // 先尝试请求后端，失败则用模拟数据
            const res = await columnConfigApi.getAll()
            if (res.data.code === 200) {
                tableData.value = res.data.data
                total.value = res.data.data.length
            } else {
                ElMessage.error(res.data.msg)
                // 模拟数据兜底（补充检测项目/要求名称）
                tableData.value = [
                    {
                        id: 1,
                        itemCode: 'TENSILE',
                        itemNameCn: '拉伸试验', // 新增字段
                        reqCode: 'GB228-2023',
                        reqNameCn: '金属材料拉伸试验方法', // 新增字段
                        colType: 'Base',
                        colNameCn: '抗拉强度',
                        colProp: 'tensileStrength',
                        colSort: 1,
                        isShow: true,
                        colWidth: 180,
                        cnFont: 'Microsoft Yahei'
                    },
                    {
                        id: 2,
                        itemCode: 'COMPRESSION',
                        itemNameCn: '压缩试验', // 新增字段
                        reqCode: 'ASTM E8',
                        reqNameCn: 'ASTM金属材料拉伸试验标准', // 新增字段
                        colType: 'Extend',
                        colNameCn: '抗压强度',
                        colProp: 'compressionStrength',
                        colSort: 2,
                        isShow: true,
                        colWidth: 180,
                        cnFont: 'Microsoft Yahei'
                    }
                ]
                total.value = tableData.value.length
            }
        } catch (err) {
            ElMessage.warning('接口请求失败，显示模拟数据')
            // 模拟数据兜底（补充检测项目/要求名称）
            tableData.value = [
                {
                    id: 1,
                    itemCode: 'TENSILE',
                    itemNameCn: '拉伸试验',
                    reqCode: 'GB228-2023',
                    reqNameCn: '金属材料拉伸试验方法',
                    colType: 'Base',
                    colNameCn: '抗拉强度',
                    colProp: 'tensileStrength',
                    colSort: 1,
                    isShow: true,
                    colWidth: 180,
                    cnFont: 'Microsoft Yahei'
                },
                {
                    id: 2,
                    itemCode: 'COMPRESSION',
                    itemNameCn: '压缩试验',
                    reqCode: 'ASTM E8',
                    reqNameCn: 'ASTM金属材料拉伸试验标准',
                    colType: 'Extend',
                    colNameCn: '抗压强度',
                    colProp: 'compressionStrength',
                    colSort: 2,
                    isShow: true,
                    colWidth: 180,
                    cnFont: 'Microsoft Yahei'
                }
            ]
            total.value = tableData.value.length
        } finally {
            loading.value = false
        }
    }

    // 新增弹窗（重置时补充检测项目/要求名称）
    const openAddDialog = () => {
        dialogType.value = 'add'
        // 重置表单
        formRef.value?.resetFields()
        Object.assign(formData, {
            id: 0,
            itemCode: '',
            itemNameCn: '', // 新增字段重置
            reqCode: '',
            reqNameCn: '', // 新增字段重置
            colType: '',
            colNameCn: '',
            colProp: '',
            colSort: 1,
            isShow: true,
            colWidth: 180,
            cnFont: 'Microsoft Yahei'
        })
        dialogVisible.value = true
    }

    // 编辑弹窗（填充时补充检测项目/要求名称）
    const openEditDialog = (row) => {
        dialogType.value = 'edit'
        // 填充表单数据
        Object.assign(formData, {
            id: row.id,
            itemCode: row.itemCode,
            itemNameCn: row.itemNameCn, // 新增字段填充
            reqCode: row.reqCode,
            reqNameCn: row.reqNameCn, // 新增字段填充
            colType: row.colType,
            colNameCn: row.colNameCn,
            colProp: row.colProp,
            colSort: row.colSort,
            isShow: row.isShow,
            colWidth: row.colWidth || 180,
            cnFont: row.cnFont || 'Microsoft Yahei'
        })
        dialogVisible.value = true
    }

    // 提交新增/编辑（逻辑不变，自动携带新增字段）
    const handleSubmit = async () => {
        try {
            // 表单校验
            await formRef.value.validate()
            loading.value = true

            if (dialogType.value === 'add') {
                // 新增
                const res = await columnConfigApi.add(formData)
                if (res.data.code === 200) {
                    ElMessage.success('新增成功')
                    dialogVisible.value = false
                    fetchColumnConfig() // 刷新列表
                } else {
                    ElMessage.error(res.data.msg)
                }
            } else {
                // 编辑
                const res = await columnConfigApi.update(formData.id, formData)
                if (res.data.code === 200) {
                    ElMessage.success('编辑成功')
                    dialogVisible.value = false
                    fetchColumnConfig() // 刷新列表
                } else {
                    ElMessage.error(res.data.msg)
                }
            }
        } catch (err) {
            ElMessage.error(`操作失败：${err.message}`)
        } finally {
            loading.value = false
        }
    }

    // 删除（逻辑不变）
    const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm(
                '此操作将永久删除该列配置, 是否继续?',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
            const res = await columnConfigApi.delete(id)
            if (res.data.code === 200) {
                ElMessage.success('删除成功')
                fetchColumnConfig() // 刷新列表
            } else {
                ElMessage.error(res.data.msg)
            }
        } catch (err) {
            ElMessage.info('已取消删除')
        }
    }

    // 分页相关（模拟，逻辑不变）
    const handleSizeChange = (val) => {
        pageSize.value = val
        fetchColumnConfig()
    }
    const handleCurrentChange = (val) => {
        currentPage.value = val
        fetchColumnConfig()
    }
    const handleSelectionChange = (val) => {
        selectedRows.value = val
    }
</script>

<!-- scoped 样式：组件自身布局 -->
<style scoped>
    .column-config-container {
        padding: 20px;
        background: #fff;
    }

    .search-bar {
        display: flex;
        align-items: center;
    }
</style>

<!-- 非 scoped 样式：强制覆盖 Element Plus 组件字体 -->
<style>
    /* 覆盖所有 Element Plus 组件的字体 */
    .el-button, .el-input, .el-table, .el-table th, .el-table td,
    .el-tag, .el-pagination, .el-dialog, .el-form, .el-form-item__label,
    .el-select, .el-option, .el-input-number, .el-switch, .el-message-box {
        font-family: "Microsoft Yahei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif !important;
    }
    /* 覆盖弹窗、提示框文字 */
    .el-dialog__title, .el-message-box__title, .el-message-box__content {
        font-family: "Microsoft Yahei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif !important;
    }
</style>