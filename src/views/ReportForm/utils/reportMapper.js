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
    if (!rawData || !dynamicCol) {
        console.warn('handleDynamicData: 缺少 rawData 或 dynamicCol');
        return { sampleList: [], paramList: [], resultMap: {} };
    }

    // 提取所有试样编号（去重）
    const sampleList = [...new Set(rawData.map(item => item['试样编号']))];
    // 提取所有检测参数（去重）
    const paramList = [...new Set(rawData.map(item => item['检测参数']))];

    // ========== 添加日志 ==========
    console.log('=== handleDynamicData 数据 ===');
    console.log('原始数据条数:', rawData.length);
    console.log('提取到的试样编号 (sampleList):', sampleList);
    console.log('提取到的检测参数 (paramList):', paramList);

    // 构建结果映射：试样 × 参数 → 结果
    const resultMap = {};
    sampleList.forEach(sample => {
        resultMap[sample] = {};
        const filtered = rawData.filter(item => item['试样编号'] === sample);
        console.log(`试样 ${sample} 的数据条数:`, filtered.length);
        filtered.forEach(item => {
            resultMap[sample][item['检测参数']] = item['检测结果'];
        });
        console.log(`试样 ${sample} 的结果映射:`, resultMap[sample]);
    });

    console.log('最终 resultMap:', resultMap);
    console.log('=== handleDynamicData 结束 ===');

    return { sampleList, paramList, resultMap };
};

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



// 铁素体：按原始数据条数分组，每条数据一个表格
export function groupFerriteData(rawData) {
    if (!rawData?.length) return [];

    const result = [];

    rawData.forEach((item, index) => {
        // 提取基础字段
        const group = {
            // 直接使用原始数据作为表格数据（不需要展开）
            tableData: [item],  // 每条数据作为一行，直接显示所有字段
            // 用于分组的标识
            groupLabel: `铁素体 ${index + 1}`,
            // 原始数据保留
            _rawItem: item
        };
        result.push(group);
    });

    return result;
}


// reportMapper.js 中替换 groupImpactData 实现
// reportMapper.js
// reportMapper.js

// reportMapper.js

export const groupImpactData = (rawData) => {
    if (!rawData?.length) return [];

    // 试样编号解析工具函数
    const parseSampleNumbers = (sampleStr) => {
        if (!sampleStr) return [];
        const str = sampleStr.trim();

        const rangeMatch = str.match(/^([A-Za-z]*)(\d+)~([A-Za-z]*)(\d+)$/) ||
            str.match(/^([A-Za-z]*)(\d+)-([A-Za-z]*)(\d+)$/);
        if (rangeMatch) {
            const prefix = rangeMatch[1] || '';
            const startNum = parseInt(rangeMatch[2]);
            const endNum = parseInt(rangeMatch[4]);
            const padLen = Math.max(rangeMatch[2].length, rangeMatch[4].length);
            if (startNum < endNum) {
                const result = [];
                for (let i = startNum; i <= endNum; i++) {
                    result.push(`${prefix}${String(i).padStart(padLen, '0')}`);
                }
                return result;
            }
            return [`${prefix}${String(startNum).padStart(padLen, '0')}`];
        }

        const separators = /[、，,]+/;
        if (separators.test(str)) {
            return str.split(separators).map(s => s.trim()).filter(Boolean);
        }

        return [str];
    };

    const result = [];

    // ===== 核心改动：直接遍历每条原始数据，不再按技术要求分组 =====
    rawData.forEach((item) => {
        // 解析试样编号
        const rawSampleStr = item['试样编号'] || '';
        let sampleList = parseSampleNumbers(rawSampleStr);

        // 如果解析失败，回退到直接去重（兼容单条数据）
        if (sampleList.length === 0) {
            sampleList = [rawSampleStr.trim()].filter(Boolean);
        }

        // 如果仍然没有试样编号，跳过该条数据
        if (sampleList.length === 0) return;

        // 提取各字段
        const singleReq = item['单个技术要求'] || '';
        const avgReq = item['平均技术要求'] || '';
        const testPosition = item['检测位置'] || '';

        // ===== 参数定义（三个固定参数） =====
        const paramConfigs = [
            {
                label: '冲击吸收能量（J）Impact Absorbed Energy',
                unit: 'J',
                fields: sampleList.map((_, idx) => `冲击功${idx + 1}`)
            },
            {
                label: '侧向膨胀值 LE（mm）',
                unit: 'mm',
                fields: sampleList.map((_, idx) => `侧膨胀值${idx + 1}`)
            },
            {
                label: '剪切断面率 Shear Fracture Appearance（%）',
                unit: '%',
                fields: sampleList.map((_, idx) => `剪切断面率${idx + 1}`)
            }
        ];

        // ===== 生成 tableData =====
        const tableData = paramConfigs.map(param => {
            const row = {
                paramName: param.label,
                unit: testPosition
            };
            sampleList.forEach((sample, index) => {
                const field = param.fields[index];
                row[`sample_${sample}`] = item[field] || '/';
            });
            return row;
        });

        // ===== 底部技术要求 =====
        const bottomReq = {
            singleReq: singleReq,
            avgReq: avgReq,
            leReq: item['侧向膨胀要求'] || '',
            shearReq: item['剪切断面率要求'] || ''
        };

        // ===== 子列配置 =====
        const subColumns = sampleList.map(sample => ({
            id: `sample_${sample}`,
            label: sample,
            enLabel: sample,
            yunbiaoField: `sample_${sample}`
        }));

        result.push({
            singleReq,
            avgReq,
            sampleList,
            tableData,
            subColumns,
            bottomRequirement: bottomReq,
            // 记录原始数据，便于后续扩展
            _rawItem: item
        });
    });

    return result;
};