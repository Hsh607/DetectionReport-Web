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
                    photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "" }]
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
                        techRequirement: {},
                        bottomRequirement: {},
                        conclusion: "",
                        note: "",
                        reviewer: "",
                        approval: {},
                        paramValues: {},
                        photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "" }],
                        impactGroups: [],          // ✅ 强制重置
                        isImpactGrouped: false,
                        ferriteGroups: [],
                        isFerriteGrouped: false
                    }
                }

                // 检测依据回填
                const currentProjectCode = (projectCode || '').trim()
                if (testReferenceCache.value[currentProjectCode]) {
                    testProjectsRef.value[rowIndex].reportData.testReference = testReferenceCache.value[currentProjectCode]
                }

                // 数据回填
                const cachedData = projectDataCache.value[rowIndex]
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
                        console.log('🔄 统一转换 cachedData 为字段名格式:', processedData)
                    } else {
                        console.log('✅ cachedData 已是字段名格式')
                    }

                    // 后续所有分支使用 processedData（字段名格式）
                    const dynamicSampleColumn = project.schemeConfig?.ExtendColumns?.find(col => col.isDynamic)
                    const elementColId = project.schemeConfig?.BaseColumns[0]?.id
                    const unitColId = project.schemeConfig?.BaseColumns[1]?.id

                    console.log('🔍 elementColId:', elementColId)
                    console.log('🔍 unitColId:', unitColId)

                    // ========== 提前获取项目类型 ==========
                    const projectType = getProjectType(row.item)
                    console.log('项目类型:', projectType)

                    // ============================================================
                    //  铁素体特殊处理（不依赖动态列）
                    // ============================================================
                    if (projectType === 'ferrite') {
                        console.log('🔧 进入铁素体分支，数据条数:', processedData.length);
                        console.log('📋 FooterColumns:', project.schemeConfig?.FooterColumns);

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

                        // ===== 重新生成 tableMap 和 paramMap（基于扁平化后的结构） =====
                        const { tableMap, paramMap } = autoGenerateMap(project.schemeConfig);
                        console.log('📋 扁平化后的 tableMap:', tableMap);

                        // 构建 allColumns（扁平后的 Base + Extend）
                        const allColumns = [
                            ...(project.schemeConfig.BaseColumns || []),
                            ...(project.schemeConfig.ExtendColumns || [])
                        ];

                        // 构建 idToField（列ID → 字段名）
                        const idToField = {};
                        Object.entries(tableMap).forEach(([field, id]) => {
                            idToField[String(id)] = field;
                        });

                        // 按试样编号分组
                        const groupsMap = new Map();
                        processedData.forEach(item => {
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
                            fGroups.push({
                                groupLabel: `试样 ${sampleNo}`,
                                tableData: tableData,
                                bottomRequirement: {}
                            });
                        }

                        project.reportData.ferriteGroups = fGroups;
                        project.reportData.isFerriteGrouped = true;

                        if (dynamicSampleColumn) {
                            dynamicSampleColumn.subColumns = [];
                        }
                        project.reportData.tableData = fGroups.length > 0 ? fGroups[0].tableData : [];

                        // 参数回填
                        const firstItemData = processedData[0] || {};
                        project.reportData.paramValues = mapField(firstItemData, paramMap);

                        ElMessage.success(`${row.item}数据自动填充完成`);
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
                                console.log('🔄 检测到展开列格式，重新请求云表接口...')

                                const orderNoParam = orderNo || testEnv[rowIndex]?.orderNo || testEnv[rowIndex]?.委托单号 || ''
                                const inspectionNoParam = inspectionNo || testEnv[rowIndex]?.inspectionOrderNo || testEnv[rowIndex]?.报检单号 || ''

                                if (orderNoParam && inspectionNoParam) {
                                    try {
                                        const res = await axios.post(`/api/yunbiao/report-data/impact-test`, {
                                            orderNo: orderNoParam,
                                            inspectionNo: inspectionNoParam
                                        })
                                        if (res?.data) {
                                            dataForGroupImpact = Array.isArray(res.data) ? res.data : [res.data]
                                            // ✅ 关键修复：更新 processedData，用于 paramValues 回填
                                            processedData = dataForGroupImpact
                                            console.log('✅ 重新请求云表接口成功，数据条数:', dataForGroupImpact.length)
                                        }
                                    } catch (err) {
                                        console.warn('⚠️ 重新请求冲击数据失败，使用缓存数据', err)
                                        dataForGroupImpact = processedData
                                    }
                                } else {
                                    console.warn('⚠️ 缺少订单号或报检单号，无法请求云表接口，使用缓存数据')
                                }
                            }

                            console.log('📦 dataForGroupImpact 长度:', dataForGroupImpact.length)
                            console.log('📦 dataForGroupImpact 内容:', JSON.stringify(dataForGroupImpact, null, 2))

                            const groupedData = groupImpactData(dataForGroupImpact)

                            // ✅ 再次确保清空再赋值
                            project.reportData.impactGroups = []
                            project.reportData.impactGroups = groupedData
                            project.reportData.isImpactGrouped = true

                            // 打印确认
                            console.log('📊 最终 impactGroups 长度:', project.reportData.impactGroups.length)
                            project.reportData.impactGroups = groupedData
                            project.reportData.isImpactGrouped = true

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
                        }  else if (projectType === 'vickers-hardness') {
                            project.reportData.impactGroups = []
                            project.reportData.isImpactGrouped = false
                            if (!processedData || processedData.length === 0) {
                                ElMessage.warning('维氏硬度无数据');
                                return;
                            }

                            const firstRow = processedData[0] || {};
                            const resultKeys = Object.keys(firstRow).filter(key => /^结果\d+$/.test(key));

                            let maxCount = 0;
                            processedData.forEach(item => {
                                let count = 0;
                                resultKeys.forEach(key => {
                                    if (item[key] && item[key].trim() !== '') count++;
                                });
                                if (count > maxCount) maxCount = count;
                            });
                            maxCount = Math.max(maxCount, 1);

                            const dynamicCol = project.schemeConfig.ExtendColumns.find(col => col.isDynamic);
                            if (dynamicCol) {
                                dynamicCol.label = '检测结果';
                                dynamicCol.enLabel = 'Test Results';
                                const subColumns = [];
                                for (let i = 0; i < maxCount; i++) {
                                    const idx = i + 1;
                                    subColumns.push({
                                        id: `point_${idx}`,
                                        label: `${idx}.`,
                                        enLabel: `${idx}.`,
                                        yunbiaoField: `point_${idx}`
                                    });
                                }
                                dynamicCol.subColumns = subColumns;
                            }

                            const tableData = [];
                            processedData.forEach(item => {
                                const rowValue = {
                                    [elementColId]: item['试样编号'] || '',
                                    [unitColId]: item['检测位置'] || ''
                                };
                                const rowConvert = {
                                    [elementColId]: item['试样编号'] || '',
                                    [unitColId]: '转换值(HRC) Conversion value'
                                };
                                for (let i = 0; i < maxCount; i++) {
                                    const idx = i + 1;
                                    const colId = `point_${idx}`;
                                    const resultKey = resultKeys[i] || `结果${idx}`;
                                    rowValue[colId] = item[resultKey] || '/';
                                    rowConvert[colId] = '';
                                }
                                tableData.push(rowValue);
                                tableData.push(rowConvert);
                            });

                            project.reportData.tableData = tableData;
                            project.reportData.paramValues = {};
                            project.reportData.rowSpanColumns = [elementColId];
                            ElMessage.success(`${row.item}数据自动填充完成`);
                            return;
                        } else {
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
                        console.log('✅ 普通项目：通过 mapField 映射数据')
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

    // ✅新增：冲击分支：删除数据行
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
        //  新增：判断行是否存在，无效直接退出
        if (!testEnv || !testEnv[rowIndex]) return;
        const row = testEnv[rowIndex]
        //  新增：可选链兜底
        matchSchemeAndLoadTemplate(rowIndex, code, row?.techSpecCode, testEnv, testProjectsRef)
    }

    function onTechSpecChange(rowIndex, specId, testEnv, testProjectsRef, orderNo, inspectionNo) {
        console.log(' onTechSpecChange 执行', { rowIndex, specId });
        console.log('📦 传入的订单号:', orderNo, '报检单号:', inspectionNo)


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

        console.log('📦 [onTechSpecChange] 将要调用 matchSchemeAndLoadTemplate，参数:', {
            rowIndex,
            projectCode: row?.projectCode,
            specId,
            testEnvLength: testEnv.length,
            testProjectsRefLength: testProjectsRef.value.length
        });

        // 4. 用可选链兜底，即使 projectCode 为空也不报错
        matchSchemeAndLoadTemplate(rowIndex, row?.projectCode, specId, testEnv, testProjectsRef, orderNo, inspectionNo)
    }

    console.log('🔍 useTestProject 返回的 projectDataCache:', projectDataCache)


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
        addPhotoRow,
        removePhotoRow,
        pickPhoto,
        onProjectCodeChange,
        onTechSpecChange
    }
}