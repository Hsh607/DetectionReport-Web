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
export const disclaimerText = `本报告未加盖本公司专用章无效；无编辑、审核、签发人签字无效；涂改无效。生产厂家、规格、炉批号、标准、牌号、样品标识等信息由委托人提供，其真实性由委托人负责。报告仅对来样负责。未经书面同意，不得部分地复制本报告。对测试报告若有异议，请于收到报告之日起十五日内提出。如果报告中的中英文内容有矛盾，以中文内容为准。报告封面无CNAS章时，此报告不做仲裁及相关证明用。
This report without the company's special seal is invalid. This report is invalid without the signature of the editor, auditor or approver. This report shall be invalid if the content of the report is altered. Sample’s information (Manufacturer, Size, Heat No, Lot No, Specification, Grade, Marking. etc.) is submitted by the applicant. Its authenticity is the responsibility of the applicant. This report is only responsible for the test sample. This report shall not be copied partially without the written permission of the company. If you have any objection to the test report, please submit it within 15 days from the date of receiving the report. In case of any discrepancy between the Chinese contents of this report, the Chinese contents shall prevail. The report without the mark of CNAS, shall not be used for arbitration or relevant certification.`

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

// 渲染主表格
export function renderMainTable(config, tableData) {
    if (!tableData || tableData.length === 0) return '<div class="content-table-font">无数据</div>'
    const baseCols = config.BaseColumns || []
    const extendCols = config.ExtendColumns || []
    const hasSubColumns = extendCols.some(col => col.subColumns && col.subColumns.length > 0)

    let theadRow1 = '<tr>'
    for (const col of baseCols) {
        const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
        theadRow1 += `<th ${rowspanAttr} class="content-table-font en-num-font">${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
    }
    for (const col of extendCols) {
        if (col.subColumns && col.subColumns.length) {
            const colspan = col.subColumns.length
            theadRow1 += `<th colspan="${colspan}" class="content-table-font en-num-font">${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
        } else {
            const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
            theadRow1 += `<th ${rowspanAttr} class="content-table-font en-num-font">${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
        }
    }
    theadRow1 += '</tr>'

    let theadRow2 = ''
    if (hasSubColumns) {
        theadRow2 = '<tr>'
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    theadRow2 += `<th class="content-table-font en-num-font">${escapeHtml(sub.label)}<br><small>${escapeHtml(sub.enLabel || '')}</small></th>`
                }
            }
        }
        theadRow2 += '</tr>'
    }

    let tbody = ''
    for (const row of tableData) {
        let rowHtml = '<tr>'
        for (const col of baseCols) {
            rowHtml += `<td class="content-table-font en-num-font">${escapeHtml(row[col.id] ?? '')}</td>`
        }
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    rowHtml += `<td class="content-table-font en-num-font">${escapeHtml(row[sub.id] ?? '')}</td>`
                }
            } else {
                rowHtml += `<td class="content-table-font en-num-font">${escapeHtml(row[col.id] ?? '')}</td>`
            }
        }
        rowHtml += '</tr>'
        tbody += rowHtml
    }

    return `<table class="data-table content-table-font"><thead>${theadRow1}${theadRow2}</thead><tbody>${tbody}</tbody></table>`
}

// 渲染照片
export function renderPhotoRows(photoRows) {
    if (!photoRows || photoRows.length === 0) return ''
    const API_BASE = process.env.VUE_APP_BASE_URL
    let html = '<div class="photo-title title-num-font">试验照片 / Test Photos</div>'
    for (const row of photoRows) {
        html += '<div class="photo-row">'
        if (row.LeftUrl || row.LeftDataURL) {
            const url = row.LeftDataURL || (row.LeftUrl.startsWith('http') ? row.LeftUrl : `${API_BASE}${row.LeftUrl}`)
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:200px;border:1px solid #ccc;"><div class="content-table-font">${escapeHtml(row.LeftDesc || '')}</div></div>`
        }
        if (row.RightUrl || row.RightDataURL) {
            const url = row.RightDataURL || (row.RightUrl.startsWith('http') ? row.LeftUrl : `${API_BASE}${row.RightUrl}`)
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:200px;border:1px solid #ccc;"><div class="content-table-font">${escapeHtml(row.RightDesc || '')}</div></div>`
        }
        html += '</div>'
    }
    return html
}

// 渲染审批信息
export function renderApprovalItems(approvalItems, approvalData) {
    if (!approvalItems || approvalItems.length === 0) return ''
    let html = `
  <div style="margin: 20px 0;">
    <div class="title-num-font" style="margin-bottom: 10px;">审批信息 / Approval Information</div>
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

export function generatePrintHTML(homeForm, fixedForm, testProjects, isCNAS = false, watermarkText = "NORMAL TESTING TECHNOLOGY") {
    const margin = fixedForm.MarginSettings || { sampleDesc: 0, clientInfo: 0, testEnv: 0, testEquipment: 0 }
    const validProjects = (testProjects || []).filter(item => item?.schemeConfig)

    const cnasRemark = `注：A---该项目不在本实验室CNAS资质范围内；B---该项目不在本实验室资质范围内；C---该项目由具有CNAS资质的分包实验室完成。
Note: Superscript in the report:A---The item is not within the scope of CNAS qualification of the laboratory;B---The item is not within the scope of the qualification of the laboratory;C---The item was completed by a subcontracted laboratory with CNAS资质.`

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>检测报告</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 25mm 15mm 20mm 15mm;
    }

    body {
      background: #fff;
      font-family: SimSun, Arial;
    }

    img {
      max-width: 100px !important;
      height: auto !important;
      object-fit: contain !important;
    }

    .content-block {
      page-break-inside: avoid !important;
      margin-bottom: 12px !important;
    }

    h3 {
      page-break-after: avoid !important;
      margin-bottom: 6px !important;
    }

    h1 { font-size: 28pt; font-weight: bold; text-align:center; margin: 5mm 0 4mm; }
    h2 { font-size: 24pt; font-weight: bold; text-align:center; margin: 0 0 6mm; }
    .title-num-font { font-size: 12pt; font-weight: bold; }
    .info-table-font { font-size: 11pt; }
    .content-table-font { font-size: 10.5pt; }
    .en-num-font { font-family: Arial; }

    .disclaimer {
      font-size: 10.5pt; line-height: 1.7; margin: 8mm 0;
      text-align: justify;
    }

    .company { text-align:center; margin: 10mm 0 5mm; }
    .cn-name { font-size: 16pt; font-weight:bold; }
    .en-name { font-size: 14pt; font-weight:bold; margin-top:4px; color:#333; }

    .spacer { height: 8px; }

    /* 🔥 关键修复：表格间距彻底消失 */
    .data-table, .info-table {
      width:100%; 
      border-collapse:collapse; 
      margin: 0 0 0 0 !important;
    }
    .content-table-font + .info-table {
      margin-top: 0 !important;
    }
    .data-table th, .data-table td, 
    .info-table th, .info-table td {
      border:1px solid #000; padding:5px; vertical-align:middle;
      word-break:break-word; text-align:center;
    }
    .info-table th { background:#f5f7fa; width: 30%; }
    .data-table th { background:#e6e6e6; }

    .photo-row { display:flex; gap:15px; margin:10px 0; flex-wrap:wrap; }
    .photo-item { flex:1; min-width: 45%; text-align:center; }
    .cnas-table-remark { font-size:7.5pt; margin-top:6px; line-height:1.5; }
  </style>
</head>
<body>

  <!-- 水印 -->
<!-- 🔥 只保留中间一条斜向水印，和截图格式完全一致 -->
<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 42px; color: #00000015; font-family: Arial, SimSun; white-space: nowrap;">
    NORMAL TESTING TECHNOLOGY
  </div>
</div>
  <!-- ====================== 首页（无系统页眉） ====================== -->
  <div class="content-block">
    <h1>检 测 报 告</h1>
    <h2>TEST REPORT</h2>
    <table class="info-table info-table-font">
      <tr><th>委托单位名称<br>Client</th><td>${escapeHtml(homeForm.ClientName || '')}</td></tr>
      <tr><th>委托单位地址<br>Client Address</th><td>${escapeHtml(homeForm.ClientAddress || '')}</td></tr>
      <tr><th>收样日期<br>Date of Receipt</th><td>${formatDate(homeForm.ReceiptDate)}</td></tr>
      <tr><th>检测周期<br>Test Cycle</th><td>${escapeHtml(homeForm.TestCycle || '')}</td></tr>
      <tr><th>报告日期<br>Report Date</th><td>${formatDate(homeForm.ReportDate)}</td></tr>
    </table>
    <div class="disclaimer">${escapeHtml(disclaimerText)}</div>
    <div class="company">
      <div class="cn-name">苏州诺码检测技术有限公司</div>
      <div class="en-name">Suzhou Normal Testing Technology Co., Ltd.</div>
    </div>
  </div>

  <!-- ====================== 内页：样品描述从这里开始，强制分页 ====================== -->
  <div class="content-block" style="page-break-before: always;">
    <div class="spacer" style="--block-margin:${margin.sampleDesc}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font">1、样品描述 / Sample Description</h3>
      <p class="content-table-font">${escapeHtml(fixedForm.sampleDesc || '无')}</p>
    </div>
  </div>

  <div class="content-block">
    <div class="spacer" style="--block-margin:${margin.clientInfo}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font">2、客户提供信息 / Information Provided by Client</h3>
      <table class="info-table info-table-font">
        <tr><th>报检单号<br>Inspection Order No.</th><td>${escapeHtml(fixedForm?.inspectionOrderNo || '')}</td></tr>
        <tr><th>委托单号<br>Order No.</th><td>${escapeHtml(fixedForm?.orderNo || '')}</td></tr>
        <tr><th>技术条件<br>Material specification</th><td>${escapeHtml(fixedForm?.materialSpec || '')}</td></tr>
        <tr><th>样品名称<br>Sample Name</th><td>${escapeHtml(fixedForm?.sampleName || '')}</td></tr>
        <tr><th>样品牌号<br>Sample Material</th><td>${escapeHtml(fixedForm?.sampleMaterial || '')}</td></tr>
        <tr><th>样品规格<br>Sample Specification</th><td>${escapeHtml(fixedForm?.sampleSpec || '')}</td></tr>
      </table>
    </div>
  </div>

  <div class="content-block">
    <div class="spacer" style="--block-margin:${margin.testEnv}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font">3、检测环境 / Test Environment</h3>
      <table class="data-table content-table-font">
        <thead><tr class="en-num-font"><th>检测项目编码</th><th>项目</th><th>温度要求</th><th>检测室温度</th><th>湿度要求</th><th>检测室湿度</th><th>技术要求</th></tr></thead>
        <tbody>${(fixedForm.testEnv || []).map(item => `
          <tr>
            <td>${escapeHtml(item.projectCode || '')}</td>
            <td>${escapeHtml(item.item || '')}</td>
            <td>${escapeHtml(item.reqTemp || '')}</td>
            <td>${escapeHtml(item.testTemp || '')}</td>
            <td>${escapeHtml(item.reqHumidity || '')}</td>
            <td>${escapeHtml(item.testHumidity || '')}</td>
            <td>${escapeHtml(item.techName || '')}</td>
          </tr>
        `).join('') || '<tr><td colspan="7">无数据</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <div class="content-block">
    <div class="spacer" style="--block-margin:${margin.testEquipment}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font">4、检测设备 / Test Equipment</h3>
      <table class="data-table content-table-font">
        <thead><tr class="en-num-font"><th>序号</th><th>设备名称</th><th>型号</th><th>设备编号</th><th>校准有效期至</th></tr></thead>
        <tbody>${(fixedForm.testEquipment || []).map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(item.name || '')}</td>
            <td>${escapeHtml(item.model || '')}</td>
            <td>${escapeHtml(item.eqNo || '')}</td>
            <td>${escapeHtml(item.validUntil || '')}</td>
          </tr>
        `).join('')}</tbody>
      </table>
      <div class="cnas-table-remark">${escapeHtml(cnasRemark)}</div>
    </div>
  </div>

  ${validProjects.map((project, index) => {
        const config = project.schemeConfig
        const rd = project.reportData || {}
        const gap = project.ProjectMargin ?? 10
        return `
    <div class="content-block">
      <div class="spacer" style="--block-margin:${gap}mm;"></div>
      <div class="content-section">
        <h3 class="title-num-font">5.${index + 1} ${escapeHtml(config.ProjectTitle || project.techName || '检测项目')}</h3>
        <div class="content-table-font">检测依据：${escapeHtml(rd.testReference || '')}</div>
        ${renderParamItems(config.ParamItems, rd.paramValues)}
        ${renderMainTable(config, rd.tableData)}
        ${renderPhotoRows(rd.photoRows)}
        ${renderApprovalItems(config.ApprovalItems, rd.approval)}
      </div>
    </div>
    `
    }).join('')}

</body>
</html>
  `
}