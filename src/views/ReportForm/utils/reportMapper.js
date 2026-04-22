// 根据项目名称转换为 projectType
export const getProjectType = (projectName) => {
    if (projectName.includes('室温拉伸')) return 'room-temperature-tensile'
    if (projectName.includes('金相检验')) return 'metallographic-inspection'
    if (projectName.includes('有害相')) return 'harmful-phase'
    if (projectName.includes('晶间腐蚀')) return 'intergranular-corrosion'
    if (projectName.includes('点腐蚀')) return 'pitting-corrosion'
    if (projectName.includes('铁素体')) return 'ferrite'
    if (projectName.includes('晶粒度')) return 'grain-size'
    if (projectName.includes('弯曲')) return 'bend-test'
    if (projectName.includes('布氏硬度')) return 'brinell-hardness'
    if (projectName.includes('洛氏硬度')) return 'rockwell-hardness'
    if (projectName.includes('维氏硬度')) return 'vickers-hardness'
    if (projectName.includes('冲击')) return 'impact-test'
    if (projectName.includes('化学成分')) return 'chemical-composition'
    if (projectName.includes('宏观检验')) return 'macroscopic-inspection'
    if (projectName.includes('夹杂物')) return 'non-metallic-inclusions'
    throw new Error(`未匹配到项目类型：${projectName}`)
}

// 通用字段映射
export const mapField = (source, fieldMap) => {
    const target = {}
    Object.entries(fieldMap).forEach(([sourceKey, targetKey]) => {
        target[targetKey] = source[sourceKey] ?? ''
    })
    return target
}

// 根据模板配置生成前后端映射
export const autoGenerateMap = (schemeConfig) => {
    const tableMap = {}
    const paramMap = {}

        ;[...(schemeConfig.BaseColumns || [])].forEach(col => {
            if (col.yunbiaoField) tableMap[col.yunbiaoField] = col.id
        })
        ;[...(schemeConfig.ExtendColumns || [])].forEach(col => {
            if (col.subColumns && col.subColumns.length > 0) {
                col.subColumns.forEach(sub => {
                    const field = sub.yunbiaoField || sub.id
                    tableMap[field] = sub.id
                })
            } else if (col.yunbiaoField) {
                tableMap[col.yunbiaoField] = col.id
            }
        })
        ; (schemeConfig.ParamItems || []).forEach(param => {
            if (param.yunbiaoField) paramMap[param.yunbiaoField] = param.id
        })

    return { tableMap, paramMap }
}

// 化学成分等动态数据处理（试样×参数二维映射）
// _dynamicCol 参数保留用于兼容调用，但函数内未使用（通过下划线前缀告知 ESLint 忽略未使用警告）
export const handleDynamicData = (rawData, dynamicCol) => {
    if (!rawData || !dynamicCol) return { sampleList: [], paramList: [], resultMap: {} }
    const sampleList = [...new Set(rawData.map(item => item['试样编号']))]
    const paramList = [...new Set(rawData.map(item => item['检测参数']))]
    const resultMap = {}
    sampleList.forEach(sample => {
        resultMap[sample] = {}
        rawData.filter(item => item['试样编号'] === sample).forEach(item => {
            resultMap[sample][item['检测参数']] = item['检测结果']
        })
    })
    return { sampleList, paramList, resultMap }
}

// 冲击试验专用
export const handleImpactTestData = (rawData) => {
    if (!rawData?.length) return { sampleList: [], paramList: [], resultMap: {} }
    const paramList = [
        { key: '吸收能量检测项目', label: '冲击吸收能量（J）Impact Absorbed Energy' },
        { key: '侧膨胀值检测项目', label: '侧向膨胀值 LE（mm）' },
        { key: '剪切断面率检测项目', label: '剪切断面率 Shear Fracture Appearance（%）' }
    ]
    const sampleList = [...new Set(rawData.map(item => item['试样编号']))]
    const resultMap = {}
    paramList.forEach(p => {
        resultMap[p.key] = {}
        rawData.forEach(item => {
            const sampleKey = `sample_${item['试样编号']}`
            resultMap[p.key][sampleKey] = item[p.key] || '/'
        })
    })
    return { sampleList, paramList, resultMap }
}

// 计算扩展列总数量（包含子列）
export const getExtendTotalColSpan = (extendColumns = []) => {
    return extendColumns.reduce((sum, col) => sum + (col.subColumns?.length || 1), 0)
}

// 计算表格总列数（基础列+扩展列总子列）
export const getTotalColSpan = (config) => {
    const base = config?.BaseColumns?.length || 0
    const extend = getExtendTotalColSpan(config?.ExtendColumns || [])
    return base + extend
}

// 自动根据扩展列生成底部子列（保证对齐）
export const getSubColumnsByExtend = (extendColumns = [], bottomCount = 2) => {
    const totalSub = getExtendTotalColSpan(extendColumns)
    const perCol = totalSub / bottomCount
    const subList = []
    for (let i = 0; i < perCol; i++) {
        subList.push({ id: `sub_${i}`, label: `子列${i + 1}`, enLabel: `Sub${i + 1}` })
    }
    return subList
}