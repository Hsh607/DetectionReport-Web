import { ref } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import {
    getProjectType,
    mapField,
    autoGenerateMap,
    handleDynamicData,
    handleImpactTestData
} from '../utils/reportMapper'

export function useTestProject() {
    const testProjects = ref([])
    const projectDataCache = ref({})
    const testReferenceCache = ref({})
    const techSpecList = ref([])

    // 获取技术要求列表
    async function getTechSpecList() {
        try {
            const res = await axios.get('/api/DetectionConfig/enable-tech-requirements')
            if (res.data.Success) techSpecList.value = res.data.Data
        } catch (err) {
            console.error('获取技术要求失败', err)
        }
    }

    // 检测依据缓存
    async function getTestReferenceByOrderNo(orderNo) {
        testReferenceCache.value = {}
        if (!orderNo) return
        try {
            const res = await axios.post('/api/yunbiao/test-reference-by-orderno', { orderNo })
            const dataList = res.data || []
            dataList.forEach(item => {
                const code = item["项目编码"]
                const standard = item["检测标准"]
                if (code && standard) testReferenceCache.value[code] = standard
            })
        } catch (error) {
            console.error("获取检测依据失败：", error)
        }
    }

    // 获取已报检项目列表并构建 testEnv 和 testProjects 占位
    async function getInspectionListByOrderNo(orderNo, inspectionNo) {
        if (!orderNo) return []
        try {
            const res = await axios.post('/api/yunbiao/inspection-items-by-orderno', {
                orderNo,
                inspectionNo: inspectionNo || ""
            })
            const itemList = res.data || []
            if (itemList.length === 0) {
                ElMessage.info("未查询到报检项目")
            }
            return itemList // 🔧 修复：确保返回 itemList
        } catch (err) {
            ElMessage.error("查询已报检项目失败")
            return []
        }
    }

    // 委托协议信息填充（返回数据，由父组件合并到 fixedForm）
    async function getAgreementByOrderNo(orderNo) {
        if (!orderNo) return null
        try {
            const res = await axios.post('/api/yunbiao/agreement-by-orderno', { orderNo })
            return res.data || null
        } catch (err) {
            console.error('获取委托协议失败', err)
            return null
        }
    }

    // 批量预加载数据（串行）
    async function batchGetAllProjectData(orderNo, inspectionOrderNo, testEnv) {
        projectDataCache.value = {}
        if (!orderNo || !inspectionOrderNo) {
            ElMessage.warning('请先选择委托单和报检单')
            return
        }
        const validItems = testEnv.filter(item => item.item)
        if (validItems.length === 0) {
            ElMessage.info('未检测到有效检测项目')
            return
        }

        const loading = ElLoading.service({
            text: `正在预加载 ${validItems.length} 个项目数据...`,
            background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
            let successCount = 0
            for (const item of validItems) {
                await new Promise(resolve => setTimeout(resolve, 200))
                try {
                    const projectType = getProjectType(item.item)
                    const res = await axios.post(`/api/yunbiao/report-data/${projectType}`, {
                        orderNo,
                        inspectionNo: inspectionOrderNo
                    })
                    const originalIndex = testEnv.findIndex(i => i.item === item.item)
                    if (originalIndex > -1 && res?.data) {
                        projectDataCache.value[originalIndex] = Array.isArray(res.data) ? res.data : [res.data]
                        successCount++
                    }
                } catch (err) {
                    console.warn(`项目【${item.item}】请求失败：`, err)
                }
            }
            if (successCount === validItems.length) {
                ElMessage.success(`全部 ${successCount} 个项目数据预加载完成！`)
            } else {
                ElMessage.warning(`成功加载 ${successCount}/${validItems.length} 个项目，部分接口异常`)
            }
        } finally {
            loading.close()
        }
    }

    // 匹配模板并加载数据
    async function matchSchemeAndLoadTemplate(rowIndex, projectCode, techSpecCode, testEnv, testProjectsRef) {
        if (!testEnv[rowIndex] || !testProjectsRef.value[rowIndex]) return
        if (!projectCode || !techSpecCode) return

        try {
            const res = await axios.get(`/api/DetectionConfig/scheme-by-code`, {
                params: { projectCode, techSpecCode }
            })
            if (res.data.Success && res.data.Data) {
                const schemeConfig = JSON.parse(res.data.Data.ConfigContent || "{}")
                const row = testEnv[rowIndex]

                // eslint-disable-next-line no-param-reassign
                testProjectsRef.value[rowIndex] = {
                    ...testProjectsRef.value[rowIndex],
                    projectCode,
                    techSpecCode,
                    techSpecName: row.techSpecName,
                    schemeConfig,
                    showPhotoArea: schemeConfig.PhotoConfig?.enabled ?? false,
                    reportData: {
                        Header: { TestReference: "", TestReferenceEn: "" },
                        testReference: "",
                        tableData: [],
                        techRequirement: {},
                        bottomRequirement: {},
                        conclusion: "",
                        note: "",
                        reviewer: "",
                        approval: {},
                        paramValues: {},
                        photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "" }]
                    }
                }

                // 检测依据回填
                const currentProjectCode = (projectCode || '').trim()
                if (testReferenceCache.value[currentProjectCode]) {
                    // eslint-disable-next-line no-param-reassign
                    testProjectsRef.value[rowIndex].reportData.testReference = testReferenceCache.value[currentProjectCode]
                }

                // 数据回填
                const cachedData = projectDataCache.value[rowIndex]
                if (cachedData && Array.isArray(cachedData)) {
                    const project = testProjectsRef.value[rowIndex]
                    const { tableMap, paramMap } = autoGenerateMap(project.schemeConfig)

                    const dynamicSampleColumn = project.schemeConfig?.ExtendColumns?.find(col => col.isDynamic)
                    const elementColId = project.schemeConfig?.BaseColumns[0]?.id
                    const unitColId = project.schemeConfig?.BaseColumns[1]?.id

                    if (dynamicSampleColumn) {
                        const projectType = getProjectType(row.item)
                        let sampleList, paramList, resultMap

                        if (projectType === 'impact-test') {
                            const impactRes = handleImpactTestData(cachedData)
                            sampleList = impactRes.sampleList
                            paramList = impactRes.paramList
                            resultMap = impactRes.resultMap
                            dynamicSampleColumn.subColumns = sampleList.map(s => ({
                                id: `sample_${s}`,
                                label: s,
                                yunbiaoField: `sample_${s}`
                            }))
                            // eslint-disable-next-line no-param-reassign
                            project.reportData.tableData = paramList.map((param, index) => {
                                const rowData = {}
                                if (elementColId) rowData[elementColId] = param.label
                                if (unitColId) rowData[unitColId] = cachedData[index]?.['检测位置'] || ''
                                sampleList.forEach(sample => {
                                    const sampleKey = `sample_${sample}`
                                    rowData[sampleKey] = resultMap[param.key][sampleKey] || '/'
                                })
                                return rowData
                            })
                        } else {
                            const dynamicRes = handleDynamicData(cachedData, dynamicSampleColumn)
                            sampleList = dynamicRes.sampleList
                            paramList = dynamicRes.paramList
                            resultMap = dynamicRes.resultMap
                            dynamicSampleColumn.subColumns = sampleList.map(s => ({
                                id: `sample_${s}`,
                                label: s,
                                yunbiaoField: `sample_${s}`
                            }))
                            // eslint-disable-next-line no-param-reassign
                            project.reportData.tableData = paramList.map(param => {
                                const rowData = {}
                                const [element, unit] = param.split(/[，, \s]+/).map(i => i?.trim() || '')
                                if (elementColId) rowData[elementColId] = element
                                if (unitColId) rowData[unitColId] = unit
                                sampleList.forEach(sample => {
                                    rowData[`sample_${sample}`] = resultMap[sample][param] || '/'
                                })
                                return rowData
                            })
                        }
                    } else {
                        // eslint-disable-next-line no-param-reassign
                        project.reportData.tableData = cachedData.map(item => mapField(item, tableMap))
                    }
                    const firstItem = cachedData[0] || {}
                    // eslint-disable-next-line no-param-reassign
                    project.reportData.paramValues = mapField(firstItem, paramMap)
                    ElMessage.success(`${row.item}数据自动填充完成`)
                }
            } else {
                ElMessage.warning("未匹配到对应配置模板")
            }
        } catch (err) {
            ElMessage.error("模板查询失败")
            console.error(err)
        }
    }

    // 设置默认技术要求
    async function setDefaultTechSpecForAllRows(testEnv, testProjectsRef) {
        if (!techSpecList.value.length) await getTechSpecList()
        const defaultTech = techSpecList.value.find(item => item.Name.trim() === '默认配置')
        if (!defaultTech) {
            ElMessage.warning('未找到默认配置')
            return
        }
        testEnv.forEach((row, idx) => {
            if (row.projectCode) {
                // eslint-disable-next-line no-param-reassign
                row.techSpecCode = Number(defaultTech.Id)
                // eslint-disable-next-line no-param-reassign
                row.techSpecName = defaultTech.Name
                matchSchemeAndLoadTemplate(idx, row.projectCode, row.techSpecCode, testEnv, testProjectsRef)
            }
        })
        ElMessage.success('已全部设置为默认配置')
    }

    // 表格行操作
    function addTableRow(projectIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) {
            ElMessage.warning('请先加载模板')
            return
        }
        const row = {}
            ;[...(project.schemeConfig.BaseColumns || []), ...(project.schemeConfig.ExtendColumns || [])].forEach(col => row[col.id] = '')
        project.reportData.tableData.push(row)
    }

    function deleteTableRow(projectIndex, rowIndex) {
        testProjects.value[projectIndex].reportData.tableData.splice(rowIndex, 1)
    }

    function addPhotoRow(projectIndex) {
        testProjects.value[projectIndex].reportData.photoRows.push({ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' })
    }

    function removePhotoRow(projectIndex, rowIndex) {
        const rows = testProjects.value[projectIndex].reportData.photoRows
        if (rows.length <= 1) {
            ElMessage.warning('至少保留一行')
            return
        }
        rows.splice(rowIndex, 1)
    }

    function pickPhoto(projectIndex, rowIndex, pos) {
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/*'
        inp.onchange = e => {
            const file = e.target.files[0]
            if (!file) return
            const url = URL.createObjectURL(file)
            const row = testProjects.value[projectIndex].reportData.photoRows[rowIndex]
            if (pos === 1) row.LeftUrl = url
            if (pos === 2) row.RightUrl = url
        }
        inp.click()
    }

    // 事件处理（供组件调用）
    function onProjectCodeChange(rowIndex, code, testEnv, testProjectsRef) {
        // 👉 新增：判断行是否存在，无效直接退出
        if (!testEnv || !testEnv[rowIndex]) return;
        const row = testEnv[rowIndex]
        // 👉 新增：可选链兜底
        matchSchemeAndLoadTemplate(rowIndex, code, row?.techSpecCode, testEnv, testProjectsRef)
    }

    function onTechSpecChange(rowIndex, specId, testEnv, testProjectsRef) {
        // 1. 先判断 rowIndex 是否在有效范围内
        if (!testEnv || rowIndex < 0 || rowIndex >= testEnv.length) {
            console.warn('无效的行索引 rowIndex:', rowIndex, 'testEnv 长度:', testEnv?.length)
            return
        }

        const row = testEnv[rowIndex]
        // 2. 再判断当前行是否存在
        if (!row) {
            console.warn('testEnv 中无此行数据，rowIndex:', rowIndex)
            return
        }

        // 3. 查找对应的技术要求，兼容类型不匹配问题（比如 specId 是字符串，tech.Id 是数字）
        const tech = techSpecList.value.find(t => t.Id == specId)
        if (tech) {
            row.techSpecName = tech.Name
            row.techSpecCode = tech.Id // 同步 techSpecCode，避免后续逻辑不一致
        } else {
            console.warn('未找到匹配的技术要求，specId:', specId)
        }

        // 4. 用可选链兜底，即使 projectCode 为空也不报错
        matchSchemeAndLoadTemplate(rowIndex, row?.projectCode, specId, testEnv, testProjectsRef)
    }

    return {
        testProjects,
        techSpecList,
        getTechSpecList,
        getTestReferenceByOrderNo,
        getInspectionListByOrderNo,
        getAgreementByOrderNo,
        batchGetAllProjectData,
        matchSchemeAndLoadTemplate,
        setDefaultTechSpecForAllRows,
        addTableRow,
        deleteTableRow,
        addPhotoRow,
        removePhotoRow,
        pickPhoto,
        onProjectCodeChange,
        onTechSpecChange
    }
}