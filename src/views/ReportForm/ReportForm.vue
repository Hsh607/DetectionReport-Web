<template>
  <div
    class="report-container"
    style="padding: 20px; max-width: 1600px; margin: 0 auto;"
  >
    <!-- 顶部固定：标题居中 + 报告编号 -->
    <div class="top-fixed-header">
      <div class="top-row-1">
        <div class="placeholder-box" />
        <h2 class="top-title">
            {{ pageTitle }}
            <el-tag v-if="savedAt"
                    type="success"
                    size="small"
                    effect="dark"
                    style="margin-left: 12px; vertical-align: middle;">
                ✓ 已保存 {{ savedAt }}
            </el-tag>
        </h2>

        <div
          class="report-no-box"
          style="display: flex; flex-direction: column; align-items: flex-end;"
        >
          <!-- 第一行：报告编号（必填） -->
          <div style="display: flex; align-items: center; margin-bottom: 6px; width: 100%; justify-content: flex-end;">
            <span style="width: 130px; text-align: right; margin-right: 8px;">报告编号 ：</span>

            <el-input
              v-model="homeForm.ReportNo"
              placeholder="请输入报告编号"
              style="width: 220px;"
              clearable
              :disabled="isDetail || isEdit"
            />
            <span style="color: red; margin-right: 2px;">*</span>
          </div>
          <!-- 第二行：厂区代码（必填） -->
          <div style="display: flex; align-items: center; width: 100%; justify-content: flex-end;">
            <span style="width: 130px; text-align: right; margin-right: 8px;">厂区代码：</span>
            <el-select
              v-model="homeForm.FactoryCode"
              placeholder="请选择厂区"
              style="width: 220px;"
              clearable
              :disabled="isDetail || isEdit"
            >
              <el-option
                label="SZNM"
                value="SZNM"
              />
              <el-option
                label="JANM"
                value="JANM"
              />
              <el-option
                label="XCNM"
                value="XCNM"
              />
            </el-select>
            <span style="color: red; margin-right: 2px;">*</span>
          </div>
        </div>
      </div>

      <!-- 页签固定 -->
      <div class="top-row-2">
        <el-tabs
          v-model="activeTab"
          type="card"
          class="fixed-tabs"
        >
          <el-tab-pane
            label="报告首页"
            name="home"
          />
          <el-tab-pane
            label="报告内容"
            name="content"
          />
        </el-tabs>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content-wrapper">
      <HomeTab
        v-if="activeTab === 'home'"
        :home-form="homeForm"
        :is-detail="isDetail"
      />
      <ContentTab
        v-show="activeTab === 'content'"
        ref="reportRef"
        v-model:fixed-form="fixedForm"
        :test-projects="testProjects"
        :is-detail="isDetail"
        :report-id="id"
        :report-status="reportStatus"
        :is-audit-mode="isAuditMode"
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
        @add-tensile-row="addTensileRow"
        @delete-tensile-row="deleteTensileRow"
        @delete-tensile-group="deleteTensileGroup"
        @clone-tensile-group="cloneTensileGroup" 
        @copy-tensile-table-as-group="copyTensileTableAsGroup"
        @add-vickers-row="addVickersRow"
        @delete-vickers-row="deleteVickersRow"
        @delete-vickers-group="deleteVickersGroup"
        @copy-corrosion-table-as-group="copyCorrosionTableAsGroup"
        @clone-corrosion-group="cloneCorrosionGroup"
        @delete-corrosion-group="deleteCorrosionGroup"
        @add-corrosion-row="addCorrosionRow"
        @delete-corrosion-row="deleteCorrosionRow"
        @copy-inclusion-table-as-group="copyInclusionTableAsGroup"
        @clone-inclusion-group="cloneInclusionGroup"
        @delete-inclusion-group="deleteInclusionGroup"
        @add-inclusion-row="addInclusionRow"
        @delete-inclusion-row="deleteInclusionRow"
        @copy-chem-table-as-group="copyChemTableAsGroup"
        @clone-chem-group="cloneChemGroup"
        @delete-chem-group="deleteChemGroup"
        @add-chem-row="addChemRow"
        @delete-chem-row="deleteChemRow"
        @copy-metallographic-table-as-group="copyMetallographicTableAsGroup"
        @clone-metallographic-group="cloneMetallographicGroup"
        @delete-metallographic-group="deleteMetallographicGroup"
        @add-metallographic-row="addMetallographicRow"
        @delete-metallographic-row="deleteMetallographicRow"
        @add-photo-row="addPhotoRow"
        @remove-photo-row="removePhotoRow"
        @pick-photo="pickPhoto"
        @project-code-change="handleProjectCodeChange"
        @tech-spec-change="handleTechSpecChange"
        @equipment-select="handleEquipmentSelect"
        @refresh-report="refreshReport" 
      />
    </div>

    <!-- 底部固定按钮 -->
    <div class="action-buttons">
      <el-switch
        v-model="isCNASReport"
        active-text="CNAS报告"
        inactive-text="普通报告"
      />

      <!-- PDF预览 - 信息蓝（标准预览色） -->
      <el-button
        type="info"
        size="large"
        :loading="previewLoading"
        @click="openPdfPreview"
      >
        PDF预览
      </el-button>

      <!-- 返回列表 - 灰色（标准返回色） -->
      <el-button
        size="large"
        @click="back"
      >
        返回列表
      </el-button>

      <!-- 保存报告 - 审核/批准模式下隐藏 -->
      <el-button v-if="!isAuditMode"
                 type="primary"
                 size="large"
                 :disabled="isDetail || loading"
                 @click="submitReport">
          {{ savedAt ? '已保存' : '保存报告' }}
      </el-button>

      <!-- 提交审核 - 橙色/警告色，突出审批动作 -->
      <el-button
        v-if="!isAuditMode && showSubmitReview"
        type="warning"
        size="large"
        :disabled="isDetail || submitLoading"
        @click="handleSubmitReview"
      >
        {{ isRejected ? '重新提交' : '提交审核' }}
      </el-button>

      <!-- 审核操作按钮（暂时隐藏） -->
      <template v-if="false">
        <el-button
          type="success"
          size="large"
          @click="handleAuditApprove"
        >
          审核通过
        </el-button>
        <el-button
          type="danger"
          size="large"
          @click="handleAuditReject"
        >
          驳回
        </el-button>
        <el-button
          type="warning"
          size="large"
          @click="handleAuditTransfer"
        >
          转办
        </el-button>
      </template>

      <!-- 批准操作按钮 -->
      <template v-if="false">
        <el-button
          type="success"
          size="large"
          @click="handleAuditApprove"
        >
          批准通过
        </el-button>
        <el-button
          type="danger"
          size="large"
          @click="handleAuditReject"
        >
          驳回
        </el-button>
        <el-button
          type="warning"
          size="large"
          @click="handleAuditTransfer"
        >
          转办
        </el-button>
      </template>

      <el-button
        v-if="false"
        type="success"
        size="large"
        :loading="exportLoading"
        @click="exportWord"
      >
        导出Word报告
      </el-button>
    </div>

    <InspectionDialog
      ref="inspectionDialogRef"
      @confirm="selectInspection"
    />

    <el-dialog
      v-model="previewVisible"
      title="PDF 预览"
      width="90vw"
      height="85vh"
      style="height:85vh;display:flex;flex-direction:column;"
    >
      <iframe
        ref="pdfIframe"
        style="width:100%;height:100%;border:none;flex:1;"
        frameborder="0"
        scrolling="auto"
      />
    </el-dialog>
  </div>
</template>

<script>
    export default {
        name: 'ReportForm'  //  必须添加，keep-alive 缓存依赖
    }
</script>

<script setup>

    import { ref, onMounted, nextTick, computed, watch } from 'vue' 
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import axios from 'axios'
    import HomeTab from './components/HomeTab.vue'
    import ContentTab from './components/ContentTab.vue'
    import InspectionDialog from './components/InspectionDialog.vue'
    import { useForm } from './composables/useForm'
    import { useTestProject } from './composables/useTestProject'
    import { generatePrintHTML } from './utils/printHelper'
    import { useUserStore } from '@/stores/user'

    const reportRef = ref(null)
    const router = useRouter()
    const route = useRoute()




    // 改
    const id = ref(route.params.id)
    const isDetail = ref(route.query.detail === '1')
    const isEdit = ref(route.name === 'ReportEdit')

    const isTaskMode = computed(() => route.query.task === 'true')
    const isReviewMode = computed(() => route.query.mode === 'review')
    const isApprovalMode = computed(() => route.query.mode === 'approval')
    const isAuditMode = computed(() => isReviewMode.value || isApprovalMode.value)

    const pageTitle = computed(() => {
        if (isReviewMode.value) return '审核报告'
        if (isApprovalMode.value) return '批准报告'
        if (isDetail.value) return '报告详情'
        if (isEdit.value) return '编辑检测报告'
        return '新增检测报告'
    })

    const savedAt = ref('')



    const activeTab = ref('content')
    const loading = ref(false)
    const previewLoading = ref(false)

    let lastSaveTime = 0


    const isCNASReport = computed({
        get: () => homeForm.IsCnas ?? false,
        set: (val) => { homeForm.IsCnas = val }
    })

    const watermarkText = ref('NORMAL TESTING TECHNOLOGY')

    const previewVisible = ref(false)
    const pdfIframe = ref(null)

    const envList = ref([])

    const {
        homeForm, fixedForm,
        addTestEnvRow, 
        deleteTestEnvRow: deleteTestEnvRowFromForm,  // 重命名
        addTestEquipmentRow, deleteTestEquipmentRow,
        submitReport: submitReportAPI, loadReportDetail
    } = useForm()


    const {
        testProjects, techSpecList, projectDataCache, //  解构出缓存对象
        getTechSpecList, batchGetAllProjectData,
        getTestReferenceByOrderNo, getInspectionListByOrderNo, getAgreementByOrderNo,
        setDefaultTechSpecForAllRows,
        addTableRow, deleteTableRow, deleteImpactRow, deleteFerriteRow, deleteFerriteGroup, 
        addTensileRow, deleteTensileRow, deleteTensileGroup, cloneTensileGroup, copyTensileTableAsGroup,  
        addVickersRow, deleteVickersRow, deleteVickersGroup,
        copyCorrosionTableAsGroup, cloneCorrosionGroup, deleteCorrosionGroup,
        addCorrosionRow, deleteCorrosionRow,
        copyInclusionTableAsGroup,
        cloneInclusionGroup,
        deleteInclusionGroup,
        addInclusionRow,
        deleteInclusionRow,
        copyChemTableAsGroup,
        cloneChemGroup,
        deleteChemGroup,
        addChemRow,
        deleteChemRow,
        copyMetallographicTableAsGroup,
        cloneMetallographicGroup,
        deleteMetallographicGroup,
        addMetallographicRow,
        deleteMetallographicRow,
        addPhotoRow, removePhotoRow, pickPhoto,
        onProjectCodeChange: onProjectCodeChangeFn,
        onTechSpecChange: onTechSpecChangeFn
    } = useTestProject()

    watch([testProjects, homeForm, fixedForm], () => {
        if (savedAt.value) savedAt.value = ''
    }, { deep: true })

    // 本地覆盖 deleteTestEnvRow
    function deleteTestEnvRow(index) {
        deleteTestEnvRowFromForm(index, testProjects)
    }

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

    const handleAuditApprove = async () => {
        try {
            await ElMessageBox.confirm('确认通过？', '提示', { type: 'warning' })

            const target = findTargetBlock()
            if (!target) {
                ElMessage.error('未找到您需要审批的区块')
                return
            }

            const url = isReviewMode.value
                ? '/api/Approval/ApproveReview'
                : '/api/Approval/ApproveApproval'

            const res = await axios.post(url, {
                reportId: id.value,
                projectIndex: target.projectIndex,
                blockIndex: target.blockIndex
            })

            if (res.data.Success) {
                ElMessage.success(isReviewMode.value ? '审核通过' : '批准通过')
                router.push('/task')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('操作失败')
        }
    }

    // 审核/批准驳回
    const handleAuditReject = async () => {
        try {
            const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回', {
                confirmButtonText: '确认驳回',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })

            const target = findTargetBlock()
            if (!target) {
                ElMessage.error('未找到您需要审批的区块')
                return
            }

            const url = isReviewMode.value
                ? '/api/Approval/RejectReview'
                : '/api/Approval/RejectApproval'

            const res = await axios.post(url, {
                reportId: id.value,
                projectIndex: target.projectIndex,
                blockIndex: target.blockIndex,
                reason: reason
            })

            if (res.data.Success) {
                ElMessage.success('已驳回')
                router.push('/task')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('操作失败')
        }
    }

    // 转办
    const handleAuditTransfer = async () => {
        try {
            const { value: targetUser } = await ElMessageBox.prompt('请输入转办目标人', '转办', {
                confirmButtonText: '确认转办',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入目标人姓名'
            })

            const target = findTargetBlock()
            if (!target) {
                ElMessage.error('未找到您需要审批的区块')
                return
            }

            const res = await axios.post('/api/Approval/Transfer', {
                reportId: id.value,
                projectIndex: target.projectIndex,
                blockIndex: target.blockIndex,
                targetUser: targetUser
            })

            if (res.data.Success) {
                ElMessage.success(`已转办给 ${targetUser}`)
                router.push('/task')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('操作失败')
        }
    }

    /** 审批操作后刷新报告数据（重新拉详情 + 更新 reportStatus） */
    async function refreshReport() {
        if (!id.value) return
        try {
            // 1. 重新拉详情（内部会刷新 testProjects / fixedForm / homeForm）
            await loadReportDetail(id.value, testProjects, fixedForm, homeForm, projectDataCache)

            // 2. 单独请求一次报告头，拿最新的 Status
            //    （loadReportDetail 不返回值，所以这里再发一次请求）
            const res = await axios.get(`/api/DetectionReport/${id.value}`)
            const newStatus = res.data?.Data?.Status || res.data?.Data?.status
                || res.data?.Status || res.data?.status
            if (newStatus) {
                reportStatus.value = newStatus
                console.log(' reportStatus 已刷新为:', newStatus)
            }

            // 3. 刷新技术要求下拉
            await nextTick()
            if (reportRef.value?.refreshAllTechRequirements) {
                await reportRef.value.refreshAllTechRequirements()
            }
        } catch (e) {
            console.error('刷新报告失败', e)
            ElMessage.error('刷新数据失败，请手动刷新页面')
        }
    }

    async function buildReportHtml() {
        const projectsCopy = JSON.parse(JSON.stringify(testProjects.value))

        //  只同步已存在的 signatureItems 的 URL，不再强制创建空签名
        for (const project of projectsCopy) {
            const reportData = project.reportData || {}

            // 只有当 signatureItems 已存在且非空时，才同步签名 URL
            if (reportData.signatureItems && reportData.signatureItems.length > 0) {
                for (const item of reportData.signatureItems) {
                    if (item.role === '编制') {
                        item.signatureUrl = reportData.compiledSignatureUrl || item.signatureUrl || ''
                    } else if (item.role === '审核') {
                        item.signatureUrl = reportData.reviewSignatureUrl || item.signatureUrl || ''
                    } else if (item.role === '批准') {
                        item.signatureUrl = reportData.approvalSignatureUrl || item.signatureUrl || ''
                    }
                }
            }
            // 如果 signatureItems 为空/不存在 → 保持不动，不创建
        }

        // 照片转换（原有逻辑保持不变）
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
                watermarkText: watermarkText.value,
                ReportId: id.value
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
        if (isDetail.value) { ElMessage.warning('详情页不可选择报检单'); return; }   
        inspectionDialogRef.value?.open()
    }



    // 保存报告 + 报告编号严谨校验（SZNM+7位数字：年份后两位+月份+3位序号）
    async function submitReport() {
        //  冷却检查：2 秒内不允许重复保存
        const now = Date.now()
        if (now - lastSaveTime < 2000) {
            ElMessage.warning('请勿频繁保存')
            return
        }

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
            //  调用 submitReportAPI 时传入 signatureInfo
            const marginData = reportRef.value?.getMarginData() || { fixedMargins: {}, projectMargins: [] };
            const result = await submitReportAPI(
                testProjects.value,
                isEdit.value,
                id.value,
                marginData
            );

            if (result?.success) {
                lastSaveTime = Date.now()
                // 新增 → 切换到编辑模式
                if (!isEdit.value && result.reportId) {
                    id.value = result.reportId
                    isEdit.value = true
                    window.history.replaceState({}, '', `/report/edit/${result.reportId}`)
                    ElMessage.success({
                        message: '保存成功，已进入编辑模式，可继续修改',
                        duration: 4000
                    })
                } else {
                    ElMessage.success('保存成功')
                }

                savedAt.value = new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            } else {
                ElMessage.error('保存失败')
            }
        } finally {
            loading.value = false;
        }
    }

    // 返回列表 + 二次确认提示
    async function back() {
        if (isDetail.value) {                     
            router.push({ path: '/report/list', query: route.query })   
            return
        }
        try {
            await ElMessageBox.confirm(
                '是否确认返回报告列表？\n未保存的数据将会丢失！',
                '提示',
                { confirmButtonText: '确认返回', cancelButtonText: '取消', type: 'warning' }
            )
            router.push({ path: '/report/list', query: route.query })   
        } catch (error) {
            ElMessage.info('已取消返回')
        }
    }

    const submitLoading = ref(false)

    // 判断当前报告是否处于“已退回”状态（通过路由参数或接口返回）
    const isRejected = ref(false)  // 可在加载报告时从详情数据获取

    // 是否显示“提交审核”按钮
    const showSubmitReview = computed(() => {
        // 详情页不显示，且只有 draft 或 rejected 状态才显示
        if (isDetail.value) return false
        // 通过路由参数或 store 获取报告状态
        const status = reportStatus.value
        return status === 'draft' || status === 'rejected'
    })

    /**
     * 提交审核（或重新提交）
     */
    async function handleSubmitReview() {
        // 1. 核心数据校验（不变）
        if (!homeForm.ReportNo?.trim()) {
            ElMessage.warning('请填写报告编号')
            return
        }
        if (!fixedForm.inspectionOrderNo) {
            ElMessage.warning('请填写报检单号')
            return
        }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) {
            ElMessage.warning('请完善所有检测环境')
            return
        }

        // ⭐ 2. 校验审批区块（核心改动）
        const projects = testProjects.value || []

        // 2a. 全报告至少一个审批区块
        const hasAnyBlock = projects.some(p =>
            (p.reportData?.signatureBlocks?.length || 0) > 0
        )
        if (!hasAnyBlock) {
            ElMessage.warning('请至少添加一个审批区域后再提交')
            return
        }

        // 2b. 逐项目校验
        const REQUIRED_CODES = ['JCXMHJ-07']   // 强制要求审批区域的项目
        const invalidBlocks = []
        const missingBlockProjects = []
        const missingPersonProjects = []

        for (const project of projects) {
            const blocks = project.reportData?.signatureBlocks || []
            const code = project.projectCode || ''
            const projectName = project.schemeConfig?.ProjectTitle
                || project.techSpecName
                || code
                || '未命名项目'

            // 该项目是否强制要求审批区域
            const requiresBlock = REQUIRED_CODES.includes(code)

            // 没区块
            if (blocks.length === 0) {
                if (requiresBlock) {
                    missingBlockProjects.push(`${code}（${projectName}）`)
                }
                continue
            }

            // 有区块，检查审核人/批准人
            const hasMissing = blocks.some(b => {
                const reviewer = b.Reviewer || b.reviewer || ''
                const approver = b.Approver || b.approver || ''
                return !reviewer || !approver
            })
            if (hasMissing) {
                missingPersonProjects.push(`${code}（${projectName}）`)
            }
        }

        if (missingBlockProjects.length > 0) {
            ElMessage.warning(
                `以下项目必须添加审批区域：${missingBlockProjects.join('、')}`
            )
            return
        }

        if (missingPersonProjects.length > 0) {
            ElMessage.warning(
                `以下项目的审批区块缺少审核人或批准人：${missingPersonProjects.join('、')}`
            )
            return
        }

        // 3. 二次确认弹窗（不变）
        try {
            await ElMessageBox.confirm(
                '提交后报告将进入审核流程，不可再编辑。确认提交？',
                '提交审核确认',
                {
                    confirmButtonText: '确认提交',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
        } catch {
            ElMessage.info('已取消提交')
            return
        }

        // 4. 先保存草稿（不变）
        submitLoading.value = true
        try {
            const marginData = reportRef.value?.getMarginData() || { fixedMargins: {}, projectMargins: [] }

            const saveResult = await submitReportAPI(
                testProjects.value,
                isEdit.value,
                id.value,
                marginData
            )

            if (!saveResult?.success) {
                ElMessage.error('保存失败，请重试')
                return
            }

            if (!isEdit.value && saveResult.reportId) {
                id.value = saveResult.reportId
                isEdit.value = true
                window.history.replaceState({}, '', `/report/edit/${saveResult.reportId}`)
            }

            // 5. 调用提交审核接口（不变）
            const res = await axios.post('/api/Approval/SubmitReview', {
                reportId: id.value || homeForm.ReportId,
            })

            if (res.data.Success) {
                ElMessage.success(isRejected.value ? '已重新提交审核' : '提交审核成功！')
                await router.push('/report/list')
            } else {
                ElMessage.error(res.data.Message || '提交审核失败')
            }
        } catch (e) {
            console.error('提交审核异常', e)
            const msg = e.response?.data?.Message
                || e.response?.data?.message
                || '提交审核失败，请重试'
            ElMessage.error(msg)
        } finally {
            submitLoading.value = false
        }
    }


    //导出word
    const exportLoading = ref(false)

    async function exportWord() {
        if (!homeForm.ReportNo) {
            ElMessage.warning('请先填写报告编号')
            return
        }
        exportLoading.value = true
        try {
            // 1. 生成报告 HTML（包含照片 base64）
            const html = await buildReportHtml()

            // 2. 加载 Logo 图片转为 base64（与 PDF 预览一致）
            const logoUrl = new URL('/images/logo.png', window.location.origin).href
            const logoDataUrl = await urlToDataURL(logoUrl)

            // 3. 发送请求
            const res = await axios.post('/api/DetectionReport/ExportWord', {
                HtmlContent: html,
                ReportNo: homeForm.ReportNo,
                IsCNAS: isCNASReport.value,
                WatermarkText: watermarkText.value,
                LogoBase64: logoDataUrl,        // 新增字段
                FactoryCode: homeForm.FactoryCode
            }, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.download = `检测报告_${homeForm.ReportNo}.doc`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            ElMessage.success('Word 导出成功')
        } catch (e) {
            console.error(e)
            ElMessage.error('Word 导出失败，请重试')
        } finally {
            exportLoading.value = false
        }
    }

    // 剩余原有逻辑代码不变
    async function selectInspection(row) {
        fixedForm.inspectionOrderNo = row['报检单号'] || ''
        fixedForm.orderNo = row['委托单号'] || ''



        //  拼接三行内容，直接存入 sampleInfo
        const lines = []
        // 第一行：订单号（为空时显示 /）
        lines.push(`Order No./订单号：${row['订单号'] || '/'}`)
        // 第二行：炉号（优先取 炉号批号，为空时显示 /）
        const heatNo =  row['炉号'] || '/'
        lines.push(`Heat No./炉号：${heatNo}`)
        // 第三行：批号（为空时显示 /）
        lines.push(`Lot No./批号：${row['批号'] || '/'}`)
        fixedForm.sampleInfo = lines.join('\n')

        ElMessage.success('选择成功')
        if (fixedForm.orderNo && !isDetail.value && !isEdit.value) {
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

    // 查找当前用户对应的审批区块索引（兼容新旧格式）
    const findTargetBlock = () => {
        const userStore = useUserStore()
        const currentUser = userStore.userName

        // 调试日志
        console.log('currentUser =', JSON.stringify(currentUser))
        console.log('blocks =', JSON.stringify(testProjects.value[0]?.reportData?.signatureBlocks || testProjects.value[0]?.reportData?.SignatureBlocks))

        for (let pIdx = 0; pIdx < testProjects.value.length; pIdx++) {
            const project = testProjects.value[pIdx]
            const reportData = project.reportData || {}

            // 1. 优先从 signatureBlocks 查找
            const blocks = reportData.signatureBlocks || reportData.SignatureBlocks || []
            for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
                const block = blocks[bIdx]
                //  兼容 PascalCase 和 小写/下划线 两种命名
                const reviewer = block.Reviewer || block.reviewer || ''
                const reviewStatus = block.ReviewStatus || block.review_status || 'pending'
                const approver = block.Approver || block.approver || ''
                const approvalStatus = block.ApprovalStatus || block.approval_status || 'pending'

                if (isReviewMode.value && reviewer === currentUser && reviewStatus === 'pending') {
                    return { projectIndex: pIdx, blockIndex: bIdx }
                }
                if (isApprovalMode.value && approver === currentUser && approvalStatus === 'pending') {
                    return { projectIndex: pIdx, blockIndex: bIdx }
                }
            }

            // 2. 回退到旧格式（直接从 reviewer/approver 字段读取）
            if (isReviewMode.value && reportData.reviewer === currentUser && reportData.reviewStatus !== 'done') {
                // 如果旧数据没有 block，自动创建一个临时区块（只用于本次操作）
                // 但为了保持数据一致，我们直接返回 projectIndex=0, blockIndex=0
                // 并确保后端能处理
                return { projectIndex: pIdx, blockIndex: 0 }
            }
            if (isApprovalMode.value && reportData.approver === currentUser && reportData.approvalStatus !== 'done') {
                return { projectIndex: pIdx, blockIndex: 0 }
            }
        }
        return null
    }

    const reportStatus = ref('draft')

    onMounted(async () => {

        await getTechSpecList()
        await loadEnvList()
        if (id.value) {
            //  从 loadReportDetail 内部获取签名（不改变函数签名）
            await loadReportDetail(id.value, testProjects, fixedForm, homeForm, projectDataCache)
            // 优先从 query 读；没有就从后端拿真实状态
            let status = route.query.status
            if (!status) {
                try {
                    const res = await axios.get(`/api/DetectionReport/${id.value}`)
                    status = res.data?.Data?.Status || res.data?.Data?.status
                        || res.data?.Status || res.data?.status
                } catch (e) {
                    console.error('读取报告状态失败', e)
                }
            }
            reportStatus.value = status || 'draft'
            await nextTick()
            if (reportRef.value?.refreshAllTechRequirements) {
                await reportRef.value.refreshAllTechRequirements()
            }
        } else {
            // 新建报告默认为 draft
            reportStatus.value = 'draft'
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