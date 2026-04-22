<template>
    <div class="report-container" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">
            {{ isDetail ? '报告详情' : isEdit ? '编辑检测报告' : '新增检测报告' }}
        </h2>

        <el-tabs v-model="activeTab" type="card" style="margin-bottom: 30px;">
            <el-tab-pane label="报告首页" name="home">
                <HomeTab :home-form="homeForm" :is-detail="isDetail" />
            </el-tab-pane>

            <el-tab-pane label="报告内容" name="content">
                <ContentTab :fixed-form="fixedForm"
                            :test-projects="testProjects"
                            :is-detail="isDetail"
                            :env-list="envList"
                            :tech-spec-list="techSpecList"
                            @open-inspection-dialog="openInspectionDialog"
                            @add-test-env-row="addTestEnvRow"
                            @delete-test-env-row="deleteTestEnvRow"
                            @add-test-equipment-row="addTestEquipmentRow"
                            @delete-test-equipment-row="deleteTestEquipmentRow"
                            @add-table-row="addTableRow"
                            @delete-table-row="deleteTableRow"
                            @add-photo-row="addPhotoRow"
                            @remove-photo-row="removePhotoRow"
                            @pick-photo="pickPhoto"
                            @project-code-change="handleProjectCodeChange"
                            @tech-spec-change="handleTechSpecChange"
                            @equipment-select="handleEquipmentSelect"/>
            </el-tab-pane>
        </el-tabs>

        <div style="text-align: center; margin-top: 30px; gap:20px; display: flex; justify-content: center; flex-wrap: wrap;">
            <el-button @click="back">返回列表</el-button>
            <el-button type="primary" size="large" @click="submitReport" :disabled="isDetail || loading">保存报告</el-button>
            <el-button type="info" size="large" @click="printPreview" :loading="printLoading">打印预览</el-button>
            <el-button type="success" size="large" @click="exportToWord" :loading="exportLoading">导出Word报告</el-button>
        </div>

        <InspectionDialog ref="inspectionDialogRef" @confirm="selectInspection" />
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    import HomeTab from './components/HomeTab.vue'
    import ContentTab from './components/ContentTab.vue'
    import InspectionDialog from './components/InspectionDialog.vue'
    import { useForm } from './composables/useForm'
    import { useTestProject } from './composables/useTestProject'
    import { useExport } from './composables/useExport'
    import { usePrint } from './composables/usePrint'
    console.log('usePrint:', usePrint)   // 应该输出一个函数

    const router = useRouter()
    const route = useRoute()

    const id = route.query.id
    const isDetail = !!route.query.detail
    const isEdit = !!id && !isDetail

    const activeTab = ref('content')
    const loading = ref(false)

    // 环境列表（用于检测环境表格）
    const envList = ref([])

    // 使用 composables
    const {
        homeForm,
        fixedForm,
        addTestEnvRow,
        deleteTestEnvRow,
        addTestEquipmentRow,
        deleteTestEquipmentRow,
        submitReport: submitReportAPI,
        loadReportDetail
    } = useForm()

    const {
        testProjects,
        techSpecList,
        getTechSpecList,
        batchGetAllProjectData,
        getTestReferenceByOrderNo,
        getInspectionListByOrderNo,
        getAgreementByOrderNo,
        setDefaultTechSpecForAllRows,
        addTableRow,
        deleteTableRow,
        addPhotoRow,
        removePhotoRow,
        pickPhoto,
        onProjectCodeChange: onProjectCodeChangeFn,
        onTechSpecChange: onTechSpecChangeFn
    } = useTestProject()

    const { exportLoading, exportToWord } = useExport()

    // 报检单对话框引用
    const inspectionDialogRef = ref(null)

    // 打开报检单选择对话框
    function openInspectionDialog() {
        if (isDetail) {
            ElMessage.warning('详情页不可选择报检单')
            return
        }
        inspectionDialogRef.value?.open()
    }

    // 选择报检单后的回调
    async function selectInspection(row) {
        fixedForm.inspectionOrderNo = row['报检单号'] || ''
        fixedForm.orderNo = row['委托单号'] || ''
        ElMessage.success('选择成功')

        if (fixedForm.orderNo && !isDetail && !isEdit) {
            await getTestReferenceByOrderNo(fixedForm.orderNo)
            const itemList = await getInspectionListByOrderNo(fixedForm.orderNo, fixedForm.inspectionOrderNo)
            if (itemList && itemList.length) {
                // 更新 testEnv 和 testProjects 占位
                fixedForm.testEnv = itemList.map(item => ({
                    item: (item["项目名称"] || "").split("\n")[0]?.trim() || "",
                    reqTemp: item["温度要求"] || "",
                    testTemp: "",
                    reqHumidity: item["湿度要求"] || "",
                    testHumidity: "",
                    projectCode: item["项目编码"] || "",
                    techSpecCode: "",
                    techSpecName: ""
                }))
                testProjects.value = fixedForm.testEnv.map(() => ({
                    projectCode: '',
                    techSpecCode: '',
                    techSpecName: '',
                    schemeConfig: null,
                    showPhotoArea: false,
                    reportData: {
                        Header: { TestReference: '', TestReferenceEn: '' },
                        testReference: '',
                        tableData: [],
                        techRequirement: {},
                        bottomRequirement: {},
                        conclusion: '',
                        note: '',
                        reviewer: '',
                        approval: {},
                        paramValues: {},
                        photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
                    }
                }))
            }
            const agreement = await getAgreementByOrderNo(fixedForm.orderNo)
            if (agreement) {
                fixedForm.materialSpec = agreement.技术条件 || ''
                fixedForm.sampleName = agreement.样品名称 || ''
                fixedForm.sampleMaterial = agreement.牌号 || ''
                fixedForm.sampleSpec = agreement.规格 || ''
                fixedForm.additionalInfo = agreement.其他信息 || ''
                const rawClientName = agreement.委托单位 || ''
                const clientNameParts = rawClientName.split(/\\r?\\n/).map(p => p.trim()).filter(Boolean)
                homeForm.ClientName = clientNameParts.join('\\n')
                const rawClientAddr = agreement.委托单位地址 || ''
                const addrParts = rawClientAddr.split(/\\r?\\n/).map(p => p.trim()).filter(Boolean)
                homeForm.ClientAddress = addrParts.join('\\n')
            }
            await batchGetAllProjectData(fixedForm.orderNo, fixedForm.inspectionOrderNo, fixedForm.testEnv)
            await setDefaultTechSpecForAllRows(fixedForm.testEnv, testProjects)
        }
    }

    // 包装事件处理函数，传递正确的参数
    function handleProjectCodeChange({ index, code }) {
        const row = fixedForm.testEnv[index]
        const env = envList.value.find(item => item.EnvCode === code)
        if (env) {
            row.item = env.ProjectName
            row.reqTemp = env.RequiredTemperature
            row.reqHumidity = env.RequiredHumidity
        }
        onProjectCodeChangeFn(index, code, fixedForm.testEnv, testProjects)
    }


    function handleTechSpecChange({ index, specId }) {
        const row = fixedForm.testEnv[index]
        const tech = techSpecList.value.find(t => t.Id === specId)
        if (tech) row.techSpecName = tech.Name
        onTechSpecChangeFn(index, specId, fixedForm.testEnv, testProjects)
    }

    // 保存报告
    async function submitReport() {
        if (!fixedForm.inspectionOrderNo) {
            ElMessage.warning('请填写报检单号')
            return
        }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) {
            ElMessage.warning('请完善所有检测环境')
            return
        }
        loading.value = true
        try {
            const success = await submitReportAPI(testProjects.value, isEdit, id)
            if (success) back()
        } finally {
            loading.value = false
        }
    }

    function back() {
        router.push('/report/list')
    }

    // 加载环境项目列表
    async function loadEnvList() {
        const envRes = await axios.get('/api/DetectionConfig/env-project-list')
        if (envRes.data.Success) envList.value = envRes.data.Data
    }

    // 解构
    const { printLoading, printPreview: printPreviewFn } = usePrint()

    // 包装一下，传递所需数据
    async function printPreview() {
        await printPreviewFn(homeForm, fixedForm, testProjects.value)
    }

    // 监听 iframe 内预览页面的关闭消息



    function handleEquipmentSelect({ index, equipment }) {
        if (!fixedForm.testEquipment[index]) return;
        fixedForm.testEquipment[index] = {
            ...fixedForm.testEquipment[index],
            name: equipment.name,
            model: equipment.model,
            eqNo: equipment.eqNo,
            validUntil: equipment.validUntil
        };
    }


    onMounted(async () => {
        // 原有的加载逻辑
        await getTechSpecList()
        await loadEnvList()
        if (isEdit || isDetail) {
            await loadReportDetail(id, testProjects, fixedForm, homeForm)
        }

        // 添加 message 事件监听（用于关闭打印预览 iframe）
    })

    // 组件卸载时移除监听，避免内存泄漏
    onUnmounted(() => {
    })
</script>

<style scoped>
    .report-container .el-form-item {
        margin-bottom: 15px;
    }

    :deep(.client-input .el-textarea__inner) {
        min-height: 80px !important;
        line-height: 1.8 !important;
        padding: 10px 12px !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        text-align: left !important;
        overflow-y: auto !important;
    }

    :deep(.el-input__wrapper),
    :deep(.el-date-picker .el-input__wrapper) {
        min-height: 36px !important;
        display: flex;
        align-items: center;
        padding: 0 12px !important;
    }

    :deep(.el-descriptions__cell) {
        padding: 12px 16px !important;
        min-height: 48px !important;
    }

    :deep(.el-descriptions__label) {
        width: 220px !important;
        line-height: 36px !important;
    }

    :deep(.param-input .el-input__wrapper) {
        border: none !important;
        text-align: center !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
    }

    :deep(.param-input .el-input__inner) {
        text-align: center !important;
        padding: 0 !important;
    }
</style>