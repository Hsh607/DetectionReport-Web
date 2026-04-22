<template>
    <div>
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">4、检测设备/Test Equipment</h3>
        <el-button type="primary"
                   size="small"
                   style="margin-bottom: 10px"
                   @click="emit('addRow')"
                   :disabled="isDetail">+ 新增行</el-button>

        <el-table :data="testEquipment" border stripe style="width: 100%">
            <el-table-column label="序号/No." width="80" align="center">
                <template #default="scope">
                    <span style="color: #606266; font-weight: 500;">
                        {{ scope.$index + 1 }}
                    </span>
                </template>
            </el-table-column>

            <!-- ✅ 修复：文本 + 放大镜图标 -->
            <el-table-column label="设备名称" prop="name" min-width="220">
                <template #default="scope">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            {{ scope.row.name || "未选择设备" }}
                        </span>
                        <el-button type="text" size="small" @click="openSelectDialog(scope.$index)" :disabled="isDetail" style="margin-left: 8px;">
                            <el-icon><Search /></el-icon>
                        </el-button>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="型号/Model" prop="model" min-width="120">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.model" readonly size="small" />
                </template>
            </el-table-column>

            <el-table-column label="设备编号" prop="eqNo" min-width="150">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.eqNo" readonly size="small" />
                </template>
            </el-table-column>

            <el-table-column label="校准有效期至" prop="validUntil" min-width="180">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-date-picker v-model="scope.row.validUntil"
                                    type="date"
                                    size="small"
                                    style="width: 100%"
                                    :disabled="isDetail"
                                    readonly />
                </template>
            </el-table-column>

            <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                    <el-button type="link"
                               color="danger"
                               size="small"
                               @click="emit('deleteRow', scope.$index)"
                               :disabled="testEquipment.length <= 1 || isDetail">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 设备选择弹窗 -->
        <el-dialog v-model="dialogVisible"
                   title="选择检测设备"
                   width="80%"
                   top="10vh"
                   @close="resetSelect">
            <el-input v-model="searchKeyword"
                      placeholder="搜索设备名称/型号/编号"
                      prefix-icon="Search"
                      style="margin-bottom: 10px;"
                      clearable />

            <el-table :data="filteredEquipmentList"
                      border
                      stripe
                      ref="tableRef"
                      @row-click="handleSelectEquipment"
                      height="400"
                      :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
                      :cell-style="{ textAlign: 'center' }">
                <el-table-column label="设备名称" prop="name" min-width="200" align="center" />
                <el-table-column label="型号" prop="model" min-width="150" align="center" />
                <el-table-column label="设备编号" prop="eqNo" min-width="150" align="center" />
                <el-table-column label="校准有效期至" prop="validUntil" min-width="180" align="center" />
            </el-table>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    /* globals defineProps, defineEmits */
    import { ref, computed } from 'vue'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'
    // 🔥 修复：导入放大镜图标
    import { Search } from '@element-plus/icons-vue'

    defineProps({
        testEquipment: Array,
        isDetail: Boolean
    })

    const emit = defineEmits(['addRow', 'deleteRow', 'equipmentSelect'])

    const dialogVisible = ref(false)
    const equipmentList = ref([])
    const searchKeyword = ref('')
    const filteredEquipmentList = computed(() => {
        if (!searchKeyword.value) return equipmentList.value
        const keyword = searchKeyword.value.toLowerCase()
        return equipmentList.value.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.model.toLowerCase().includes(keyword) ||
            item.eqNo.toLowerCase().includes(keyword)
        )
    })
    const currentRowIndex = ref(null)
    const tableRef = ref(null)

    const getChineseOnly = (str) => {
        if (!str) return ''
        return (str.match(/[\u4e00-\u9fa5]/g) || []).join('')
    }

    async function getEquipmentList() {
        try {
            const res = await axios.get('/api/yunbiao/equipment-list')
            equipmentList.value = (res.data || []).map(item => ({
                name: getChineseOnly(item["设备名称"]),
                model: item["设备型号"] || '',
                eqNo: item["设备编号"] || '',
                validUntil: item["标准有效期至"]?.split(' ')[0] || ''
            }))
        } catch (err) {
            ElMessage.error('获取设备列表失败')
            console.error(err)
        }
    }

    async function openSelectDialog(index) {
        currentRowIndex.value = index
        dialogVisible.value = true
        await getEquipmentList()
    }

    function handleSelectEquipment(row) {
        ElMessage.success('设备选择成功')
        emit('equipmentSelect', { index: currentRowIndex.value, equipment: row })
        dialogVisible.value = false
        resetSelect()
    }

    function resetSelect() {
        currentRowIndex.value = null
        searchKeyword.value = ''
        if (tableRef.value) tableRef.value.clearSelection()
    }
</script>

<style scoped>
    .dialog-footer {
        text-align: right;
    }

    :deep(.el-table tbody tr:hover) {
        background-color: #ecf5ff !important;
        cursor: pointer;
    }
</style>