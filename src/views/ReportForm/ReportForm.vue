<template>
    <div class="report-container" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <!-- 顶部固定：标题居中 + 报告编号 -->
        <div class="top-fixed-header">
            <div class="top-row-1">
                <div class="placeholder-box"></div>
                <h2 class="top-title">
                    {{ isDetail ? '报告详情' : isEdit ? '编辑检测报告' : '新增检测报告' }}
                </h2>
                <div class="report-no-box" style="display: flex; flex-direction: column; align-items: flex-end;">
                    <!-- 第一行：报告编号（必填） -->
                    <div style="display: flex; align-items: center; margin-bottom: 6px; width: 100%; justify-content: flex-end;">
                        <span style="width: 130px; text-align: right; margin-right: 8px;">报告编号 ：</span>

                        <el-input v-model="homeForm.ReportNo"
                                  placeholder="请输入报告编号"
                                  style="width: 220px;"
                                  clearable
                                  :disabled="isDetail || isEdit" />
                        <span style="color: red; margin-right: 2px;">*</span>

                    </div>
                    <!-- 第二行：厂区代码（必填） -->
                    <div style="display: flex; align-items: center; width: 100%; justify-content: flex-end;">
                        <span style="width: 130px; text-align: right; margin-right: 8px;">厂区代码：</span>
                        <el-select v-model="homeForm.FactoryCode"
                                   placeholder="请选择厂区"
                                   style="width: 220px;"
                                   clearable
                                   :disabled="isDetail || isEdit">
                            <el-option label="SZNM" value="SZNM" />
                            <el-option label="JANM" value="JANM" />
                            <el-option label="XCNM" value="XCNM" />
                        </el-select>
                        <span style="color: red; margin-right: 2px;">*</span>

                    </div>
                </div>
            </div>

            <!-- 页签固定 -->
            <div class="top-row-2">
                <el-tabs v-model="activeTab" type="card" class="fixed-tabs">
                    <el-tab-pane label="报告首页" name="home" />
                    <el-tab-pane label="报告内容" name="content" />
                </el-tabs>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="tab-content-wrapper">
            <HomeTab v-if="activeTab === 'home'" :home-form="homeForm" :is-detail="isDetail" />
            <ContentTab v-if="activeTab === 'content'"
                        ref="reportRef"
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
                        @delete-impact-row="deleteImpactRow" 
                        @delete-ferrite-row="deleteFerriteRow"        
                        @delete-ferrite-group="deleteFerriteGroup" 
                        @add-photo-row="addPhotoRow"
                        @remove-photo-row="removePhotoRow"
                        @pick-photo="pickPhoto"
                        @project-code-change="handleProjectCodeChange"
                        @tech-spec-change="handleTechSpecChange"
                        @equipment-select="handleEquipmentSelect" />
        </div>

        <!-- 底部固定按钮 -->
        <div class="action-buttons">
            <el-switch v-model="isCNASReport"
                       active-text="CNAS报告"
                       inactive-text="普通报告" />

            <!-- PDF预览 - 信息蓝（标准预览色） -->
            <el-button type="info" size="large" @click="openPdfPreview" :loading="previewLoading">PDF预览</el-button>

            <!-- 返回列表 - 灰色（标准返回色） -->
            <el-button size="large" @click="back">返回列表</el-button>

            <!-- 保存报告 - 主题蓝（标准提交色） -->
            <el-button type="primary" size="large" @click="submitReport" :disabled="isDetail || loading">保存报告</el-button>

            <!-- 注释导出功能 -->
            <!-- <el-button type="warning" size="large" @click="exportPdfDownload" :loading="exportLoading">导出PDF</el-button> -->
            <!-- <el-button type="success" size="large" @click="exportWord" :loading="exportLoading">导出Word报告</el-button> -->
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
</template>

<script setup>
    import { ref, onMounted, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage, ElMessageBox } from 'element-plus'
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
        testProjects, techSpecList, projectDataCache, //  解构出缓存对象
        getTechSpecList, batchGetAllProjectData,
        getTestReferenceByOrderNo, getInspectionListByOrderNo, getAgreementByOrderNo,
        setDefaultTechSpecForAllRows,
        addTableRow, deleteTableRow, deleteImpactRow, deleteFerriteRow, deleteFerriteGroup, 
        addPhotoRow, removePhotoRow, pickPhoto,
        onProjectCodeChange: onProjectCodeChangeFn,
        onTechSpecChange: onTechSpecChangeFn
    } = useTestProject()

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
            const res = await axios.post('/api/DetectionReport/PreviewPdf', {
                htmlContent: html,
                reportNo: homeForm.ReportNo || '',
                factoryCode: homeForm.FactoryCode || '',
                isCNAS: isCNASReport.value,
                watermarkText: watermarkText.value
            })

            if (!res.data.success) {
                ElMessage.error('PDF 生成失败：' + res.data.msg)
                return
            }
            const pdfUrl = window.location.origin + res.data.pdfUrl;
            window.open(pdfUrl, '_blank', 'noopener,noreferrer');

        } catch (e) {
            console.error('PDF 预览异常', e)
            ElMessage.error('PDF 预览失败，请重试')
        } finally {
            previewLoading.value = false
        }
    }


    const inspectionDialogRef = ref(null)
    function openInspectionDialog() {
        if (isDetail) { ElMessage.warning('详情页不可选择报检单'); return; }
        inspectionDialogRef.value?.open()
    }

    // 保存报告 + 报告编号严谨校验（SZNM+7位数字：年份后两位+月份+3位序号）
    async function submitReport() {

        // 1. 校验厂区代码
        const factoryCode = homeForm.FactoryCode?.trim() || '';
        if (!factoryCode) {
            ElMessage.warning('请选择厂区代码！');
            return;
        }

        // 2. 预处理报告编号
        const reportNo = homeForm.ReportNo?.trim() || '';
        if (!reportNo) {
            ElMessage.warning('请输入报告编号！');
            return;
        }

        // 3. 动态构建正则：前缀 = factoryCode
        const prefix = factoryCode.toUpperCase(); 
        const baseReg = new RegExp(`^${prefix}\\d{7}$`);
        if (!baseReg.test(reportNo)) {
            ElMessage.warning(`格式错误！报告编号必须为：${prefix} + 7位数字（示例：${prefix}2605001）`);
            return;
        }

        // 4. 拆分7位数字部分（核心校验）
        const digitPart = reportNo.slice(prefix.length); // 截取前缀后的7位数字
        const yearCode = digitPart.substring(0, 2);   // 前2位：年份后两位
        const monthCode = digitPart.substring(2, 4);  // 中间2位：月份
        const seqCode = digitPart.substring(4, 7);    // 后3位：序号

        // 5. 获取当前系统年份后两位
        const currentYear = new Date().getFullYear();
        const currentYearLastTwo = String(currentYear % 100).padStart(2, '0');

        // 6. 年份校验
        if (yearCode !== currentYearLastTwo) {
            ElMessage.warning(`年份错误！必须是当前年份后两位：${currentYearLastTwo}`);
            return;
        }

        // 7. 月份校验
        const month = Number(monthCode);
        if (isNaN(month) || month < 1 || month > 12) {
            ElMessage.warning('月份错误！必须为 01 ~ 12 之间');
            return;
        }

        // 8. 序号校验
        const seq = Number(seqCode);
        if (isNaN(seq) || seq < 1 || seq > 999) {
            ElMessage.warning('序号错误！必须为 001 ~ 999 之间的3位数字');
            return;
        }

        // 后续业务校验（报检单号、环境等不变）
        if (!fixedForm.inspectionOrderNo) {
            ElMessage.warning('请填写报检单号');
            return;
        }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) {
            ElMessage.warning('请完善所有检测环境');
            return;
        }
        loading.value = true;
        try {
            // 当 ContentTab 未挂载时，使用默认间距
            const marginData = reportRef.value?.getMarginData() || { fixedMargins: {}, projectMargins: [] };
            const success = await submitReportAPI(testProjects.value, isEdit, id, marginData);
            if (success) {
                ElMessage.success('保存成功！');
                await router.push('/report/list');
            }
        } finally {
            loading.value = false;
        }
    }

    // 返回列表 + 二次确认提示
    async function back() {
        // 详情页直接返回，无需提示
        if (isDetail) {
            router.push('/report/list')
            return
        }
        try {
            await ElMessageBox.confirm(
                '是否确认返回报告列表？\n未保存的数据将会丢失！',
                '提示',
                {
                    confirmButtonText: '确认返回',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
            // 用户确认后返回
            router.push('/report/list')
        } catch (error) {
            // 用户取消，不做操作
            ElMessage.info('已取消返回')
        }
    }

    // 剩余原有逻辑代码不变
    async function selectInspection(row) {
        fixedForm.inspectionOrderNo = row['报检单号'] || ''
        fixedForm.orderNo = row['委托单号'] || ''
        ElMessage.success('选择成功')
        if (fixedForm.orderNo && !isDetail && !isEdit) {
            await getTestReferenceByOrderNo(fixedForm.orderNo)
            const itemList = await getInspectionListByOrderNo(fixedForm.orderNo, fixedForm.inspectionOrderNo)
            if (itemList && itemList.length) {
                fixedForm.testEnv = itemList.map(item => ({
                    item: (() => {
                        const lines = (item["项目名称"] || "").split("\n").map(i => i.trim()).filter(Boolean);
                        if (lines.length >= 2) return `${lines[0]}<br>${lines[1]}`;
                        return lines[0] || "";
                    })(),
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

            //  刷新所有行的技术要求下拉选项
            await nextTick()
            if (reportRef.value?.refreshAllTechRequirements) {
                await reportRef.value.refreshAllTechRequirements()
            }
        }
    }
    function handleProjectCodeChange({ index, code }) {
        const row = fixedForm.testEnv[index]
        const env = envList.value.find(item => item.EnvCode === code)
        if (env) {
            row.item = env.FullName || env.ProjectName;
            row.reqTemp = env.RequiredTemperature;
            row.reqHumidity = env.RequiredHumidity;
            console.log('手动选择后的 row.item:', row.item); // 添加这行

        }
        onProjectCodeChangeFn(index, code, fixedForm.testEnv, testProjects)
    }
    function handleTechSpecChange({ index, specId }) {
        console.log('🔥 handleTechSpecChange 执行', { index, specId });

        const row = fixedForm.testEnv[index]

        console.log('当前行项目名称:', row.item) 
        const tech = techSpecList.value.find(t => t.Id === specId)
        if (tech) row.techSpecName = tech.Name

        //修改： 传递订单号和报检单号，直接调用后台获取最新数据。放弃转换数据库保存的数据
        onTechSpecChangeFn(index, specId, fixedForm.testEnv, testProjects, fixedForm.orderNo, fixedForm.inspectionOrderNo)
    }

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
            console.log('🔍 传入 loadReportDetail 的 projectDataCache:', projectDataCache)

            await loadReportDetail(id, testProjects, fixedForm, homeForm, projectDataCache)

            //  刷新所有行的技术要求下拉选项
            await nextTick()
            if (reportRef.value?.refreshAllTechRequirements) {
                await reportRef.value.refreshAllTechRequirements()
            }
        }
    })
</script>

<style scoped>
    .report-container .el-form-item {
        margin-bottom: 15px;
    }

    .top-fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        margin-left: 210px;
        background: #ffffff;
        padding: 15px 30px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
        z-index: 999;
    }

    .top-row-1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .placeholder-box {
        width: 250px;
    }

    .top-title {
        margin: 0;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
    }

    .report-no-box {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        width: 250px;
        justify-content: flex-end;
    }

    .top-row-2 {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    .fixed-tabs {
        flex: 1;
        margin-bottom: 0 !important;
    }

    .tab-content-wrapper {
        padding-top: 120px;
        padding-bottom: 20px;
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
        padding-top: 0 !important;
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