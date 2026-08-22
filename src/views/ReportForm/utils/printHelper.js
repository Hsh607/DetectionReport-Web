/* eslint-disable */
// 转义 HTML 特殊字符
export function escapeHtml(str) {
    if (!str) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function splitTextName(name) {
    console.log("splitTextName 输入:", name)
    if (!name) return { zh: '', en: '' }
    const text = name.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')
    const zhPattern = /^([\u4e00-\u9fa5\s、，.()]+)/
    const zhMatch = text.match(zhPattern)
    if (zhMatch) {
        const zhPart = zhMatch[1].trim()
        const enPart = text.slice(zhMatch[0].length).trim()
        console.log("splitTextName 输出:", { zh: zhPart, en: enPart })
        return {
            zh: zhPart || '',
            en: enPart || ''
        }
    }
    return { zh: text, en: '' }
}

// 格式化日期
export function formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 免责声明
export const disclaimerText = `本报告未加盖本公司检测专用章无效；无编辑、审核、签发人签字无效；涂改无效。生产厂家、规格、炉批号、标准、牌号、样品标识、取样方向、距离、位置等信息由委托人提供，其真实性由委托人负责。报告仅对来样负责。未经本公司书面同意，不得部分地复制本报告。对测试报告若有异议，请于收到报告之日起十五日内提出。如果报告中的中、英文内容上有矛盾，以中文内容为准。报告封面无CNAS章时，此报告不做仲裁及相关证明用。
This report shall be deemed invalid if it does not bear the company's dedicated testing seal; it shall be invalid if it lacks the signatures of the editor, reviewer, or issuer; and it shall be invalid if there are any alterations. Information regarding the manufacturer, specifications, furnace batch number, standards, material grade, sample identification, sampling direction, distance, and position shall be provided by the client; the client shall be responsible for the authenticity of such information. This report is solely valid for the samples submitted. No partial reproduction of this report is permitted without the written consent of our company. Any objections to this test report may be raised within 15 days from the date of receipt of the report. In the event of any discrepancy between the Chinese and English versions of the report, the Chinese version shall prevail. If the CNAS seal is absent from the report cover, this report shall not serve as an arbitration document or any other form of certification.`

// 渲染参数表格
export function renderParamItems(paramItems, paramValues) {
    if (!paramItems || paramItems.length === 0) return ''
    let html = '<table class="info-table content-table-font"><tbody><tr>'
    for (const p of paramItems) {
        const val = paramValues?.[p.id] ?? ''
        html += `
      <td class="info-table-th">
        <div>${escapeHtml(p.label)}</div>
        <div class="en-num-font">${escapeHtml(p.enLabel || '')}</div>
      </td>
      <td class="info-table-td content-table-font">
        ${escapeHtml(String(val))}
      </td>
    `
    }
    html += '</tr></tbody></table>'
    return html
}


// 渲染主表格（支持行合并，仅针对 rowSpanColumns）
export function renderMainTable(config, tableData, reportData) {
    if (!tableData || tableData.length === 0) return '<div class="content-table-font">无数据</div>'
    const baseCols = config.BaseColumns || []
    const extendCols = config.ExtendColumns || []
    // 只有子列有非空标签时才显示第二行表头
    const hasSubColumns = extendCols.some(col => {
        if (!col.subColumns || col.subColumns.length === 0) return false;
        return col.subColumns.some(sub => (sub.label && sub.label.trim()) || (sub.enLabel && sub.enLabel.trim()));
    });
    // ========== 判断是否为冲击试验（用于列合并） ==========
    const projectTitle = (config.ProjectTitle || '').toLowerCase()
    const isImpactTest = projectTitle.includes('铁素体')

    // 仅冲击试验才开启列合并
    const MERGE_TARGETS = isImpactTest ? [
        '试样编号', '检测位置', 'PP,%', 's, %', '95%CI, %', 'Vv, %', '%RA'
    ] : [];

    const mergeColumnIds = [];
    baseCols.forEach(col => {
        const label = String(col.label || '').trim().replace(/，/g, ',').replace(/\s+/g, '');
        const target = MERGE_TARGETS.map(t => t.replace(/，/g, ',').replace(/\s+/g, ''));
        if (target.includes(label)) mergeColumnIds.push(col.id);
    });
    extendCols.forEach(col => {
        if (col.subColumns) {
            col.subColumns.forEach(sub => {
                const label = String(sub.label || '').trim().replace(/，/g, ',').replace(/\s+/g, '');
                const target = MERGE_TARGETS.map(t => t.replace(/，/g, ',').replace(/\s+/g, ''));
                if (target.includes(label)) mergeColumnIds.push(sub.id);
            });
        }
    });

    // 列合并规则（仅冲击试验）
    const mergeRules = {};
    if (mergeColumnIds.length > 0) {
        mergeColumnIds.forEach(colId => {
            let startRow = 0;
            for (let i = 1; i <= tableData.length; i++) {
                const currentValue = String(tableData[i]?.[colId] ?? '').trim();
                const prevValue = String(tableData[startRow]?.[colId] ?? '').trim();
                if (i === tableData.length || currentValue !== prevValue) {
                    const rowspan = i - startRow;
                    for (let j = startRow; j < i; j++) {
                        mergeRules[`${j}_${colId}`] = j === startRow ? rowspan : 0;
                    }
                    startRow = i;
                }
            }
        });
    }

    // 表头
    let theadRow1 = '<tr>'
    for (const col of baseCols) {
        const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
        theadRow1 += `<th ${rowspanAttr} class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`
    }
    for (const col of extendCols) {
        if (col.subColumns && col.subColumns.length) {
            const colspan = col.subColumns.length
            theadRow1 += `<th colspan="${colspan}" class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`
        } else {
            const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
            theadRow1 += `<th ${rowspanAttr} class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`
        }
    }
    theadRow1 += '</tr>'

    let theadRow2 = ''
    if (hasSubColumns) {
        theadRow2 = '<tr>'
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    let displayText = '';
                    if (sub.label && sub.enLabel && sub.label !== sub.enLabel) {
                        // label 和 enLabel 不同 → 显示两行
                        displayText = `${escapeHtml(sub.label)}<br><small class="en-num-font">${escapeHtml(sub.enLabel)}</small>`;
                    } else {
                        // label 和 enLabel 相同，或只有一个有值 → 只显示一个
                        displayText = escapeHtml(sub.label || sub.enLabel || '');
                    }
                    theadRow2 += `<th class="content-table-font">${displayText}</th>`;
                }
            }
        }
        theadRow2 += '</tr>'
    }

    // 表格内容（含行合并，仅针对 rowSpanColumns）
    const rowSpanCols = reportData.rowSpanColumns || [];
    const rowMergeRules = calcRowMergeRules(tableData, rowSpanCols);

    let tbody = '';
    for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
        const row = tableData[rowIndex];
        let rowHtml = '<tr>';
        // 基础列
        for (const col of baseCols) {
            const colId = col.id;
            if (rowSpanCols.includes(colId)) {
                const rowspan = rowMergeRules[`${rowIndex}_${colId}`];
                if (rowspan === 0) continue;
                rowHtml += `<td rowspan="${rowspan}" class="content-table-font">${escapeHtml(row[colId] ?? '')}</td>`;
            } else {
                // 普通渲染（但需考虑冲击列合并）
                const key = `${rowIndex}_${colId}`;
                const rowspan = mergeRules[key];
                if (rowspan === 0) continue;
                const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                rowHtml += `<td ${rowspanAttr} class="content-table-font">${escapeHtml(row[colId] ?? '')}</td>`;
            }
        }
        // 扩展列（含子列）
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    const subId = sub.id;
                    if (rowSpanCols.includes(subId)) {
                        const rowspan = rowMergeRules[`${rowIndex}_${subId}`];
                        if (rowspan === 0) continue;
                        rowHtml += `<td rowspan="${rowspan}" class="content-table-font">${escapeHtml(row[subId] ?? '')}</td>`;
                    } else {
                        const key = `${rowIndex}_${subId}`;
                        const rowspan = mergeRules[key];
                        if (rowspan === 0) continue;
                        const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                        rowHtml += `<td ${rowspanAttr} class="content-table-font">${escapeHtml(row[subId] ?? '')}</td>`;
                    }
                }
            } else {
                const colId = col.id;
                if (rowSpanCols.includes(colId)) {
                    const rowspan = rowMergeRules[`${rowIndex}_${colId}`];
                    if (rowspan === 0) continue;
                    rowHtml += `<td rowspan="${rowspan}" class="content-table-font">${escapeHtml(row[colId] ?? '')}</td>`;
                } else {
                    const key = `${rowIndex}_${colId}`;
                    const rowspan = mergeRules[key];
                    if (rowspan === 0) continue;
                    const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                    rowHtml += `<td ${rowspanAttr} class="content-table-font">${escapeHtml(row[colId] ?? '')}</td>`;
                }
            }
        }
        rowHtml += '</tr>';
        tbody += rowHtml;
    }

    // 嵌入 FooterColumns
    tbody += renderFooterColumns(config, reportData)
    return `<table class="data-table content-table-font"><thead>${theadRow1}${theadRow2}</thead><tbody>${tbody}</tbody></table>`
}

// 渲染照片：固定标题 + 每个项目独立判断模板配置
export function renderPhotoRows(photoRows, config) {
    // 读取当前项目的模板配置
    const photoConfig = config?.PhotoConfig;
    // 模板未开启照片
    if (!photoConfig || !photoConfig.enabled) {
        return '';
    }

    const API_BASE = process.env.VUE_APP_BASE_URL

    // 👇 添加URL转换函数
    const convertUrl = (url) => {
        if (!url) return ''
        // 转换旧格式：/api/upload/image/ -> /uploads/
        if (url.includes('/api/upload/image/')) {
            return url.replace('/api/upload/image/', '/uploads/')
        }
        return url
    }

    // 固定标题：试验照片，不从接口获取
    let html = '<div class="photo-title title-num-font">试验照片 <span class="en-num-font">/ Test Photos</span></div>'
    for (const row of photoRows) {
        html += '<div class="photo-row">'
        if (row.LeftUrl || row.LeftDataURL) {
            //转换URL
            let originalUrl = row.LeftDataURL || row.LeftUrl
            let convertedUrl = convertUrl(originalUrl)
            const url = convertedUrl.startsWith('http') ? convertedUrl : `${API_BASE}${convertedUrl}`
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:360px;border:1px solid #ccc;"><div class="content-table-font">${escapeHtml(row.LeftDesc || '')}</div></div>`
        }
        if (row.RightUrl || row.RightDataURL) {
            // 转换URL
            let originalUrl = row.RightDataURL || row.RightUrl
            let convertedUrl = convertUrl(originalUrl)
            const url = convertedUrl.startsWith('http') ? convertedUrl : `${API_BASE}${convertedUrl}`
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:360px;border:1px solid #ccc;"><div class="content-table-font">${escapeHtml(row.RightDesc || '')}</div></div>`
        }
        html += '</div>'
    }
    return html
}

// 渲染底部列组（自带判空：有配置渲染，无配置不显示）
export function renderBottomColumns(config, bottomRequirement) {
    if (!config?.BottomColumns || config.BottomColumns.length === 0) return '';
    const bottomColumns = config.BottomColumns;

    const totalBaseCols = config.BaseColumns?.length || 0;
    const totalExtendCols = (config.ExtendColumns || []).reduce((sum, col) => sum + (col.subColumns?.length || 1), 0);
    const totalCols = totalBaseCols + totalExtendCols;

    const headerRow = bottomColumns.map(col => {
        const span = col.subColumns?.length || 1;
        return `<th colspan="${span}">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`;
    }).join('');

    const subHeaderRow = bottomColumns.map(col => {
        return (col.subColumns || []).map(sub => {
            return `<th>${escapeHtml(sub.label)}<br><small class="en-num-font">${escapeHtml(sub.enLabel || '')}</small></th>`;
        }).join('');
    }).join('');

    const dataRow = bottomColumns.map(col => {
        return (col.subColumns || []).map(sub => {
            const dataKey = `${col.id}_${sub.id}`;
            const value = bottomRequirement?.[dataKey] || '';
            return `<td>${escapeHtml(value)}</td>`;
        }).join('');
    }).join('');

    return `
        <tr>
            <td colspan="${totalCols}" style="padding: 0; border: none;">
                <table class="data-table content-table-font" style="width: 100%; margin: 0 !important;">
                    <thead>
                        <tr style="background: #e6e6e6;">
                            ${headerRow}
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: #f0f0f0;">
                            ${subHeaderRow}
                        </tr>
                        <tr style="background: #ffffff;">
                            ${dataRow}
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    `;
}

// 渲染固定底部行
export function renderFooterColumns(config, reportData) {
    const footerColumns = config.FooterColumns || []
    if (!footerColumns.length) return ''

    const totalBaseCols = config.BaseColumns?.length || 0
    const totalExtendCols = (config.ExtendColumns || []).reduce((sum, col) => sum + (col.subColumns?.length || 1), 0)

    let html = ''
    for (const footRow of footerColumns) {
        html += `
    <tr style="background: #f9f9f9;">
      <td colspan="${totalBaseCols}" style="text-align: left; padding: 8px 12px; font-weight: 500; border: 1px solid #000;">
        ${escapeHtml(footRow.label)} ${footRow.enLabel ? `/ ${escapeHtml(footRow.enLabel)}` : ''}
      </td>
    `

        if (footRow.label.includes('技术要求')) {
            config.ExtendColumns?.forEach(col => {
                if (col.subColumns?.length > 0) {
                    col.subColumns.forEach(sub => {
                        const val = reportData.techRequirement?.[sub.id] || ''
                        html += `<td style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${escapeHtml(val)}</td>`
                    })
                } else {
                    const val = reportData.techRequirement?.[col.id] || ''
                    html += `<td style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${escapeHtml(val)}</td>`
                }
            })
        } else if (footRow.label.includes('结论')) {
            const val = reportData.conclusion || ''
            html += `<td colspan="${totalExtendCols}" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${escapeHtml(val)}</td>`
        } else if (footRow.label.includes('备注')) {
            const val = reportData.note || ''
            html += `<td colspan="${totalExtendCols}" style="padding: 8px 12px; border: 1px solid #000;">${escapeHtml(val)}</td>`
        } else {
            const field = footRow.field || ''
            const val = reportData[field] || ''
            html += `<td colspan="${totalExtendCols}" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${escapeHtml(val)}</td>`
        }
        html += '</tr>'
    }
    return html
}

// 渲染审批信息
export function renderApprovalItems(approvalItems, approvalData) {
    if (!approvalItems || approvalItems.length === 0) return ''
    const allEmpty = approvalItems.every(item => {
        const value = (approvalData?.[item.id] || '').trim()
        return value === '' || value === '/'
    })
    if (allEmpty) return ''

    let html = `
  <div style="margin: 20px 0;">
    <div class="title-num-font" style="margin-bottom: 10px;">审批信息 <span class="en-num-font">/ Approval Information</span></div>
    <table class="info-table content-table-font"><tbody><tr>
  `
    for (const item of approvalItems) {
        const value = approvalData?.[item.id] || '/'
        html += `
      <td class="info-table-th">
        <div>${escapeHtml(item.label)}</div>
        <div class="en-num-font">${escapeHtml(item.enLabel || '')}</div>
      </td>
      <td class="info-table-td content-table-font" style="text-align:left;">${escapeHtml(value)}</td>
    `
    }
    html += '</tr></tbody></table></div>'
    return html
}



export function generatePrintHTML(homeForm, fixedForm, testProjects, watermarkText = "NORMAL TESTING TECHNOLOGY", isCNAS = false) {
    // 厂区代码 -> 公司名称映射
    const companyMap = {
        'SZNM': { cn: '苏州诺码检测技术有限公司', en: 'Suzhou Normal Testing Technology Co., Ltd.' },
        'JANM': { cn: '苏州诺码检测技术有限公司吉安分公司', en: "Normal Testing Technology Co., Ltd（Ji An Branch）." },
    };
    const factoryCode = (homeForm.FactoryCode || '').toUpperCase();
    const defaultCompany = { cn: '苏州诺码检测技术有限公司', en: 'Suzhou Normal Testing Technology Co., Ltd.' };
    const company = companyMap[factoryCode] || defaultCompany;

    const margin = fixedForm.MarginSettings || { sampleDesc: 0, clientInfo: 0, testEnv: 0, testEquipment: 0 }
    const validProjects = (testProjects || []).filter(item => item?.schemeConfig)
    const cnasRemarkZh = `注：A---该项目不在本实验室CNAS资质范围内；B---该项目不在本实验室资质范围内；C---该项目由具有CNAS资质的分包实验室完成。`
    const cnasRemarkEn = `Note: Superscript in the report:A---The item is not within the scope of CNAS qualification of the laboratory;B---The item is not within the scope of the qualification of the laboratory;C---The item was completed by a subcontracted laboratory with CNAS qualification.`

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>检测报告</title>
  <style>
       * { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #fff;
  font-family: SimSun;
  margin: 0;
  padding: 22mm 5mm 0 5mm;
}
    img {
      height: auto !important;
      object-fit: contain !important;
    }
    .content-block {
      page-break-inside: avoid !important;
      margin-bottom: 12px !important;
      margin-top: 0 !important;
    }
    h3 {
      page-break-after: avoid !important;
      margin-bottom: 6px !important;
    }
    h1 {
      font-family: SimSun;
      font-size: 28pt;
      font-weight: bold;
      text-align:center;
      margin: 5mm 0 4mm;
    }
    h2 {
      font-family: SimSun;
      font-size: 24pt;
      font-weight: bold;
      text-align:center;
      margin: 0 0 6mm;
    }
    .title-num-font {
      font-size: 12pt;
      font-weight: bold;
      font-family: SimSun;
    }
    .title-num-font .en-num-font {
      font-family: Arial;
    }
    .info-table-font {
      font-size: 11pt;
      font-family: SimSun;
    }
    .info-table-font .en-num-font {
      font-family: Arial;
    }
    .content-table-font {
      font-size: 10.5pt;
      font-family: SimSun;
    }
    .content-table-font .en-num-font {
      font-family: Arial;
    }
    .disclaimer {
      font-size: 9pt;
      line-height: 1.7;
      margin: 6mm 0;
      text-align: justify;
      font-family: SimSun;
    }
    .disclaimer-en {
      font-family: "Times New Roman";
    }
    .company {
      text-align:center;
      margin: 35mm 0 5mm;
    }
    .cn-name {
      font-family: SimSun;
      font-size: 16pt;
      font-weight:bold;
    }
    .en-name {
      font-family: SimSun;
      font-size: 14pt;
      font-weight:bold;
      margin-top:4px;
      color:#333;
    }
    .spacer { height: var(--block-margin, 5mm); }
    .data-table, .info-table {
      width:100%;
      border-collapse:collapse;
      margin: 0 !important;
    }
    .content-table-font + .info-table {
      margin-top: 0 !important;
    }
    .data-table th, .data-table td,
    .info-table th, .info-table td {
      border:1px solid #000;
      padding:5px;
      vertical-align:middle;
      word-break:break-word;
      text-align:center;
    }

/* 首页无边框表格：字段紧贴横线，内容居中 */
.info-table.no-border th,
.info-table.no-border td {
    border: none !important;
    vertical-align: bottom !important;
    padding: 6px 0 !important;        /* 左右内边距为0，紧贴 */
    line-height: 1.5 !important;
}
.info-table.no-border th {
    background: transparent !important;
    width: 28%;                       /* 稍微缩小宽度，让横线更长 */
    text-align: left;
    padding-left: 10px !important;    /* 向右调（数值越大越靠右） */
    padding-top: 12px !important;     /* 向下调（数值越大越靠下） */
}
.info-table.no-border td {
    border-bottom: 1px solid #000 !important;
    text-align: center !important;    /* 内容在横线上居中 */
    white-space: pre-wrap !important;
    word-break: break-word !important;
    padding-top: 12px !important;     /* 与 th 同步向下，保持对齐 */
}
    .info-table th {
      background:#f5f7fa;
      width: 30%;
    }
    .data-table th {
      background:#e6e6e6;
    }
    .photo-row {
      display:flex;
      gap:15px;
      margin:10px 0;
      flex-wrap:wrap;
    }
    .photo-item {
      flex:1;
      min-width: 45%;
      text-align:center;
    }
    .cnas-table-remark {
      font-size:7.5pt;
      line-height:1.5;
      margin-top:6px;
    }
    .cnas-zh {
      font-family: SimSun;
    }
    .cnas-en {
      font-family: Arial;
    }
@media print {
  @page {
    size: A4;
    margin: 22mm 5mm 20mm 5mm;
  }
  body {
    margin: 0;
    padding: 0;
  }
}
  </style>
</head>
<body>
<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 42px; color: #999999; opacity: 0.12; font-family: Arial; white-space: nowrap; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
    NORMAL TESTING TECHNOLOGY
</div>

  <!-- 首页 -->
  <div class="content-block" style="padding-top: 15mm;">
    <h1>检 测 报 告</h1>
    <h2>TEST REPORT</h2>
    <table class="info-table info-table-font no-border">
      <tr>
        <th>委托单位名称<br><span class="en-num-font">Client</span></th>
        <td>${escapeHtml(homeForm.ClientName || '')}</td>
      </tr>
      <tr>
        <th>委托单位地址<br><span class="en-num-font">Client Address</span></th>
        <td>${escapeHtml(homeForm.ClientAddress || '')}</td>
      </tr>
      <tr>
        <th>收样日期<br><span class="en-num-font">Date of Receipt</span></th>
        <td><span class="en-num-font">${formatDate(homeForm.ReceiptDate)}</span></td>
      </tr>
     <tr>
        <th>检测周期<br><span class="en-num-font">Test Cycle</span></th>
        <td><span class="en-num-font">${escapeHtml(homeForm.TestCycle || '')}</span></td>
     </tr>
      <tr>
        <th>报告日期<br><span class="en-num-font">Report Date</span></th>
        <td><span class="en-num-font">${formatDate(homeForm.ReportDate)}</span></td>
      </tr>
    </table>

    <div class="disclaimer">
      ${escapeHtml(disclaimerText).split('\n')[0]}
      <br>
      <span class="disclaimer-en">${escapeHtml(disclaimerText).split('\n')[1]}</span>
    </div>

    <div class="company">
      <div class="cn-name">${escapeHtml(company.cn)}</div>
      <div class="en-name">${escapeHtml(company.en)}</div>
    </div>
  </div>

  <!-- 内页 -->
  <div class="content-block" style="page-break-before: always;">
    <div class="spacer" style="--block-margin:${margin.sampleDesc}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font"><span class="en-num-font">1、</span>样品描述 <span class="en-num-font">/ Sample Description</span></h3>
      <p class="content-table-font">${escapeHtml(fixedForm.sampleDesc || '无')}</p>
    </div>
  </div>

<table class="info-table info-table-font">
    <tr><th>委托单号<br><span class="en-num-font">Order No.</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.orderNo || '')}</span></td></tr>
    <tr><th>样品名称<br><span class="en-num-font">Sample Name</span></th><td>${escapeHtml(fixedForm?.sampleName || '')}</td></tr>
    <tr><th>样品牌号<br><span class="en-num-font">Sample Material</span></th><td>${escapeHtml(fixedForm?.sampleMaterial || '')}</td></tr>
    <tr><th>样品规格<br><span class="en-num-font">Sample Specification</span></th><td>${escapeHtml(fixedForm?.sampleSpec || '')}</td></tr>
    <tr><th>样品信息<br><span class="en-num-font">Sample Information</span></th><td>${escapeHtml(fixedForm?.sampleInfo || '').replace(/\n/g, '<br>')}</td></tr>
    <tr><th>其余信息<br><span class="en-num-font">Additional Information</span></th><td>${escapeHtml(fixedForm?.additionalInfo || '').replace(/\n/g, '<br>')}</td></tr>
</table>

  <div class="content-block">
    <div class="spacer" style="--block-margin:${margin.testEnv}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font"><span class="en-num-font">3、</span>检测环境 <span class="en-num-font">/ Test Environment</span></h3>
<table class="data-table content-table-font">
  <thead>
    <tr>
      <th class="content-table-font">序号<br><small class="en-num-font">No.</small></th>
      <th class="content-table-font">项目<br><small class="en-num-font">Item</small></th>
      <th class="content-table-font">温度要求（℃）<br><small class="en-num-font">Reguired Ambient Temperature</small></th>
      <th class="content-table-font">检测室温度（℃）<br><small class="en-num-font">Test Room Ambient Temperature</small></th>
    </tr>
  </thead>
  <tbody>${(fixedForm.testEnv || []).map((item, i) => `
    <tr>
      <td class="en-num-font">${i + 1}</td>
      <td class="content-table-font">${escapeHtml(item.item || '').replace(/&lt;br&gt;/g, '<br>')}</td>
      <td class="en-num-font">${escapeHtml(item.reqTemp || '')}</td>
      <td class="en-num-font">${escapeHtml(item.testTemp || '')}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="content-table-font">无数据</td></tr>'}</tbody>
</table>
    </div>
  </div>

<div class="content-block">
  <div class="spacer" style="--block-margin:${margin.testEquipment}mm;"></div>
  <div class="content-section">
    <h3 class="title-num-font"><span class="en-num-font">4、</span>检测设备 <span class="en-num-font">/ Test Equipment</span></h3>
    <table class="data-table content-table-font">
      <thead>
        <tr>
          <th class="en-num-font">序号<br><small class="en-num-font">No.</small></th>
          <th class="content-table-font">设备名称<br><small class="en-num-font">Name of Test Equipment</small></th>
          <th class="en-num-font">型号<br><small class="en-num-font">Model</small></th>
          <th class="en-num-font">校准有效期至<br><small class="en-num-font">Calibration Validity Period</small></th>
        </tr>
      </thead>
      <tbody>
        ${(fixedForm.testEquipment || []).map((item, i) => {
        const { zh, en } = splitTextName(item.name || '')
        return `
          <tr>
            <td class="en-num-font">${i + 1}</td>
            <td class="content-table-font">
              ${escapeHtml(zh)}${en ? `<br><span class="en-num-font">${escapeHtml(en)}</span>` : ''}
            </td>
            <td class="en-num-font">${escapeHtml(item.model || '')}</td>
            <td class="en-num-font">${escapeHtml(item.validUntil || '')}</td>
          </tr>
          `
    }).join('')}
      </tbody>
    </table>
    ${isCNAS ? `
    <div class="cnas-table-remark">
      <div class="cnas-zh">${escapeHtml(cnasRemarkZh)}</div>
      <div class="cnas-en">${escapeHtml(cnasRemarkEn)}</div>
    </div>` : ''}
  </div>
</div>

<div class="content-block" style="padding-top: 5mm;">
  <h3 class="title-num-font">
    <span class="en-num-font">5、</span>检测结果及检测依据
    <span class="en-num-font"> / Test Results and Test Reference</span>
  </h3>
</div>

${validProjects.map((project, index) => {
    const config = project.schemeConfig
    const rd = project.reportData || {}
    const gap = project.ProjectMargin ?? 10

    // 判断是否为外包项目
    const projectTitle = config?.ProjectTitle || project?.techSpecName || ''
    const isOutsourced = projectTitle.includes('外包项目')

    // 外包项目：只显示"外包项目见附件"，不带"检测依据："标签
    // 非外包项目：显示"检测依据：" + 输入值
    const testReferenceHtml = isOutsourced
        ? `<div class="content-table-font" style="margin-bottom: 8px; font-weight: 500;">试验报告见附件。/The test report is attached to the attachment.</div>`
        : `<div class="content-table-font" style="margin-bottom: 8px;">检测依据：<span class="en-num-font">${escapeHtml(rd.testReference || '')}</span></div>`

    return `
    <div class="content-block">
      <div class="spacer" style="--block-margin:${gap}mm;"></div>
      <div class="content-section">
<h3 class="title-num-font"><span class="en-num-font">5.${index + 1}</span> ${escapeHtml(config.ProjectTitle || project.techSpecName || '检测项目')}<span class="en-num-font">${config.ProjectEnTitle ? ' / ' + escapeHtml(config.ProjectEnTitle) : ''}</span></h3>       
${testReferenceHtml}
        ${(() => {
            if (rd.isImpactGrouped && rd.impactGroups?.length > 0) {
                return rd.impactGroups.map((group, idx) => {
                    const groupConfig = JSON.parse(JSON.stringify(config));
                    groupConfig.BaseColumns = groupConfig.BaseColumns.filter(col => col.label !== '试样编号');
                    const dynamicCol = groupConfig.ExtendColumns?.find(col => col.isDynamic);
                    if (dynamicCol) {
                        dynamicCol.subColumns = group.subColumns || [];
                    }
                    let html = '';
                    html += renderParamItems(config.ParamItems, rd.paramValues);
                    html += renderMainTable(groupConfig, group.tableData, rd);
                    const bottomReqForRender = {};
                    if (groupConfig.BottomColumns) {
                        groupConfig.BottomColumns.forEach(col => {
                            (col.subColumns || []).forEach(sub => {
                                const label = sub.label || '';
                                let value = '';
                                if (label.includes('单个') || label.includes('Single')) value = group.bottomRequirement?.singleReq || '';
                                else if (label.includes('平均') || label.includes('Avg')) value = group.bottomRequirement?.avgReq || '';
                                else if (label.includes('侧向') || label.includes('LE')) value = group.bottomRequirement?.leReq || '';
                                else if (label.includes('剪切') || label.includes('断面') || label.includes('Fracture')) value = group.bottomRequirement?.shearReq || '';
                                bottomReqForRender[`${col.id}_${sub.id}`] = value;
                            });
                        });
                    }
                    html += renderBottomColumns(groupConfig, bottomReqForRender);
                    const marginTop = idx === 0 ? '0' : '10mm';
                    return `<div style="margin-top: ${marginTop};">${html}</div>`;
                }).join('');
            } else {
                let html = '';
                html += renderParamItems(config.ParamItems, rd.paramValues);
                html += renderMainTable(config, rd.tableData, rd);
                html += renderBottomColumns(config, rd.bottomRequirement);
                return html;
            }
        })()}
        ${renderPhotoRows(rd.photoRows, config)}
        ${renderApprovalItems(config.ApprovalItems, rd.approval)}
      </div>
    </div>
    `
}).join('')}

</body>
</html>
  `
}

// 计算行合并规则（合并所有相同值的行，不限行数）
export function calcRowMergeRules(tableData, mergeColIds) {
    const rules = {};
    if (!mergeColIds || mergeColIds.length === 0) return rules;
    mergeColIds.forEach(colId => {
        let startRow = 0;
        for (let i = 1; i <= tableData.length; i++) {
            const currentVal = String(tableData[i]?.[colId] ?? '').trim();
            const prevVal = String(tableData[startRow]?.[colId] ?? '').trim();
            if (i === tableData.length || currentVal !== prevVal) {
                const rowspan = i - startRow;
                for (let j = startRow; j < i; j++) {
                    rules[`${j}_${colId}`] = j === startRow ? rowspan : 0;
                }
                startRow = i;
            }
        }
    });
    return rules;
}