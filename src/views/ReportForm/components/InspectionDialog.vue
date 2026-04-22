<template>
    <el-dialog v-model="visible" title="选择报检单号" width="90%" :close-on-click-modal="false" destroy-on-close :append-to-body="true">
        <div style="display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; align-items: center;">
            <el-input v-model="searchForm.inspectionNo" placeholder="报检单号" style="width: 180px;" clearable />
            <el-input v-model="searchForm.orderNo" placeholder="委托单号" style="width: 180px;" clearable />
            <el-input v-model="searchForm.inspector" placeholder="报检人" style="width: 160px;" clearable />
            <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 280px;" />
            <el-button type="primary" @click="loadInspection">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="insList" border stripe style="width:100%;" @row-dblclick="selectInspection">
            <el-table-column label="报检单号" prop="报检单号" min-width="180" align="center" />
            <el-table-column label="报检人" prop="报检人" min-width="120" align="center" />
            <el-table-column label="报检日期" prop="报检日期" min-width="180" align="center" />
            <el-table-column label="委托单号" prop="委托单号" min-width="180" align="center" />
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="selectInspection(row)">选择</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div style="display: flex; justify-content: flex-end; margin-top:15px;">
            <el-pagination v-model:current-page="insPage"
                           v-model:page-size="insSize"
                           :page-sizes="[10,20,50,100]"
                           :total="insTotal"
                           layout="total,sizes,prev,pager,next,jumper"
                           @size-change="loadInspection"
                           @current-change="loadInspection" />
        </div>

        <template #footer>
            <div style="display:flex; justify-content:center; gap:20px;">
                <el-button @click="visible = false">取消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
    /* eslint-disable */
    import { ref, reactive } from 'vue'
    import { getInspectionList } from '@/api/yunbiaoAuth'

    const visible = ref(false)
    const emit = defineEmits(['confirm'])

    const insList = ref([])
    const insPage = ref(1)
    const insSize = ref(10)
    const insTotal = ref(0)
    const fullInsList = ref([])

    const searchForm = reactive({
        inspectionNo: '',
        orderNo: '',
        inspector: '',
        dateRange: []
    })

    async function loadInspection() {
        try {
            if (fullInsList.value.length === 0) {
                const res = await getInspectionList()
                fullInsList.value = res.list
                insTotal.value = res.total
            }

            let list = [...fullInsList.value]

            if (searchForm.inspectionNo)
                list = list.filter(x => (x['报检单号'] || '').includes(searchForm.inspectionNo))
            if (searchForm.orderNo)
                list = list.filter(x => (x['委托单号'] || '').includes(searchForm.orderNo))
            if (searchForm.inspector)
                list = list.filter(x => (x['报检人'] || '').includes(searchForm.inspector))

            if (searchForm.dateRange?.length === 2) {
                const start = searchForm.dateRange[0].getTime()
                const end = searchForm.dateRange[1].getTime()
                list = list.filter(x => {
                    if (!x['报检日期']) return false
                    const time = new Date(x['报检日期']).getTime()
                    return time >= start && time <= end
                })
            }

            insTotal.value = list.length
            const startIdx = (insPage.value - 1) * insSize.value
            const endIdx = startIdx + insSize.value
            insList.value = list.slice(startIdx, endIdx)
        } catch (err) {
            console.error(err)
        }
    }

    function resetSearch() {
        searchForm.inspectionNo = ''
        searchForm.orderNo = ''
        searchForm.inspector = ''
        searchForm.dateRange = []
        insPage.value = 1
        loadInspection()
    }

    function selectInspection(row) {
        emit('confirm', row)
        visible.value = false
    }

    function open() {
        visible.value = true
        resetSearch()
    }

    defineExpose({ open })
</script>