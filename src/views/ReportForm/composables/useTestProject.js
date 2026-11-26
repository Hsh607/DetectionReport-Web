import { ref } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import {
    getProjectType,
    mapField,
    autoGenerateMap,
    handleDynamicData,
    groupImpactData
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

    /** 复制一个室温拉伸分组（插到当前组后面） */
    function cloneTensileGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex];
        const groups = project?.reportData?.tensileGroups;
        if (!groups || !groups[groupIndex]) return;

        const source = groups[groupIndex];

        // 深拷贝，避免引用共享
        const cloned = JSON.parse(JSON.stringify(source));

        // 组名自动加序号，避免重名
        cloned.groupLabel = `${source.groupLabel} (副本)`;

        // 插入到当前组后面
        groups.splice(groupIndex + 1, 0, cloned);

        // 保险：确保分组模式开启
        project.reportData.isTensileGrouped = true;

        ElMessage.success('已复制当前分组');
    }

    /** 把单表格提升为多分组模式（复制当前表格为新组） */
    function copyTensileTableAsGroup(projectIndex) {
        const project = testProjects.value[projectIndex];
        if (!project?.schemeConfig) return;

        const currentData = project.reportData.tableData || [];
        if (currentData.length === 0) {
            ElMessage.warning('当前表格无数据可复制');
            return;
        }

        // 深拷贝，避免共享引用
        const clonedData = JSON.parse(JSON.stringify(currentData));

        // 当前数据作为第 1 组
        const firstGroup = {
            groupLabel: '技术要求组 1',
            techRequirements: JSON.parse(JSON.stringify(project.reportData.techRequirement || {})),
            tableData: currentData,
            conclusion: project.reportData.conclusion || '',
            note: project.reportData.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(project.reportData.bottomRequirement || {})),
            marginTop: 5
        };

        // 复制为第 2 组
        const secondGroup = {
            groupLabel: '技术要求组 2',
            techRequirements: JSON.parse(JSON.stringify(project.reportData.techRequirement || {})),
            tableData: clonedData,
            conclusion: project.reportData.conclusion || '',
            note: project.reportData.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(project.reportData.bottomRequirement || {})),
            marginTop: 5
        };

        project.reportData.tensileGroups = [firstGroup, secondGroup];
        project.reportData.isTensileGrouped = true;
        project.reportData.tableData = [];   //  清空，避免双重渲染

        ElMessage.success('已复制为新表格');
    }

    // ==================== 点腐蚀 / 晶间腐蚀：分组操作 ====================

    /** 把单表格提升为多分组模式（复制当前表格为新组） */
    function copyCorrosionTableAsGroup(projectIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return

        const rd = project.reportData || (project.reportData = {})

        // 已有分组：直接再复制一组
        if (rd.isCorrosionGrouped && Array.isArray(rd.corrosionGroups) && rd.corrosionGroups.length > 0) {
            const last = rd.corrosionGroups[rd.corrosionGroups.length - 1]
            rd.corrosionGroups.push({
                groupLabel: `表格 ${rd.corrosionGroups.length + 1}`,
                marginTop: 5,
                tableData: JSON.parse(JSON.stringify(last.tableData || [])),
                techRequirement: typeof last.techRequirement === 'string' ? last.techRequirement : '',
                conclusion: last.conclusion || '',
                note: last.note || '',
                bottomRequirement: JSON.parse(JSON.stringify(last.bottomRequirement || {}))
            })
            ElMessage.success('已复制为新表格')
            return
        }

        // 首次：单表格  第 1 组 + 复制出第 2 组
        const currentData = rd.tableData || []
        if (currentData.length === 0) {
            ElMessage.warning('当前表格无数据可复制')
            return
        }

        const firstGroup = {
            groupLabel: '表格 1',
            marginTop: 5,
            tableData: currentData,
            techRequirement: typeof rd.techRequirement === 'string' ? rd.techRequirement : '',
            conclusion: rd.conclusion || '',
            note: rd.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(rd.bottomRequirement || {}))
        }
        const secondGroup = {
            groupLabel: '表格 2',
            marginTop: 5,
            tableData: JSON.parse(JSON.stringify(currentData)),
            techRequirement: typeof rd.techRequirement === 'string' ? rd.techRequirement : '',
            conclusion: rd.conclusion || '',
            note: rd.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(rd.bottomRequirement || {}))
        }

        rd.corrosionGroups = [firstGroup, secondGroup]
        rd.isCorrosionGrouped = true
        rd.tableData = []   // 清空，避免双重渲染

        ElMessage.success('已复制为新表格')
    }

    /** 复制一个腐蚀分组（插到当前组后面） */
    function cloneCorrosionGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        const groups = project?.reportData?.corrosionGroups
        if (!groups || !groups[groupIndex]) return

        const source = groups[groupIndex]
        const cloned = JSON.parse(JSON.stringify(source))
        cloned.groupLabel = `${source.groupLabel || '表格'} (副本)`

        groups.splice(groupIndex + 1, 0, cloned)
        project.reportData.isCorrosionGrouped = true

        ElMessage.success('已复制当前表格')
    }

    /** 删除整个腐蚀分组 */
    function deleteCorrosionGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.reportData?.corrosionGroups) return

        project.reportData.corrosionGroups.splice(groupIndex, 1)
        if (project.reportData.corrosionGroups.length === 0) {
            project.reportData.isCorrosionGrouped = false
        }
    }

    /** 新增腐蚀分组行 */
    function addCorrosionRow(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) {
            ElMessage.warning('请先加载模板')
            return
        }
        const group = project.reportData.corrosionGroups?.[groupIndex]
        if (!group) return

        const newRow = {}
        const allCols = [
            ...(project.schemeConfig.BaseColumns || []),
            ...(project.schemeConfig.ExtendColumns || [])
        ]
        allCols.forEach(col => newRow[col.id] = '')
        group.tableData.push(newRow)
    }

    /** 删除腐蚀分组行 */
    function deleteCorrosionRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex]
        const group = project.reportData.corrosionGroups?.[groupIndex]
        if (!group) return

        group.tableData.splice(rowIndex, 1)

        if (group.tableData.length === 0) {
            project.reportData.corrosionGroups.splice(groupIndex, 1)
            if (project.reportData.corrosionGroups.length === 0) {
                project.reportData.isCorrosionGrouped = false
            }
        }
    }

    // ==================== 非金属夹杂物：分组操作 ====================

    function isInclusionProject(project) {
        const title = project?.schemeConfig?.ProjectTitle || ''
        return title.includes('非金属夹杂物') || project?.projectCode === 'JCXMHJ-16'
    }

    /** 单表格 → 多分组 */
    function copyInclusionTableAsGroup(projectIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const rd = project.reportData || (project.reportData = {})

        // 已有分组：直接追加一组
        if (rd.isInclusionGrouped && rd.inclusionGroups?.length > 0) {
            const last = rd.inclusionGroups[rd.inclusionGroups.length - 1]
            rd.inclusionGroups.push({
                groupLabel: `表格 ${rd.inclusionGroups.length + 1}`,
                marginTop: 5,
                tableData: JSON.parse(JSON.stringify(last.tableData || [])),
                techRequirement: JSON.parse(JSON.stringify(last.techRequirement || {})),
                conclusion: last.conclusion || '',
                note: last.note || '',
                bottomRequirement: JSON.parse(JSON.stringify(last.bottomRequirement || {}))
            })
            ElMessage.success('已复制为新表格')
            return
        }

        // 首次：单表 → 2组
        const currentData = rd.tableData || []
        if (currentData.length === 0) {
            ElMessage.warning('当前表格无数据可复制')
            return
        }

        const firstGroup = {
            groupLabel: '表格 1',
            marginTop: 5,
            tableData: currentData,
            techRequirement: JSON.parse(JSON.stringify(rd.techRequirement || {})),
            conclusion: rd.conclusion || '',
            note: rd.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(rd.bottomRequirement || {}))
        }
        const secondGroup = JSON.parse(JSON.stringify(firstGroup))
        secondGroup.groupLabel = '表格 2'
        secondGroup.tableData = JSON.parse(JSON.stringify(currentData))

        rd.inclusionGroups = [firstGroup, secondGroup]
        rd.isInclusionGrouped = true
        rd.tableData = []

        ElMessage.success('已复制为新表格')
    }

    /** 复制本组 */
    function cloneInclusionGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        const groups = project?.reportData?.inclusionGroups
        if (!groups || !groups[groupIndex]) return
        const cloned = JSON.parse(JSON.stringify(groups[groupIndex]))
        cloned.groupLabel = `${groups[groupIndex].groupLabel || '表格'} (副本)`
        groups.splice(groupIndex + 1, 0, cloned)
        ElMessage.success('已复制当前分组')
    }

    /** 删除本组 */
    function deleteInclusionGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.reportData?.inclusionGroups) return
        project.reportData.inclusionGroups.splice(groupIndex, 1)
        if (project.reportData.inclusionGroups.length === 0) {
            project.reportData.isInclusionGrouped = false
        }
    }

    /** 新增行 */
    function addInclusionRow(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const group = project.reportData.inclusionGroups?.[groupIndex]
        if (!group) return

        const newRow = {}
        const allCols = [
            ...(project.schemeConfig.BaseColumns || []),
            ...(project.schemeConfig.ExtendColumns || [])
        ]
        allCols.forEach(col => {
            if (col.subColumns?.length > 0) {
                col.subColumns.forEach(sub => newRow[sub.id] = '')
            } else {
                newRow[col.id] = ''
            }
        })
        group.tableData.push(newRow)
    }

    /** 删除行 */
    function deleteInclusionRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex]
        const group = project.reportData.inclusionGroups?.[groupIndex]
        if (!group) return
        group.tableData.splice(rowIndex, 1)
        if (group.tableData.length === 0) {
            project.reportData.inclusionGroups.splice(groupIndex, 1)
            if (project.reportData.inclusionGroups.length === 0) {
                project.reportData.isInclusionGrouped = false
            }
        }
    }

    // ==================== 化学成分：分组操作 ====================

    /** 单表格 → 多分组 */
    function copyChemTableAsGroup(projectIndex) {
        console.log(' 1. 进入 copyChemTableAsGroup');

        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const rd = project.reportData || (project.reportData = {})

        // 已有分组：直接追加一组
        if (rd.isChemGrouped && rd.chemGroups?.length > 0) {
            const last = rd.chemGroups[rd.chemGroups.length - 1]
            rd.chemGroups.push({
                groupLabel: `表格 ${rd.chemGroups.length + 1}`,
                marginTop: 5,
                tableData: JSON.parse(JSON.stringify(last.tableData || [])),
                // 动态列的 subColumns 也一并复制
                dynamicSubColumns: JSON.parse(JSON.stringify(last.dynamicSubColumns || [])),
                techRequirement: JSON.parse(JSON.stringify(last.techRequirement || {})),
                conclusion: last.conclusion || '',
                note: last.note || '',
                bottomRequirement: JSON.parse(JSON.stringify(last.bottomRequirement || {}))
            })
            ElMessage.success('已复制为新表格')
            return
        }

        // 首次：单表 → 2组
        const currentData = rd.tableData || []
        if (currentData.length === 0) {
            ElMessage.warning('当前表格无数据可复制')
            return
        }

        // 获取当前动态列的 subColumns
        const dynamicCol = project.schemeConfig.ExtendColumns?.find(col => col.isDynamic)
        const currentSubCols = dynamicCol?.subColumns || []

        const firstGroup = {
            groupLabel: '表格 1',
            marginTop: 5,
            tableData: currentData,
            dynamicSubColumns: currentSubCols,
            techRequirement: JSON.parse(JSON.stringify(rd.techRequirement || {})),
            conclusion: rd.conclusion || '',
            note: rd.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(rd.bottomRequirement || {}))
        }
        const secondGroup = JSON.parse(JSON.stringify(firstGroup))
        secondGroup.groupLabel = '表格 2'
        secondGroup.tableData = JSON.parse(JSON.stringify(currentData))

        rd.chemGroups = [firstGroup, secondGroup]
        rd.isChemGrouped = true
        rd.tableData = []

        ElMessage.success('已复制为新表格')
    }

    /** 复制本组 */
    function cloneChemGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        const groups = project?.reportData?.chemGroups
        if (!groups || !groups[groupIndex]) return
        const cloned = JSON.parse(JSON.stringify(groups[groupIndex]))
        cloned.groupLabel = `${groups[groupIndex].groupLabel || '表格'} (副本)`
        groups.splice(groupIndex + 1, 0, cloned)
        ElMessage.success('已复制当前分组')
    }

    /** 删除本组 */
    function deleteChemGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.reportData?.chemGroups) return
        project.reportData.chemGroups.splice(groupIndex, 1)
        if (project.reportData.chemGroups.length === 0) {
            project.reportData.isChemGrouped = false
        }
    }

    /** 新增行 */
    function addChemRow(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const group = project.reportData.chemGroups?.[groupIndex]
        if (!group) return

        const newRow = {}
            // 基础列
            ; (project.schemeConfig.BaseColumns || []).forEach(col => {
                newRow[col.id] = ''
            })
        // 动态列的子列（试样编号）
        if (group.dynamicSubColumns) {
            group.dynamicSubColumns.forEach(sub => {
                newRow[sub.id] = ''
            })
        }
        // 扩展列（技术要求、结论等）
         (project.schemeConfig.ExtendColumns || []).forEach(col => {
            if (!col.isDynamic) {
                newRow[col.id] = ''
            }
        })
        group.tableData.push(newRow)
    }

    /** 删除行 */
    function deleteChemRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex]
        const group = project.reportData.chemGroups?.[groupIndex]
        if (!group) return
        group.tableData.splice(rowIndex, 1)
        if (group.tableData.length === 0) {
            project.reportData.chemGroups.splice(groupIndex, 1)
            if (project.reportData.chemGroups.length === 0) {
                project.reportData.isChemGrouped = false
            }
        }
    }

    // ==================== 金相检验：分组操作 ====================

    /** 单表格 → 多分组 */
    /** 单表格 → 多分组 */
    /** 单表格 → 多分组 */
    function copyMetallographicTableAsGroup(projectIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const rd = project.reportData || (project.reportData = {})

        // ⭐ 全部改回小写
        if (rd.isMetallographicGrouped && rd.metallographicGroups?.length > 0) {
            const last = rd.metallographicGroups[rd.metallographicGroups.length - 1]
            rd.metallographicGroups.push({
                groupLabel: `表格 ${rd.metallographicGroups.length + 1}`,
                marginTop: 5,
                tableData: JSON.parse(JSON.stringify(last.tableData || [])),
                techRequirement: JSON.parse(JSON.stringify(last.techRequirement || {})),
                conclusion: last.conclusion || '',
                note: last.note || '',
                bottomRequirement: JSON.parse(JSON.stringify(last.bottomRequirement || {})),
                testReference: last.testReference || rd.testReference || '' // ⭐ 小写
            })
            ElMessage.success('已复制为新表格')
            return
        }

        const currentData = rd.tableData || []
        if (currentData.length === 0) {
            ElMessage.warning('当前表格无数据可复制')
            return
        }

        const firstGroup = {
            groupLabel: '表格 1',
            marginTop: 5,
            tableData: currentData,
            techRequirement: JSON.parse(JSON.stringify(rd.techRequirement || {})),
            conclusion: rd.conclusion || '',
            note: rd.note || '',
            bottomRequirement: JSON.parse(JSON.stringify(rd.bottomRequirement || {})),
            testReference: rd.testReference || ''
        }
        const secondGroup = JSON.parse(JSON.stringify(firstGroup))
        secondGroup.groupLabel = '表格 2'
        secondGroup.tableData = JSON.parse(JSON.stringify(currentData))

        rd.metallographicGroups = [firstGroup, secondGroup] // ⭐ 小写
        rd.isMetallographicGrouped = true
        rd.tableData = []

        ElMessage.success('已复制为新表格')
    }

    /** 复制本组 */
    function cloneMetallographicGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        const groups = project?.reportData?.metallographicGroups
        if (!groups || !groups[groupIndex]) return
        const cloned = JSON.parse(JSON.stringify(groups[groupIndex]))
        cloned.groupLabel = `${groups[groupIndex].groupLabel || '表格'} (副本)`
        groups.splice(groupIndex + 1, 0, cloned)
        ElMessage.success('已复制当前分组')
    }

    /** 删除本组 */
    function deleteMetallographicGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.reportData?.metallographicGroups) return
        project.reportData.metallographicGroups.splice(groupIndex, 1)
        if (project.reportData.metallographicGroups.length === 0) {
            project.reportData.isMetallographicGrouped = false
        }
    }

    /** 新增行 */
    function addMetallographicRow(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex]
        if (!project?.schemeConfig) return
        const group = project.reportData.metallographicGroups?.[groupIndex]
        if (!group) return

        const newRow = {}
        const allCols = [
            ...(project.schemeConfig.BaseColumns || []),
            ...(project.schemeConfig.ExtendColumns || [])
        ]
        allCols.forEach(col => {
            if (col.subColumns?.length > 0) {
                col.subColumns.forEach(sub => newRow[sub.id] = '')
            } else {
                newRow[col.id] = ''
            }
        })
        group.tableData.push(newRow)
    }

    /** 删除行 */
    function deleteMetallographicRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex]
        const group = project.reportData.metallographicGroups?.[groupIndex]
        if (!group) return
        group.tableData.splice(rowIndex, 1)
        if (group.tableData.length === 0) {
            project.reportData.metallographicGroups.splice(groupIndex, 1)
            if (project.reportData.metallographicGroups.length === 0) {
                project.reportData.isMetallographicGrouped = false
            }
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

            // ✅ 化学成分置底
            // ⚠️ 原始数据字段是「项目名称」，不是 item
            const sortedList = itemList
                .map((item, index) => {
                    const name = item?.["项目名称"] || item?.["项目名"] || ''
                    return {
                        item,
                        index,
                        weight: /化学成分/.test(name) ? 1 : 0
                    }
                })
                .sort((a, b) => a.weight - b.weight || a.index - b.index)
                .map(({ item }) => item)

            console.log('📋 排序后项目顺序:', sortedList.map(i => (i["项目名称"] || '').replace(/\n/g, ' ')))
            return sortedList
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
                        console.log('✅ [batchGetAllProjectData] 缓存已填充:', {
                            originalIndex,
                            dataLength: projectDataCache.value[originalIndex]?.length,
                            data: projectDataCache.value[originalIndex]
                        });
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
    async function matchSchemeAndLoadTemplate(rowIndex, projectCode, techSpecCode, testEnv, testProjectsRef, orderNo = '', inspectionNo = '') {
        console.log('🔍 [matchSchemeAndLoadTemplate] 调用参数:', {
            rowIndex,
            projectCode,
            techSpecCode,
            testEnvLength: testEnv?.length,
            testProjectsRefLength: testProjectsRef.value?.length,
            hasCache: !!projectDataCache.value[rowIndex],
            cacheData: projectDataCache.value[rowIndex]
        });

        // ========== 补全 testProjectsRef 长度（保证索引有效） ==========
        while (testProjectsRef.value.length <= rowIndex) {
            testProjectsRef.value.push({
                projectCode: '',
                techSpecCode: '',
                techSpecName: '',
                schemeConfig: null,
                showPhotoArea: false,
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
                    photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "", marginTop: 2.65 }]

                }
            });
        }

        // 原有检查
        if (!testEnv[rowIndex] || !testProjectsRef.value[rowIndex]) return;
        if (!projectCode || !techSpecCode) return;

        try {
            const res = await axios.get(`/api/DetectionConfig/scheme-by-code`, {
                params: { projectCode, techSpecCode }
            })

            if (res.data.Success && res.data.Data) {
                const schemeConfig = JSON.parse(res.data.Data.ConfigContent || "{}")
                console.log('📋 加载到的模板标题:', schemeConfig.ProjectTitle)
                const row = testEnv[rowIndex]

                const _title = schemeConfig?.ProjectTitle || ''
                const _isCorrosion = _title.includes('点腐蚀') || _title.includes('晶间腐蚀')

                //备份已有审批数据（切换模板时保留审批区域）
                const oldRd = testProjectsRef.value[rowIndex]?.reportData || {}
                // 直接覆盖该索引的对象（保留原有引用，但完全替换）
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
                        techRequirement: _isCorrosion ? '' : {}, 
                        bottomRequirement: {},
                        conclusion: "",
                        note: "",
                        paramValues: {},
                        photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "" }],
                        impactGroups: [],          //  强制重置
                        isImpactGrouped: false,
                        inclusionGroups: [],
                        isInclusionGrouped: false,
                        ferriteGroups: [],
                        isFerriteGrouped: false,
                        corrosionGroups: [],
                        isCorrosionGrouped: false,
                        chemGroups: [],
                        isChemGrouped: false,
                        metallographicGroups: [],
                        isMetallographicGrouped: false,
                        // ⭐ 保留审批相关数据（业务上切换模板不清空审批区域）
                        reviewer: oldRd.reviewer || '',
                        approver: oldRd.approver || '',
                        reviewStatus: oldRd.reviewStatus || 'pending',
                        approvalStatus: oldRd.approvalStatus || 'pending',
                        approval: oldRd.approval || {},
                        signatureItems: oldRd.signatureItems || oldRd.SignatureItems || [],
                        signatureBlocks: oldRd.signatureBlocks || oldRd.SignatureBlocks || [],
                        compiledSignatureUrl: oldRd.compiledSignatureUrl || '',
                        reviewSignatureUrl: oldRd.reviewSignatureUrl || '',
                        approvalSignatureUrl: oldRd.approvalSignatureUrl || ''
                    }
                }

                // 检测依据回填
                const currentProjectCode = (projectCode || '').trim()
                if (testReferenceCache.value[currentProjectCode]) {
                    testProjectsRef.value[rowIndex].reportData.testReference = testReferenceCache.value[currentProjectCode]
                }

                // 数据回填
                let cachedData = projectDataCache.value[rowIndex]

                // ========== 新增：如果缓存为空，尝试从云表接口获取数据 ==========
                if ((!cachedData || cachedData.length === 0) && orderNo && inspectionNo) {
                    try {
                        const row = testEnv[rowIndex]
                        const projectType = getProjectType(row.item)
                        const dataRes = await axios.post(`/api/yunbiao/report-data/${projectType}`, {
                            orderNo,
                            inspectionNo: inspectionNo
                        })
                        if (dataRes?.data) {
                            cachedData = Array.isArray(dataRes.data) ? dataRes.data : [dataRes.data]
                            // 存入缓存，下次直接用
                            projectDataCache.value[rowIndex] = cachedData
                            console.log('✅ 从云表接口获取数据成功，已存入缓存')
                        }
                    } catch (err) {
                        console.warn('⚠️ 云表接口请求失败', err)
                    }
                }
                // ========== 新增结束 ==========

                if (cachedData && Array.isArray(cachedData)) {
                    const project = testProjectsRef.value[rowIndex]
                    const { tableMap, paramMap } = autoGenerateMap(project.schemeConfig)

                    console.log('🔍 tableMap:', tableMap)
                    console.log('🔍 paramMap:', paramMap)

                    // ========== 统一数据格式转换 ==========
                    // 如果缓存数据是列 ID 格式，转为字段名格式
                    let processedData = cachedData
                    const firstItem = cachedData[0] || {}
                    const keys = Object.keys(firstItem)
                    const isIdFormat = keys.length > 0 && /^\d+$/.test(keys[0])

                    if (isIdFormat) {
                        // 构建 ID → 字段名的映射
                        const idToField = {}
                        Object.entries(tableMap).forEach(([field, id]) => {
                            idToField[String(id)] = field
                        })

                        processedData = cachedData.map(row => {
                            const newRow = {}
                            Object.entries(row).forEach(([id, value]) => {
                                const field = idToField[String(id)]
                                if (field) {
                                    newRow[field] = value
                                }
                            })
                            return newRow
                        })
                        console.log('统一转换 cachedData 为字段名格式:', processedData)
                    } else {
                        console.log(' cachedData 已是字段名格式')
                    }

                    // 后续所有分支使用 processedData（字段名格式）
                    const dynamicSampleColumn = project.schemeConfig?.ExtendColumns?.find(col => col.isDynamic)
                    const elementColId = project.schemeConfig?.BaseColumns[0]?.id
                    const unitColId = project.schemeConfig?.BaseColumns[1]?.id

                    console.log(' elementColId:', elementColId)
                    console.log(' unitColId:', unitColId)

                    // ========== 提前获取项目类型 ==========
                    const projectType = getProjectType(row.item)
                    console.log('项目类型:', projectType)


                    // ============================================================
                    //  铁素体特殊处理（不依赖动态列）
                    // ============================================================
                    if (projectType === 'ferrite') {
                        console.log(' 进入铁素体分支');

                        // ============================================================
                        //  优先使用已有数据（编辑场景恢复）
                        // ============================================================
                        const existingProject = testProjectsRef.value[rowIndex]
                        const existingFerriteGroups = existingProject?.reportData?.ferriteGroups

                        if (existingFerriteGroups && existingFerriteGroups.length > 0) {
                            console.log('✅ 铁素体：已有 ferriteGroups 数据，直接恢复')
                            project.reportData.ferriteGroups = existingFerriteGroups
                            project.reportData.isFerriteGrouped = true
                            project.reportData.tableData = existingFerriteGroups.length > 0 ? existingFerriteGroups[0].tableData : []
                            const firstItemData = processedData[0] || {}
                            project.reportData.paramValues = mapField(firstItemData, paramMap)
                            return
                        }

                        // ============================================================
                        //  直接使用已获取的 processedData（不再重复请求云表）
                        // ============================================================
                        let rawData = processedData.length > 0 ? processedData : projectDataCache.value[rowIndex]

                        //  调试：查看原始数据的字段名
                        if (rawData && rawData.length > 0) {
                            console.log('📋 原始数据第一条的所有字段:', Object.keys(rawData[0]))
                            console.log('📋 原始数据第一条的"试样编号"字段值:', {
                                '试样编号': rawData[0]['试样编号'],
                                'Sample No.': rawData[0]['Sample No.'],
                                'SampleNo': rawData[0]['SampleNo'],
                                'sampleNo': rawData[0]['sampleNo']
                            })
                        }

                        if (!rawData || rawData.length === 0) {
                            ElMessage.warning('无法获取铁素体数据')
                            return
                        }

                        console.log('📦 铁素体原始数据条数:', rawData.length)

                        // ============================================================
                        // 后续逻辑：扁平化 + 分组
                        // ============================================================

                        // ===== 扁平化 ExtendColumns =====
                        let extendCols = project.schemeConfig.ExtendColumns || [];
                        const flattened = [];
                        extendCols.forEach(col => {
                            if (col.subColumns && col.subColumns.length > 0) {
                                col.subColumns.forEach(sub => {
                                    flattened.push({
                                        id: sub.id,
                                        label: sub.label || sub.yunbiaoField || sub.id,
                                        enLabel: sub.enLabel || '',
                                        type: sub.type || 'text',
                                        requirement: sub.requirement || '',
                                        subColumns: [],
                                        yunbiaoField: sub.yunbiaoField || '',
                                        isDynamic: false,
                                        dynamicType: ''
                                    });
                                });
                            } else {
                                flattened.push(col);
                            }
                        });
                        project.schemeConfig.ExtendColumns = flattened;

                        // ===== 重新生成 tableMap 和 paramMap =====
                        const { tableMap, paramMap } = autoGenerateMap(project.schemeConfig);

                        // 构建 allColumns
                        const allColumns = [
                            ...(project.schemeConfig.BaseColumns || []),
                            ...(project.schemeConfig.ExtendColumns || [])
                        ];

                        // 构建 idToField
                        const idToField = {};
                        Object.entries(tableMap).forEach(([field, id]) => {
                            idToField[String(id)] = field;
                        });

                        // 转换数据为字段名格式
                        let processedRawData = rawData
                        const firstItem = rawData[0] || {}
                        const keys = Object.keys(firstItem)
                        const isIdFormat = keys.length > 0 && /^\d+$/.test(keys[0])

                        if (isIdFormat) {
                            processedRawData = rawData.map(row => {
                                const newRow = {}
                                Object.entries(row).forEach(([id, value]) => {
                                    const field = idToField[String(id)]
                                    if (field) newRow[field] = value
                                })
                                return newRow
                            })
                            console.log('🔄 铁素体：转换 ID 格式为字段名格式')
                        }

                        // 按试样编号分组
                        const groupsMap = new Map();
                        processedRawData.forEach(item => {
                            const sampleNo = item['试样编号'] || '未知试样';
                            if (!groupsMap.has(sampleNo)) groupsMap.set(sampleNo, []);
                            groupsMap.get(sampleNo).push(item);
                        });

                        const fGroups = [];
                        for (const [sampleNo, items] of groupsMap) {
                            const tableData = items.map(item => {
                                const row = {};
                                allColumns.forEach(col => {
                                    const fieldName = idToField[String(col.id)];
                                    if (fieldName) {
                                        row[col.id] = item[fieldName] !== undefined ? item[fieldName] : '';
                                    } else {
                                        row[col.id] = item[col.id] || '';
                                    }
                                });
                                return row;
                            });

                            // ⭐ 新增：把 footer 绑定的云表字段值存到该组
                            const fGroup = {
                                groupLabel: `试样 ${sampleNo}`,
                                tableData: tableData,
                                bottomRequirement: {},
                                conclusion: '',
                            };
                            const firstItem = items[0] || {};
                            (project.schemeConfig.FooterColumns || []).forEach(foot => {
                                // 有专用容器的字段跳过
                                if (foot.label.includes('技术要求')
                                    || foot.label.includes('结论')
                                    || foot.label.includes('备注')) return;

                                const key = foot.yunbiaoField || foot.field;
                                if (key && firstItem[key] !== undefined && firstItem[key] !== null) {
                                    fGroup[key] = firstItem[key];
                                }
                            });

                            fGroups.push(fGroup);
                        }

                        //  在这里添加调试日志
                        console.log('📊 fGroups 详情:', fGroups.map((g, i) => ({
                            index: i,
                            label: g.groupLabel,
                            rowCount: g.tableData.length
                        })));

                        project.reportData.ferriteGroups = fGroups;
                        project.reportData.isFerriteGrouped = true;

                        if (dynamicSampleColumn) {
                            dynamicSampleColumn.subColumns = [];
                        }
                        project.reportData.tableData = fGroups.length > 0 ? fGroups[0].tableData : [];

                        const firstItemData = processedRawData[0] || {};
                        project.reportData.paramValues = mapField(firstItemData, paramMap);

                        ElMessage.success(`${row.item}数据自动填充完成`);
                        return;
                    }


                    //室温拉伸多分组分支
                    if (projectType === 'room-temperature-tensile') {
                        // 1. 定义关键词 → 后端字段名的映射（按关键词长度降序排列，避免误匹配）
                        const keywordToFieldMap = [
                            { keyword: '屈强比', field: '屈强比要求' },
                            { keyword: '抗拉', field: '抗拉要求' },
                            { keyword: '屈服', field: '屈服要求' },
                            { keyword: '断后', field: '断后要求' },
                            { keyword: '断面', field: '断面要求' }
                        ];

                        // 匹配函数：根据列标签（或子列标签）匹配后端字段名
                        const matchField = (label) => {
                            if (!label) return null;
                            for (const { keyword, field } of keywordToFieldMap) {
                                if (label.includes(keyword)) {
                                    return field;
                                }
                            }
                            return null;
                        };

                        const techFields = ['抗拉要求', '屈服要求', '断后要求', '断面要求', '屈强比要求'];

                        // 按技术要求分组
                        const groupsMap = new Map();
                        processedData.forEach(item => {
                            const groupKey = techFields.map(field => item[field] || '').join('|');
                            if (!groupsMap.has(groupKey)) groupsMap.set(groupKey, []);
                            groupsMap.get(groupKey).push(item);
                        });

                        // 单组处理
                        if (groupsMap.size === 1) {
                            project.reportData.tableData = processedData.map(item => mapField(item, tableMap));
                            project.reportData.paramValues = mapField(processedData[0] || {}, paramMap);
                            project.reportData.isTensileGrouped = false;
                            project.reportData.tensileGroups = [];

                            // 填充全局技术要求（单组模式）
                            const firstItem = processedData[0] || {};
                            const techReq = {};
                            project.schemeConfig.ExtendColumns.forEach(col => {
                                if (col.subColumns?.length) {
                                    col.subColumns.forEach(sub => {
                                        const field = matchField(sub.label);
                                        if (field && firstItem[field] !== undefined) {
                                            techReq[sub.id] = firstItem[field];
                                        }
                                    });
                                } else {
                                    const field = matchField(col.label);
                                    if (field && firstItem[field] !== undefined) {
                                        techReq[col.id] = firstItem[field];
                                    }
                                }
                            });
                            project.reportData.techRequirement = techReq;
                            ElMessage.success(`${row.item}数据自动填充完成`);
                            return;
                        }



                        // 多组处理
                        const tensileGroups = [];
                        let groupIndex = 1;
                        for (const items of groupsMap.values()) {
                            const firstItem = items[0] || {};
                            const techReq = {};

                            // 遍历扩展列（含子列），通过列标签匹配后端字段并取值
                            project.schemeConfig.ExtendColumns.forEach(col => {
                                if (col.subColumns && col.subColumns.length > 0) {
                                    col.subColumns.forEach(sub => {
                                        const field = matchField(sub.label);
                                        if (field && firstItem[field] !== undefined) {
                                            techReq[sub.id] = firstItem[field];
                                        }
                                    });
                                } else {
                                    const field = matchField(col.label);
                                    if (field && firstItem[field] !== undefined) {
                                        techReq[col.id] = firstItem[field];
                                    }
                                }
                            });

                            const tableData = items.map(item => mapField(item, tableMap));
                            tensileGroups.push({
                                groupLabel: `技术要求组 ${groupIndex}`,
                                techRequirements: techReq,
                                tableData: tableData,
                                conclusion: '',
                                note: '',
                                bottomRequirement: {}
                            });
                            groupIndex++;
                        }

                        project.reportData.tensileGroups = tensileGroups;
                        project.reportData.isTensileGrouped = true;
                        project.reportData.tableData = [];
                        project.reportData.paramValues = mapField(processedData[0] || {}, paramMap);
                        ElMessage.success(`${row.item}数据已按技术要求分组填充完成`);
                        return;
                    }

                    // ======== 维氏硬度统一分支（按试样编号分组，每个试样独立表格） ========
                    if (projectType === 'vickers-hardness') {
                        if (!processedData || processedData.length === 0) {
                            ElMessage.warning('维氏硬度无数据');
                            return;
                        }

                        //  读取转换开关
                        const enableConversion =
                            project.schemeConfig.EnableConversion === true
                            || project.schemeConfig.enableConversion === true;

                        

                        // 1. 检测是否有动态列 或 动态行
                        const hasDynamicCol = project.schemeConfig.ExtendColumns?.some(col =>
                            col.isDynamic === true || col.isDynamicRow === true
                        );

                        // 2. 收集所有结果列名（有动态列时才需要）
                        let resultKeys = [];
                        if (hasDynamicCol) {
                            const firstRow = processedData[0] || {};
                             resultKeys = Object.keys(firstRow)
                                .filter(key => /^结果\d+$/.test(key))
                                .sort((a, b) => {
                                    const numA = parseInt(a.replace('结果', ''));
                                    const numB = parseInt(b.replace('结果', ''));
                                    return numA - numB;
                                });
                        }
                        console.log('🔍 原始数据 key:', Object.keys(processedData[0] || {}));
                        console.log('🔍 resultKeys:', resultKeys);


                        // 3. 按试样编号分组
                        const groupsMap = new Map();
                        processedData.forEach(item => {
                            const sampleNo = String(item['试样编号'] || '未知试样').trim();   // ⭐ trim
                            if (!groupsMap.has(sampleNo)) groupsMap.set(sampleNo, []);
                            groupsMap.get(sampleNo).push(item);
                        });

                        //  按试样编号排序（H01 → H02 → H03 → H10，数字按数值排）
                        const sortedEntries = [...groupsMap.entries()].sort((a, b) =>
                            a[0].localeCompare(b[0], 'zh-CN', { numeric: true })
                        );

                        // 4. 构建 vickersGroups
                        const vickersGroups = [];
                        for (const [sampleNo, items] of groupsMap) {
                            // 4.1 计算该组最大结果数量（有动态列时才需要）
                            let maxCount = 1;
                            if (hasDynamicCol) {
                                maxCount = 0;
                                items.forEach(item => {
                                    let count = 0;
                                    resultKeys.forEach(key => {
                                        if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
                                            count++;
                                        }
                                    });
                                    if (count > maxCount) maxCount = count;
                                });
                                maxCount = Math.max(maxCount, 1);
                            }

                            // 4.2 动态生成子列（有动态列时）
                            let subColumns = [];
                            if (hasDynamicCol) {
                                for (let i = 0; i < maxCount; i++) {
                                    const idx = i + 1;
                                    subColumns.push({
                                        id: `point_${idx}`,
                                        label: `${idx}.`,
                                        enLabel: `${idx}.`,
                                        yunbiaoField: `point_${idx}`
                                    });
                                }
                            }

                            // 4.3 构建表格数据（多行）
                            const tableData = [];
                            items.forEach(item => {
                                // 基础列值
                                const row = {};
                                const sampleCol = project.schemeConfig.BaseColumns?.find(col =>
                                    col.yunbiaoField === '试样编号' || col.label === '试样编号'
                                );
                                const posCol = project.schemeConfig.BaseColumns?.find(col =>
                                    col.yunbiaoField === '检测位置' || col.label === '检测位置'
                                );
                                if (sampleCol) row[sampleCol.id] = sampleNo;
                                if (posCol) row[posCol.id] = item['检测位置'] || '';

                                if (hasDynamicCol) {
                                    // 1. 填结果点
                                    resultKeys.forEach((key, idx) => {
                                        if (idx < maxCount) {
                                            const colId = `point_${idx + 1}`;
                                            const val = item[key];
                                            row[colId] = (val !== undefined && val !== null) ? String(val).trim() : '';
                                        }
                                    });

                                    // 2. ⭐ 初始化转换值字段（用户手填，先留空）
                                    if (enableConversion) {
                                        for (let i = 0; i < maxCount; i++) {
                                            row[`conv_point_${i + 1}`] = '';
                                        }
                                    }

                                    tableData.push(row);   // 只 push 一行
                                } else {
                                    // 无动态列：先用 mapField 映射整行
                                    const mappedRow = mapField(item, tableMap);
                                    Object.assign(row, mappedRow);

                                    // ⭐ 初始化转换值字段（用户手填，先留空）
                                    if (enableConversion) {
                                        const extendCols = project.schemeConfig.ExtendColumns || [];
                                        extendCols.forEach(col => {
                                            if (col.subColumns?.length > 0) {
                                                col.subColumns.forEach(sub => {
                                                    row[`conv_${sub.id}`] = '';
                                                });
                                            } else {
                                                row[`conv_${col.id}`] = '';
                                            }
                                        });
                                    }

                                    tableData.push(row);   // 只 push 一行
                                }
                            });

                            console.log('维氏硬度数据:', {
                                resultKeys,
                                maxCount,
                                subColumns: subColumns.map(c => c.label),
                                tableData: JSON.stringify(tableData)
                            });

                            // 4.4 技术要求
                            const techReq = items[0]?.['硬度要求'] || items[0]?.['技术要求'] || '';

                            vickersGroups.push({
                                groupLabel: sampleNo,
                                subColumns: subColumns,          // 有动态列时才有值，无动态列为空数组
                                tableData: tableData,
                                techRequirement: techReq,
                                conclusion: '',
                                note: '',
                                enableConversion
                            });
                        }

                        // 5. 赋值
                        project.reportData.vickersGroups = vickersGroups;
                        project.reportData.isVickersGrouped = true;
                        project.reportData.tableData = [];
                        project.reportData.paramValues = mapField(processedData[0] || {}, paramMap);
                        ElMessage.success(`${row.item}数据已按试样编号分组（${hasDynamicCol ? '动态列' : '固定列'}模式）`);
                        return;
                    }

                    if (dynamicSampleColumn) {

                        let sampleList, paramList, resultMap

                        if (projectType === 'impact-test') {

                            project.reportData.impactGroups = []
                            project.reportData.isImpactGrouped = false
                            // 检测是否为展开列格式
                            const firstRow = processedData[0] || {}
                            const keys = Object.keys(firstRow)
                            const hasExpandedSamples = keys.some(key => /^sample_[A-Za-z0-9]+$/.test(key))

                            let dataForGroupImpact = processedData

                            if (hasExpandedSamples) {
                                console.log('🔄 检测到展开列格式')
                                //  数据已经在上面获取了，这里不需要再请求
                                // 只做格式检查，不重新请求
                                if (!dataForGroupImpact || dataForGroupImpact.length === 0) {
                                    dataForGroupImpact = processedData
                                }
                            }

                            console.log(' dataForGroupImpact 长度:', dataForGroupImpact.length)
                            console.log(' dataForGroupImpact 内容:', JSON.stringify(dataForGroupImpact, null, 2))

                            const groupedData = groupImpactData(dataForGroupImpact)

                            //  再次确保清空再赋值
                            project.reportData.impactGroups = []
                            project.reportData.impactGroups = groupedData
                            project.reportData.isImpactGrouped = true

                            // 打印确认
                            console.log('📊 最终 impactGroups 长度:', project.reportData.impactGroups.length)
                            project.reportData.impactGroups = groupedData
                            project.reportData.isImpactGrouped = true

                            //  从 _rawItem 提取每组独立的参数值
                            if (project.schemeConfig?.ParamItems?.length > 0) {
                                groupedData.forEach(group => {
                                    group.paramValues = {}
                                    const raw = group._rawItem || {}
                                    project.schemeConfig.ParamItems.forEach(param => {
                                        const field = param.yunbiaoField
                                        if (field && raw[field] !== undefined && raw[field] !== null) {
                                            group.paramValues[param.id] = raw[field]
                                        }
                                    })
                                    console.log('📦 冲击分组参数:', group.groupLabel, group.paramValues)
                                })
                            }

                            if (groupedData.length > 0) {
                                groupedData.forEach(group => {
                                    const mappedTableData = group.tableData.map(row => {
                                        const newRow = {}
                                        if (elementColId) newRow[elementColId] = row.paramName || ''
                                        if (unitColId) newRow[unitColId] = row.unit || ''
                                        group.sampleList.forEach(sample => {
                                            const sampleKey = `sample_${sample}`
                                            newRow[sampleKey] = row[sampleKey] || '/'
                                        })
                                        return newRow
                                    })
                                    group.tableData = mappedTableData
                                })
                                dynamicSampleColumn.subColumns = groupedData[0].subColumns
                                project.reportData.tableData = groupedData[0].tableData
                            } else {
                                project.reportData.tableData = []
                            }
                        }   else {
                            project.reportData.impactGroups = []
                            project.reportData.isImpactGrouped = false
                            // 化学成分等动态数据处理
                            const dynamicRes = handleDynamicData(processedData, dynamicSampleColumn)
                            sampleList = dynamicRes.sampleList
                            paramList = dynamicRes.paramList
                            resultMap = dynamicRes.resultMap


                            dynamicSampleColumn.subColumns = sampleList.map(s => ({
                                id: `sample_${s}`,
                                label: s,
                                enLabel: s,
                                yunbiaoField: `sample_${s}`
                            }))

                            console.log('subColumns:', dynamicSampleColumn.subColumns)

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

                            console.log('tableData:', project.reportData.tableData)
                        }
                    } else {
                        project.reportData.impactGroups = []
                        project.reportData.isImpactGrouped = false
                        // 普通项目（无动态列）
                        // 此时 processedData 已是字段名格式，直接映射
                        project.reportData.tableData = processedData.map(item => mapField(item, tableMap))
                        console.log(' 普通项目：通过 mapField 映射数据')
                    }

                    // 参数值回填
                    const firstItemData = processedData[0] || {}
                    project.reportData.paramValues = mapField(firstItemData, paramMap)
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

    // 新增：冲击分支：删除数据行
    function deleteImpactRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex];
        if (!project || !project.reportData.impactGroups) return;

        const group = project.reportData.impactGroups[groupIndex];
        if (!group) return;

        // 删除该分组的指定数据行
        group.tableData.splice(rowIndex, 1);

        // 如果该分组没有数据行了，移除整个分组
        if (group.tableData.length === 0) {
            project.reportData.impactGroups.splice(groupIndex, 1);
            // 如果所有分组都被删除，重置 isImpactGrouped
            if (project.reportData.impactGroups.length === 0) {
                project.reportData.isImpactGrouped = false;
            }
        }
    }


    //删除铁素体当前表格行
    function deleteFerriteGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex];
        if (!project || !project.reportData.ferriteGroups) return;
        project.reportData.ferriteGroups.splice(groupIndex, 1);
        if (project.reportData.ferriteGroups.length === 0) {
            project.reportData.isFerriteGrouped = false;
        }
    }

    // 删除铁素体当前表格行
    function deleteFerriteRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex];
        if (!project || !project.reportData.ferriteGroups) return;

        const group = project.reportData.ferriteGroups[groupIndex];
        if (!group) return;

        // 删除该分组的指定行
        group.tableData.splice(rowIndex, 1);

        // 如果该分组没有数据行了，移除整个分组
        if (group.tableData.length === 0) {
            project.reportData.ferriteGroups.splice(groupIndex, 1);
            if (project.reportData.ferriteGroups.length === 0) {
                project.reportData.isFerriteGrouped = false;
            }
        }
    }

    // 新增拉伸分组行
    function addTensileRow(projectIndex, groupIndex) {
        console.log('🔥 addTensileRow 被调用', { projectIndex, groupIndex });

        const project = testProjects.value[projectIndex];
        if (!project?.schemeConfig) {
            ElMessage.warning('请先加载模板');
            return;
        }
        const group = project.reportData.tensileGroups?.[groupIndex];
        if (!group) return;
        const newRow = {};
        const allCols = [
            ...(project.schemeConfig.BaseColumns || []),
            ...(project.schemeConfig.ExtendColumns || [])
        ];
        allCols.forEach(col => newRow[col.id] = '');
        group.tableData.push(newRow);
    }

    // 删除拉伸分组行
    function deleteTensileRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex];
        const group = project.reportData.tensileGroups?.[groupIndex];
        if (!group) return;
        group.tableData.splice(rowIndex, 1);
        if (group.tableData.length === 0) {
            // 若组内无数据，自动移除该组
            project.reportData.tensileGroups.splice(groupIndex, 1);
            if (project.reportData.tensileGroups.length === 0) {
                project.reportData.isTensileGrouped = false;
            }
        }
    }

    // 删除整个拉伸分组
    function deleteTensileGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex];
        if (!project?.reportData.tensileGroups) return;
        project.reportData.tensileGroups.splice(groupIndex, 1);
        if (project.reportData.tensileGroups.length === 0) {
            project.reportData.isTensileGrouped = false;
        }
    }


    function addVickersRow(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex];
        const group = project.reportData.vickersGroups?.[groupIndex];
        if (!group) return;
        const newRow = {};
        group.subColumns.forEach(col => {
            newRow[col.id] = '';
        });
        group.tableData.push(newRow);
    }

    function deleteVickersRow(projectIndex, groupIndex, rowIndex) {
        const project = testProjects.value[projectIndex];
        const group = project.reportData.vickersGroups?.[groupIndex];
        if (!group) return;
        group.tableData.splice(rowIndex, 1);
        if (group.tableData.length === 0) {
            project.reportData.vickersGroups.splice(groupIndex, 1);
            if (project.reportData.vickersGroups.length === 0) {
                project.reportData.isVickersGrouped = false;
            }
        }
    }

    function deleteVickersGroup(projectIndex, groupIndex) {
        const project = testProjects.value[projectIndex];
        if (!project?.reportData.vickersGroups) return;
        project.reportData.vickersGroups.splice(groupIndex, 1);
        if (project.reportData.vickersGroups.length === 0) {
            project.reportData.isVickersGrouped = false;
        }
    }


    function addPhotoRow(projectIndex) {
        testProjects.value[projectIndex].reportData.photoRows.push({
            LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '', marginTop: 2.65
        })
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
        //  新增：判断行是否存在，无效直接退出
        if (!testEnv || !testEnv[rowIndex]) return;
        const row = testEnv[rowIndex]
        //  新增：可选链兜底
        matchSchemeAndLoadTemplate(rowIndex, code, row?.techSpecCode, testEnv, testProjectsRef)
    }

    function onTechSpecChange(rowIndex, specId, testEnv, testProjectsRef, orderNo, inspectionNo) {
        console.log(' onTechSpecChange 执行', { rowIndex, specId });
        console.log(' 传入的订单号:', orderNo, '报检单号:', inspectionNo)


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
        console.log('当前行 projectCode:', row.projectCode, 'techSpecCode:', row.techSpecCode);

        // 3. 查找对应的技术要求，兼容类型不匹配问题（比如 specId 是字符串，tech.Id 是数字）
        const tech = techSpecList.value.find(t => t.Id == specId)
        if (tech) {
            row.techSpecName = tech.Name
            row.techSpecCode = tech.Id // 同步 techSpecCode，避免后续逻辑不一致
        } else {
            console.warn('未找到匹配的技术要求，specId:', specId)
        }

        console.log(' [onTechSpecChange] 将要调用 matchSchemeAndLoadTemplate，参数:', {
            rowIndex,
            projectCode: row?.projectCode,
            specId,
            testEnvLength: testEnv.length,
            testProjectsRefLength: testProjectsRef.value.length
        });

        // 4. 用可选链兜底，即使 projectCode 为空也不报错
        matchSchemeAndLoadTemplate(rowIndex, row?.projectCode, specId, testEnv, testProjectsRef, orderNo, inspectionNo)
    }

    console.log(' useTestProject 返回的 projectDataCache:', projectDataCache)


    return {
        testProjects,
        projectDataCache,//编辑页面的数据缓存，解决编辑页面切换模版没有填充数据问题
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
        deleteImpactRow,
        deleteFerriteRow,      
        deleteFerriteGroup,
        addTensileRow,
        deleteTensileRow,
        deleteTensileGroup,
        addVickersRow,
        deleteVickersRow,
        deleteVickersGroup,
        addPhotoRow,
        removePhotoRow,
        pickPhoto,
        onProjectCodeChange,
        onTechSpecChange,
        cloneTensileGroup,
        copyTensileTableAsGroup,
        copyCorrosionTableAsGroup,
        cloneCorrosionGroup,
        deleteCorrosionGroup,
        addCorrosionRow,
        deleteCorrosionRow,
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
        deleteMetallographicRow
    }
}