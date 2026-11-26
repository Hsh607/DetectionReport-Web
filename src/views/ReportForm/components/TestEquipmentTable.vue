<template>
  <div>
    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
      4、检测设备/Test Equipment
    </h3>
    <el-button
      type="primary"
      size="small"
      style="margin-bottom: 10px"
      :disabled="isDetail"
      @click="emit('addRow')"
    >
      + 新增行
    </el-button>
    <!-- 批量选择按钮 -->
    <el-button
      type="success"
      size="small"
      style="margin-bottom: 10px; margin-left: 8px"
      :disabled="isDetail"
      @click="openBatchSelectDialog"
    >
      批量选择设备
    </el-button>

    <!-- 主表格 -->
    <el-table
      :data="testEquipment"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        width="80"
        align="center"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            序号<br>
            <span style="font-size: 12px; color: #666;">No.</span>
          </div>
        </template>
        <template #default="scope">
          <span style="color: #606266; font-weight: 500;">
            {{ scope.$index + 1 }}
          </span>
        </template>
      </el-table-column>

      <el-table-column min-width="220">
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            设备名称<br>
            <span style="font-size: 12px; color: #666;">Name of Test Equipment</span>
          </div>
        </template>
        <template #default="scope">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="line-height: 1.4;">
              <div>{{ splitEquipmentName(scope.row.name).zh || '未选择设备' }}</div>
              <div style="font-size: 12px; color: #666;">
                {{ splitEquipmentName(scope.row.name).en }}
              </div>
            </div>
            <el-button
              type="text"
              size="small"
              :disabled="isDetail"
              style="margin-left: 8px; flex-shrink: 0;"
              @click="openSelectDialog(scope.$index)"
            >
              <el-icon><Search /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="model"
        min-width="120"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            型号<br>
            <span style="font-size: 12px; color: #666;">Model</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-model="scope.row.model"
            readonly
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="eqNo"
        min-width="150"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            设备编号<br>
            <span style="font-size: 12px; color: #666;">Equipment No.</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-model="scope.row.eqNo"
            readonly
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="validUntil"
        min-width="180"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            校准有效期至<br>
            <span style="font-size: 12px; color: #666;">Calibration Validity Period</span>
          </div>
        </template>
        <template #default="scope">
          <el-date-picker
            v-model="scope.row.validUntil"
            type="date"
            size="small"
            style="width: 100%"
            :disabled="isDetail"
            readonly
          />
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="80"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            type="link"
            color="danger"
            size="small"
            :disabled="testEquipment.length <= 1 || isDetail"
            @click="emit('deleteRow', scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 单选设备弹窗（修复：补全prop属性） -->
    <el-dialog
      v-model="dialogVisible"
      title="选择检测设备"
      width="80%"
      top="10vh"
      @close="resetSelect"
    >
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备名称/型号/编号"
        prefix-icon="Search"
        style="margin-bottom: 10px;"
        clearable
      />

      <el-table
        ref="tableRef"
        :data="filteredEquipmentList"
        border
        stripe
        height="400"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        :cell-style="{ textAlign: 'center' }"
        @row-click="handleSelectEquipment"
      >
        <!-- 设备名称（带prop+换行） -->
        <el-table-column
          prop="name"
          min-width="200"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              设备名称<br>
              <span style="font-size: 12px;">Name of Test Equipment</span>
            </div>
          </template>
          <template #default="scope">
            <div style="line-height: 1.4; text-align: center;">
              <div>{{ splitEquipmentName(scope.row.name).zh }}</div>
              <div style="font-size: 12px; color: #666;">
                {{ splitEquipmentName(scope.row.name).en }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 型号（补回prop="model"） -->
        <el-table-column
          prop="model"
          min-width="150"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              型号<br>
              <span style="font-size: 12px;">Model</span>
            </div>
          </template>
        </el-table-column>
        <!-- 设备编号（补回prop="eqNo"） -->
        <el-table-column
          prop="eqNo"
          min-width="150"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              设备编号<br>
              <span style="font-size: 12px;">Equipment No.</span>
            </div>
          </template>
        </el-table-column>
        <!-- 校准有效期至（补回prop="validUntil"） -->
        <el-table-column
          prop="validUntil"
          min-width="180"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              校准有效期至<br>
              <span style="font-size: 12px;">Calibration Validity Period</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量选择设备弹窗（修复：补全prop属性） -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量选择检测设备"
      width="80%"
      top="10vh"
      @close="resetBatchSelect"
    >
      <el-input
        v-model="batchSearchKeyword"
        placeholder="搜索设备名称/型号/编号"
        prefix-icon="Search"
        style="margin-bottom: 10px;"
        clearable
      />

      <el-table
        ref="batchTableRef"
        :data="batchFilteredEquipmentList"
        border
        stripe
        height="400"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        :cell-style="{ textAlign: 'center' }"
        @selection-change="handleBatchSelection"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
        <!-- 设备名称（带prop+换行） -->
        <el-table-column
          prop="name"
          min-width="200"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              设备名称<br>
              <span style="font-size: 12px;">Name of Test Equipment</span>
            </div>
          </template>
          <template #default="scope">
            <div style="line-height: 1.4; text-align: center;">
              <div>{{ splitEquipmentName(scope.row.name).zh }}</div>
              <div style="font-size: 12px; color: #666;">
                {{ splitEquipmentName(scope.row.name).en }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 型号（补回prop="model"） -->
        <el-table-column
          prop="model"
          min-width="150"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              型号<br>
              <span style="font-size: 12px;">Model</span>
            </div>
          </template>
        </el-table-column>
        <!-- 设备编号（补回prop="eqNo"） -->
        <el-table-column
          prop="eqNo"
          min-width="150"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              设备编号<br>
              <span style="font-size: 12px;">Equipment No.</span>
            </div>
          </template>
        </el-table-column>
        <!-- 校准有效期至（补回prop="validUntil"） -->
        <el-table-column
          prop="validUntil"
          min-width="180"
          align="center"
        >
          <template #header>
            <div style="line-height: 1.4;">
              校准有效期至<br>
              <span style="font-size: 12px;">Calibration Validity Period</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmBatchSelect"
          >确认添加选中设备</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
    import { ref, computed, defineProps, defineEmits } from 'vue'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'
    import { Search } from '@element-plus/icons-vue'

    const props = defineProps({
        testEquipment: Array,
        isDetail: Boolean
    })

    const emit = defineEmits(['addRow', 'deleteRow', 'equipmentSelect'])

    // 设备名称中英文拆分工具函数
    const splitEquipmentName = (name) => {
        if (!name) return { zh: '', en: '' }
        const zhPattern = /^([\u4e00-\u9fa5]+)/
        const zhMatch = name.match(zhPattern)
        if (zhMatch) {
            const zhPart = zhMatch[1]
            const enPart = name.slice(zhPart.length).trim()
            return { zh: zhPart, en: enPart }
        }
        return { zh: name, en: '' }
    }

    // 单选弹窗逻辑
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

    async function getEquipmentList() {
        try {
            const res = await axios.get('/api/yunbiao/equipment-list')
            equipmentList.value = (res.data || []).map(item => ({
                name: item["设备名称"] || '',
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

    // 批量选择逻辑
    const batchDialogVisible = ref(false)
    const batchSearchKeyword = ref('')
    const batchTableRef = ref(null)
    const selectedBatchEquipments = ref([])

    const batchFilteredEquipmentList = computed(() => {
        if (!batchSearchKeyword.value) return equipmentList.value
        const keyword = batchSearchKeyword.value.toLowerCase()
        return equipmentList.value.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.model.toLowerCase().includes(keyword) ||
            item.eqNo.toLowerCase().includes(keyword)
        )
    })

    async function openBatchSelectDialog() {
        batchDialogVisible.value = true
        await getEquipmentList()
    }

    function handleBatchSelection(val) {
        selectedBatchEquipments.value = val
    }

    function confirmBatchSelect() {
        if (selectedBatchEquipments.value.length === 0) {
            ElMessage.warning('请选择设备')
            return
        }

        selectedBatchEquipments.value.forEach(item => {
            emit('addRow')
            const lastIndex = props.testEquipment.length - 1
            emit('equipmentSelect', { index: lastIndex, equipment: item })
        })

        ElMessage.success(`成功添加 ${selectedBatchEquipments.value.length} 台设备`)
        batchDialogVisible.value = false
        resetBatchSelect()
    }

    function resetBatchSelect() {
        batchSearchKeyword.value = ''
        selectedBatchEquipments.value = []
        if (batchTableRef.value) batchTableRef.value.clearSelection()
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