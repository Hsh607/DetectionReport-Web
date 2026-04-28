<template>
    <div class="report-container" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">
            {{ isDetail ? '报告详情' : isEdit ? '编辑检测报告' : '新增检测报告' }}
        </h2>

        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; justify-content: center;">
            <el-switch v-model="isCNASReport"
                       active-text="CNAS报告"
                       inactive-text="普通报告" />
            <el-input v-model="watermarkText"
                      placeholder="请输入水印文字"
                      style="width: 220px;"
                      clearable />
        </div>

        <el-tabs v-model="activeTab" type="card" style="margin-bottom: 30px;">
            <el-tab-pane label="报告首页" name="home">
                <HomeTab :home-form="homeForm" :is-detail="isDetail" />
            </el-tab-pane>

            <el-tab-pane label="报告内容" name="content">
                <ContentTab ref="reportRef"
                            v-model:fixed-form="fixedForm"
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
                            @equipment-select="handleEquipmentSelect" />
            </el-tab-pane>
        </el-tabs>

        <div class="action-buttons">
            <el-button size="large" @click="back">返回列表</el-button>
            <el-button type="primary" size="large" @click="submitReport" :disabled="isDetail || loading">保存报告</el-button>

            <!-- 预览 PDF -->
            <el-button type="info" size="large" @click="openPdfPreview" :loading="previewLoading">PDF预览</el-button>
            <!-- 导出 PDF -->
            <el-button type="warning" size="large" @click="exportPdfDownload" :loading="exportLoading">导出PDF</el-button>

            <el-button type="success" size="large" @click="exportWord" :loading="exportLoading">导出Word报告</el-button>
        </div>

        <InspectionDialog ref="inspectionDialogRef" @confirm="selectInspection" />

        <el-dialog v-model="previewVisible"
                   title="PDF 预览"
                   width="90vw"
                   height="85vh"
                   style="height:85vh;display:flex;flex-direction:column;">
            <iframe ref="pdfIframe"
                    style="width:100%;height:100%;border:none;flex:1;"
                    frameborder="0"
                    scrolling="auto"></iframe>
        </el-dialog>
    </div>
</template>s

<script setup>
    import { ref, onMounted, } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    import HomeTab from './components/HomeTab.vue'
    import ContentTab from './components/ContentTab.vue'
    import InspectionDialog from './components/InspectionDialog.vue'
    import { useForm } from './composables/useForm'
    import { useTestProject } from './composables/useTestProject'
    import { generatePrintHTML } from './utils/printHelper'

    const reportRef = ref(null)
    const router = useRouter()
    const route = useRoute()

    const id = route.query.id
    const isDetail = !!route.query.detail
    const isEdit = !!id && !isDetail

    const activeTab = ref('content')
    const loading = ref(false)
    const exportLoading = ref(false)
    const previewLoading = ref(false)

    const isCNASReport = ref(false)
    const watermarkText = ref('NORMAL TESTING TECHNOLOGY')

    const previewVisible = ref(false)
    const pdfIframe = ref(null)

    const envList = ref([])

    const {
        homeForm, fixedForm,
        addTestEnvRow, deleteTestEnvRow,
        addTestEquipmentRow, deleteTestEquipmentRow,
        submitReport: submitReportAPI, loadReportDetail
    } = useForm()

    const {
        testProjects, techSpecList,
        getTechSpecList, batchGetAllProjectData,
        getTestReferenceByOrderNo, getInspectionListByOrderNo, getAgreementByOrderNo,
        setDefaultTechSpecForAllRows,
        addTableRow, deleteTableRow,
        addPhotoRow, removePhotoRow, pickPhoto,
        onProjectCodeChange: onProjectCodeChangeFn,
        onTechSpecChange: onTechSpecChangeFn
    } = useTestProject()

    // ------------------------------
    // 图片转 DataURL（必须保留，保证图片显示）
    // ------------------------------
    async function urlToDataURL(url) {
        if (!url) return ''
        if (url.startsWith('blob:')) {
            try {
                const blob = await fetch(url).then(r => r.blob())
                return new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result)
                    reader.readAsDataURL(blob)
                })
            } catch (err) {
                return ''
            }
        }
        return url
    }

    // ------------------------------
    // 【核心】构建 HTML
    // ------------------------------
    async function buildReportHtml() {
        const projectsCopy = JSON.parse(JSON.stringify(testProjects.value))
        const photoPromises = []
        for (const project of projectsCopy) {
            const rows = project.reportData?.photoRows
            if (rows) {
                rows.forEach(row => {
                    if (row.LeftUrl) photoPromises.push(urlToDataURL(row.LeftUrl).then(d => row.LeftDataURL = d))
                    if (row.RightUrl) photoPromises.push(urlToDataURL(row.RightUrl).then(d => row.RightDataURL = d))
                })
            }
        }
        await Promise.all(photoPromises)
        return generatePrintHTML(homeForm, fixedForm, projectsCopy, watermarkText.value, isCNASReport.value)
    }

    async function openPdfPreview() {
        previewLoading.value = true
        try {
            const html = await buildReportHtml()

            // 调用后端生成 PDF 并获取预览地址
            const res = await axios.post('/api/DetectionReport/PreviewPdf', {
                htmlContent: html,
                reportNo: homeForm.ReportNo || '',
                isCNAS: isCNASReport.value,
                watermarkText: watermarkText.value
            })

            if (!res.data.success) {
                ElMessage.error('PDF 生成失败：' + res.data.msg)
                return
            }

            // 关键：用 window.open 直接打开 PDF 地址，而不是 iframe
            window.open(res.data.pdfUrl, '_blank')

        } catch (e) {
            console.error('PDF 预览异常', e)
            ElMessage.error('PDF 预览失败，请重试')
        } finally {
            previewLoading.value = false
        }
    }

    // ------------------------------
    // 导出 PDF 下载
    // ------------------------------
    async function exportPdfDownload() {
        if (!fixedForm.inspectionOrderNo) {
            ElMessage.warning('请先填写报检单号')
            return
        }
        exportLoading.value = true
        try {
            const html = await buildReportHtml()
            const res = await axios.post('/api/DetectionReport/ExportPdf', {
                HtmlContent: html,
                ReportNo: homeForm.ReportNo || '',
                IsCNAS: isCNASReport.value,
                WatermarkText: watermarkText.value
            }, { responseType: 'blob' })

            const blob = new Blob([res.data], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `报告_${homeForm.ReportNo || 'new'}.pdf`
            a.click()
            URL.revokeObjectURL(url)
            ElMessage.success('PDF 导出成功！')
        } catch (err) {
            ElMessage.error('PDF 导出失败')
        } finally {
            exportLoading.value = false
        }
    }

    // ------------------------------
    // 导出 Word（不动）
    // ------------------------------
    async function exportWord() {
        if (!fixedForm.inspectionOrderNo) {
            ElMessage.warning('请先填写报检单号');
            return;
        }
        exportLoading.value = true;
        try {
            const htmlContent = await buildReportHtml()
            const res = await axios.post('/api/DetectionReport/ExportWord', {
                HtmlContent: htmlContent, IsCNAS: isCNASReport.value, WatermarkText: watermarkText.value
            }, { responseType: 'blob' });

            const blob = new Blob([res.data], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `检测报告_${new Date().getTime()}.doc`;
            link.click();
            URL.revokeObjectURL(url);
            ElMessage.success('Word导出成功');
        } catch (err) {
            ElMessage.error('Word导出失败');
        } finally {
            exportLoading.value = false;
        }
    }

    // ------------------------------
    // 以下全部业务逻辑 100% 保持不动
    // ------------------------------
    const inspectionDialogRef = ref(null)
    function openInspectionDialog() {
        if (isDetail) { ElMessage.warning('详情页不可选择报检单'); return; }
        inspectionDialogRef.value?.open()
    }
    async function selectInspection(row) {
        fixedForm.inspectionOrderNo = row['报检单号'] || ''
        fixedForm.orderNo = row['委托单号'] || ''
        ElMessage.success('选择成功')
        if (fixedForm.orderNo && !isDetail && !isEdit) {
            await getTestReferenceByOrderNo(fixedForm.orderNo)
            const itemList = await getInspectionListByOrderNo(fixedForm.orderNo, fixedForm.inspectionOrderNo)
            if (itemList && itemList.length) {
                fixedForm.testEnv = itemList.map(item => ({
                    item: (item["项目名称"] || "").split("\n")[0]?.trim() || "",
                    reqTemp: item["温度要求"] || "", testTemp: "",
                    reqHumidity: item["湿度要求"] || "", testHumidity: "",
                    projectCode: item["项目编码"] || "", techSpecCode: "", techSpecName: ""
                }))
                testProjects.value = fixedForm.testEnv.map(() => ({
                    projectCode: '', techSpecCode: '', techSpecName: '', schemeConfig: null, showPhotoArea: false,
                    reportData: { Header: { TestReference: '', TestReferenceEn: '' }, testReference: '', tableData: [], techRequirement: {}, bottomRequirement: {}, conclusion: '', note: '', reviewer: '', approval: {}, paramValues: {}, photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }] }
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
    function handleProjectCodeChange({ index, code }) {
        const row = fixedForm.testEnv[index]
        const env = envList.value.find(item => item.EnvCode === code)
        if (env) { row.item = env.ProjectName; row.reqTemp = env.RequiredTemperature; row.reqHumidity = env.RequiredHumidity; }
        onProjectCodeChangeFn(index, code, fixedForm.testEnv, testProjects)
    }
    function handleTechSpecChange({ index, specId }) {
        const row = fixedForm.testEnv[index]
        const tech = techSpecList.value.find(t => t.Id === specId)
        if (tech) row.techSpecName = tech.Name
        onTechSpecChangeFn(index, specId, fixedForm.testEnv, testProjects)
    }
    async function submitReport() {
        if (!fixedForm.inspectionOrderNo) { ElMessage.warning('请填写报检单号'); return; }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) { ElMessage.warning('请完善所有检测环境'); return; }
        loading.value = true
        try {
            const marginData = reportRef.value.getMarginData()
            const success = await submitReportAPI(testProjects.value, isEdit, id, marginData)
            if (success) back()
        } finally { loading.value = false }
    }
    function back() { router.push('/report/list') }
    async function loadEnvList() {
        const envRes = await axios.get('/api/DetectionConfig/env-project-list')
        if (envRes.data.Success) envList.value = envRes.data.Data
    }
    function handleEquipmentSelect({ index, equipment }) {
        if (!fixedForm.testEquipment[index]) return;
        fixedForm.testEquipment[index] = { ...fixedForm.testEquipment[index], name: equipment.name, model: equipment.model, eqNo: equipment.eqNo, validUntil: equipment.validUntil };
    }

    onMounted(async () => {
        await getTechSpecList()
        await loadEnvList()
        if (isEdit || isDetail) {
            await loadReportDetail(id, testProjects, fixedForm, homeForm)
        }
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

    :deep(.el-input__wrapper), :deep(.el-date-picker .el-input__wrapper) {
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

    .action-buttons {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        margin-left: 210px;
        background: #ffffff;
        padding: 10px 20px;
        box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.06);
        z-index: 999;
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
        align-items: center;
    }

    .report-container {
        padding-bottom: 70px !important;
    }

    .el-dialog {
        width: 80vw !important;
        max-width: 95vw !important;
        height: 80vh !important;
    }

    .el-dialog__body {
        height: calc(100% - 60px) !important;
        padding: 0 !important;
    }

    iframe {
        width: 100% !important;
        height: 100% !important;
        border: none;
    }
</style>