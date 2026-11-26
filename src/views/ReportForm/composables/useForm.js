import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export function useForm() {

    const homeForm = reactive({
        ReportNo: '',
        issueSpace: '',
        ClientName: '',
        ClientAddress: '',
        ReceiptDate: '',
        TestCycle: '',
        ReportDate: '',
        IsCnas: false,
    })

    const fixedForm = reactive({
        sampleDesc: '客户提供测试件1套。A set of test pieces provided by customer.',
        inspectionOrderNo: '',
        orderNo: '',
        materialSpec: '',
        sampleName: '',
        sampleMaterial: '',
        sampleSpec: '',
        additionalInfo: '',
        sampleInfo: '',
        testEnv: [{
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        }],
        testEquipment: [{ no: '', name: '', model: '', eqNo: '', validUntil: '' }]
    })

    // ========== 原有方法 ==========

    function addTestEnvRow() {
        fixedForm.testEnv.push({
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        })
    }

    function deleteTestEnvRow(index, testProjectsRef) {
        if (fixedForm.testEnv.length <= 1) {
            ElMessage.warning('至少保留1行！')
            return
        }
        fixedForm.testEnv.splice(index, 1)

        if (testProjectsRef && testProjectsRef.value && testProjectsRef.value.length > index) {
            testProjectsRef.value.splice(index, 1)
        }
    }

    function addTestEquipmentRow() {
        fixedForm.testEquipment.push({ no: '', name: '', model: '', eqNo: '', validUntil: '' })
    }

    function deleteTestEquipmentRow(index) {
        if (fixedForm.testEquipment.length <= 1) {
            ElMessage.warning('至少保留1行！')
            return
        }
        fixedForm.testEquipment.splice(index, 1)
    }

    // ========== 提交报告（保存签名数组） ==========

    async function submitReport(testProjects, isEdit, id, marginData) {
        const validProjects = testProjects.filter(item => item.schemeConfig)

        const submitProjects = validProjects.map((p, index) => {
            const data = JSON.parse(JSON.stringify(p))

            if (!data.reportData.paramValues) {
                data.reportData.paramValues = {}
            }
            data.reportData.Header = {
                TestReference: data.reportData.testReference || '',
                TestReferenceEn: data.schemeConfig?.TestReferenceEn || ''
            }
            data.reportData.BottomRequirement = data.reportData.bottomRequirement || {}
            //  marginData > 现有值 > 5
            data.projectMargin = marginData?.projectMargins?.[index]
                ?? p.ProjectMargin
                ?? 5

            return data
        })

        const submitData = {
            HomeInfo: homeForm,
            FixedInfo: {
                ...fixedForm,
                MarginSettings: marginData ? marginData.fixedMargins : undefined
            },
            TestProjects: submitProjects
        }

        try {
            const res = isEdit
                ? await axios.put(`/api/DetectionReport/${id}`, submitData)
                : await axios.post('/api/DetectionReport', submitData)
            if (res.data.Success) {
                // 新建成功后，把后端返回的 ReportId 存到 homeForm
                if (!isEdit && res.data.ReportId) {
                    homeForm.ReportId = res.data.ReportId
                }

                //返回值改成对象
                return {
                    success: true,
                    reportId: isEdit ? id : res.data.ReportId
                }
            } else {
                return { success: false, reportId: null }
            }
        } catch (err) {
            ElMessage.error('保存失败：' + (err.response?.data?.Message || ''))
            console.error(err)
            return { success: false, reportId: null } 
        }
    }

    // ========== 加载报告（回显签名数组） ==========

    async function loadReportDetail(id, testProjectsRef, fixedFormRef, homeFormRef, projectDataCache) {
        console.log(' loadReportDetail 接收到的 projectDataCache:', projectDataCache);

        try {
            const res = await axios.get(`/api/DetectionReport/${id}`)
            if (res.data.Success) {
                const data = res.data.Data

                if (data.HomeInfo) Object.assign(homeFormRef, data.HomeInfo)

                const fixed = data.FixedInfo || {}
                fixedFormRef.sampleDesc = fixed.sampleDesc || ''
                fixedFormRef.inspectionOrderNo = fixed.inspectionOrderNo || ''
                fixedFormRef.orderNo = fixed.orderNo || ''
                fixedFormRef.materialSpec = fixed.materialSpec || ''
                fixedFormRef.sampleName = fixed.sampleName || ''
                fixedFormRef.sampleMaterial = fixed.sampleMaterial || ''
                fixedFormRef.sampleSpec = fixed.sampleSpec || ''
                fixedFormRef.additionalInfo = fixed.additionalInfo || ''
                fixedFormRef.sampleInfo = fixed.sampleInfo || ''

                fixedFormRef.MarginSettings = fixed.MarginSettings || {};
                fixedFormRef.testEnv = (fixed.testEnv || []).map(row => ({
                    ...row,
                    techSpecCode: row.techSpecCode ? Number(row.techSpecCode) : null
                }))
                fixedFormRef.testEquipment = fixed.testEquipment || []

                // 清空并重新构建 testProjects
                testProjectsRef.value = []
                const projects = data.TestProjects || []

                for (let i = 0; i < projects.length; i++) {
                    const item = projects[i]
                    const schemeConfig = typeof item.SchemeConfig === 'string'
                        ? JSON.parse(item.SchemeConfig)
                        : item.SchemeConfig
                    const rd = item.ReportData || {}

                    if (item.ProjectCode === 'JCXMHJ-06') {
                        console.log('冲击试验原始 ParamValues:', rd.ParamValues)
                        console.log('冲击试验模板 ParamItems:', schemeConfig.ParamItems)
                    }

                    //  每个项目独立管理签名
                    const rawItems = rd.SignatureItems || [];
                    const mappedItems = rawItems.map(item => ({
                        id: item.Id || `sig_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                        role: item.Role || item.role || '',
                        enLabel: item.EnLabel || item.enLabel || '',
                        name: item.Name || item.name || '',
                        signatureUrl: item.SignatureUrl || item.signatureUrl || ''
                    }));

                    testProjectsRef.value.push({
                        projectCode: item.ProjectCode || '',
                        techSpecCode: item.TechSpecCode ? Number(item.TechSpecCode) : null,
                        techSpecName: item.TechSpecName || '',
                        schemeConfig: schemeConfig,
                        showPhotoArea: schemeConfig.PhotoConfig?.enabled ?? false,
                        ProjectMargin: item.ProjectMargin ?? 5,
                        reportData: {
                            Header: rd.Header || { TestReference: '', TestReferenceEn: '' },
                            testReference: rd.TestReference || '',
                            tableData: rd.TableData || [],
                            techRequirement: rd.TechRequirement || {},
                            bottomRequirement: rd.BottomRequirement || {},
                            conclusion: rd.Conclusion || '',
                            note: rd.Note || '',
                            reviewer: rd.Reviewer || '',
                            approval: rd.Approval || {},
                            paramValues: rd.ParamValues || {},
                            photoRows: (rd.PhotoRows || [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }])
                                .map(r => ({
                                    LeftUrl: r.LeftUrl || '',
                                    LeftDesc: r.LeftDesc || '',
                                    RightUrl: r.RightUrl || '',
                                    RightDesc: r.RightDesc || '',
                                    marginTop: r.MarginTop ?? r.marginTop ?? 2.65    // 兼容两种大小写
                                })),
                            impactGroups: rd.ImpactGroups || [],
                            isImpactGrouped: rd.ImpactGroups && rd.ImpactGroups.length > 0,
                            ferriteGroups: rd.FerriteGroups || [],
                            isFerriteGrouped: rd.FerriteGroups && rd.FerriteGroups.length > 0,
                            tensileGroups: rd.TensileGroups || [],
                            isTensileGrouped: rd.TensileGroups && rd.TensileGroups.length > 0,
                            vickersGroups: rd.VickersGroups || [],
                            isVickersGrouped: rd.VickersGroups && rd.VickersGroups.length > 0,
                            corrosionGroups: rd.CorrosionGroups || [],
                            isCorrosionGrouped: rd.CorrosionGroups && rd.CorrosionGroups.length > 0,
                            inclusionGroups: rd.InclusionGroups || [],
                            isInclusionGrouped: rd.InclusionGroups && rd.InclusionGroups.length > 0,
                            chemGroups: rd.ChemGroups || [],
                            isChemGrouped: rd.ChemGroups && rd.ChemGroups.length > 0,
                            metallographicGroups: rd.MetallographicGroups || [],
                            isMetallographicGrouped: rd.MetallographicGroups && rd.MetallographicGroups.length > 0,
                            signatureItems: mappedItems,
                            //  新增：映射 SignatureBlocks（统一转小写）
                            signatureBlocks: (rd.SignatureBlocks || []).map(b => ({
                                Category: b.Category || b.category || '',
                                Reviewer: b.Reviewer || b.reviewer || '',
                                ReviewStatus: b.ReviewStatus || b.review_status || 'pending',
                                ReviewTime: b.ReviewTime || b.review_time || null,
                                ReviewOpinion: b.ReviewOpinion || b.review_opinion || null,
                                ReviewSignatureUrl: b.ReviewSignatureUrl || b.review_signature_url || null,
                                Approver: b.Approver || b.approver || '',
                                ApprovalStatus: b.ApprovalStatus || b.approval_status || 'pending',
                                ApprovalTime: b.ApprovalTime || b.approval_time || null,
                                ApprovalOpinion: b.ApprovalOpinion || b.approval_opinion || null,
                                ApprovalSignatureUrl: b.ApprovalSignatureUrl || b.approval_signature_url || null,
                            }))
                        }
                    })
                }
                ElMessage.success('报告详情加载成功 ✅')
            }
        } catch (err) {
            ElMessage.error('加载失败')
            console.error(err)
        }
    }

    return {
        homeForm,
        fixedForm,
        addTestEnvRow,
        deleteTestEnvRow,
        addTestEquipmentRow,
        deleteTestEquipmentRow,
        submitReport,
        loadReportDetail
    }
}