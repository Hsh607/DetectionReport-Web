import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export function useForm() {

    const homeForm = reactive({
        reportNo: '',
        issueSpace: '',
        ClientName: '',
        ClientAddress: '',
        ReceiptDate: '', 
        TestCycle: '', 
        ReportDate: ''
    })

    const fixedForm = reactive({
        sampleDesc: '',
        inspectionOrderNo: '',
        orderNo: '',
        materialSpec: '',
        sampleName: '',
        sampleMaterial: '',
        sampleSpec: '',
        additionalInfo: '',
        testEnv: [{
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        }],
        testEquipment: [{ no: '', name: '', model: '', eqNo: '', validUntil: '' }]
    })

    function addTestEnvRow() {
        fixedForm.testEnv.push({
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        })
    }

    function deleteTestEnvRow(index) {
        if (fixedForm.testEnv.length <= 1) {
            ElMessage.warning('至少保留1行！')
            return
        }
        fixedForm.testEnv.splice(index, 1)
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

    // 🔥 已修复：接收 marginData 参数 + 保存项目间距 + 兼容旧数据
    async function submitReport(testProjects, isEdit, id, marginData) {
        const validProjects = testProjects.filter(item => item.schemeConfig)

        // 🔥 修复：添加 index，保存每个项目的间距
        const submitProjects = validProjects.map((p, index) => {
            const data = JSON.parse(JSON.stringify(p))
            // 确保 paramValues 存在
            if (!data.reportData.paramValues) {
                data.reportData.paramValues = {}
            }
            data.reportData.Header = {
                TestReference: data.reportData.testReference || '',
                TestReferenceEn: data.schemeConfig?.TestReferenceEn || ''
            }
            data.reportData.bottomRequirement = data.reportData.bottomRequirement || {}

            // 🔥 新增：保存当前检测项目的间距（兼容无数据情况）
            data.projectMargin = marginData?.projectMargins?.[index] ?? 30
            return data
        })

        const submitData = {
            HomeInfo: homeForm,
            FixedInfo: {
                ...fixedForm,
                // 🔥 修复：兼容 marginData 不存在的情况，不报错
                MarginSettings: marginData ? marginData.fixedMargins : undefined
            },
            TestProjects: submitProjects
        }

        const impact = testProjects.find(p => p.projectCode === 'JCXMHJ-06')
        console.log('冲击试验当前 paramValues:', impact?.reportData?.paramValues)

        try {
            const res = isEdit
                ? await axios.put(`/api/DetectionReport/${id}`, submitData)
                : await axios.post('/api/DetectionReport', submitData)
            if (res.data.Success) {
                ElMessage.success('保存成功')
                return true
            } else {
                ElMessage.error(res.data.Message)
                return false
            }
        } catch (err) {
            ElMessage.error('保存失败：' + (err.response?.data?.Message || ''))
            console.error(err)
            return false
        }
    }

    async function loadReportDetail(id, testProjectsRef, fixedFormRef, homeFormRef) {
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

                fixedFormRef.MarginSettings = fixed.MarginSettings || {};
                fixedFormRef.testEnv = (fixed.testEnv || []).map(row => ({
                    ...row,
                    techSpecCode: row.techSpecCode ? Number(row.techSpecCode) : null
                }))
                fixedFormRef.testEquipment = fixed.testEquipment || []

                // 清空并重新构建 testProjects
                testProjectsRef.value = []
                const projects = data.TestProjects || []
                for (const item of projects) {
                    const schemeConfig = typeof item.SchemeConfig === 'string'
                        ? JSON.parse(item.SchemeConfig)
                        : item.SchemeConfig
                    const rd = item.ReportData || {}

                    if (item.ProjectCode === 'JCXMHJ-06') {  // 冲击试验的编码
                        console.log('冲击试验原始 ParamValues:', rd.ParamValues)
                        console.log('冲击试验模板 ParamItems:', schemeConfig.ParamItems)
                    }

                    testProjectsRef.value.push({
                        projectCode: item.ProjectCode || '',
                        techSpecCode: item.TechSpecCode ? Number(item.TechSpecCode) : null,
                        techSpecName: item.TechSpecName || '',
                        schemeConfig: schemeConfig,
                        showPhotoArea: schemeConfig.PhotoConfig?.enabled ?? false,
                        ProjectMargin: item.ProjectMargin ?? 30,

                        reportData: {
                            Header: rd.Header || { TestReference: '', TestReferenceEn: '' },
                            testReference: rd.TestReference || '',
                            tableData: rd.TableData || [],
                            techRequirement: rd.TechRequirement || {},
                            bottomRequirement: rd.BottomRequirement || {},
                            conclusion: rd.Conclusion ,
                            note: rd.Note || '',
                            reviewer: rd.Reviewer || '',
                            approval: rd.Approval || {},
                            paramValues: rd.ParamValues || {},
                            photoRows: rd.PhotoRows || [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
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