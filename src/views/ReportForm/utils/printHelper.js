// 转义 HTML 特殊字符
export function escapeHtml(str) {
    if (!str) return ''
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;'
        if (m === '<') return '&lt;'
        if (m === '>') return '&gt;'
        return m
    })
}

// 格式化日期
export function formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('zh-CN')
}

// 声明文字（完整中英文）
export const disclaimerText = `本报告未加盖本公司检测专用章无效；无编辑、审核、签发人签字无效；涂改无效。生产厂家、规格、炉批号、标准、牌号、样品标识等信息由委托人提供，其真实性由委托人负责。报告仅对来样负责。未经本公司书面同意，不得部分地复制本报告。对测试报告若有异议，请于收到报告之日起十五日内提出。如果报告中的中、英文内容上有矛盾，以中文内容为准。报告封面无CNAS标识时，此报告不做仲裁及相关证明用。

This report without the company's special seal for testing is invalid. This report is invalid without the signature of the editor, auditor or approver. This report shall be invalid if the content of the report is altered. Sample's information (Manufacturer, Size, Heat No., Lot No, Specification, Grade, Marking.etc.) is submitted by the applicant. Its authenticity is the responsibility of the applicant. This report is only responsible for the test sample. This report shall not be copied partially without the written permission of the company. If you have any objection to the test report, please submit it within 15 days from the date of receiving the report. In case of any discrepancy between the Chinese and English contents of this report, the Chinese contents shall prevail. The report without the mark of CNAS, shall not be used for arbitration or other relevant certification.`

// 渲染参数行
export function renderParamItems(paramItems, paramValues) {
    if (!paramItems || paramItems.length === 0) return ''
    let html = '<table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 8px 0;">'
    html += '<tbody><tr>'
    for (const p of paramItems) {
        const val = paramValues?.[p.id] ?? ''
        html += `
            <td style="background: #f5f7fa; font-weight: 600; border: 1px solid #dcdfe6; width: 30%;">
                <div>${escapeHtml(p.label)}</div>
                <div style="font-size: 12px; color: #666;">${escapeHtml(p.enLabel)}</div>
             </td>
            <td style="background: #fff; border: 1px solid #dcdfe6;">
                ${escapeHtml(String(val))}
            </td>
        `
    }
    html += '</tr></tbody></table>'
    return html
}

// 渲染主表格
export function renderMainTable(config, tableData) {
    if (!tableData || tableData.length === 0) return '<div>无数据</div>'
    const baseCols = config.BaseColumns || []
    const extendCols = config.ExtendColumns || []
    const hasSubColumns = extendCols.some(col => col.subColumns && col.subColumns.length > 0)

    let theadRow1 = '<tr>'
    for (const col of baseCols) {
        const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
        theadRow1 += `<th class="base-th" ${rowspanAttr}>${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
    }
    for (const col of extendCols) {
        if (col.subColumns && col.subColumns.length) {
            const colspan = col.subColumns.length
            theadRow1 += `<th colspan="${colspan}" class="merge-th">${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
        } else {
            // ✅ 修复：和 baseCols 保持一致，动态加 rowspan
            const rowspanAttr = hasSubColumns ? 'rowspan="2"' : ''
            theadRow1 += `<th class="extend-th" ${rowspanAttr}>${escapeHtml(col.label)}<br><small>${escapeHtml(col.enLabel || '')}</small></th>`
        }
    }
    theadRow1 += '</tr>'

    let theadRow2 = ''
    if (hasSubColumns) {
        theadRow2 = '<tr>'
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    theadRow2 += `<th class="sub-th">${escapeHtml(sub.label)}<br><small>${escapeHtml(sub.enLabel || '')}</small></th>`
                }
            }
            // ✅ 修复：普通列已经加了rowspan=2，这里不再生成空列
        }
        theadRow2 += '</tr>'
    }

    let tbody = ''
    for (const row of tableData) {
        let rowHtml = '<tr>'
        for (const col of baseCols) {
            rowHtml += `<td>${escapeHtml(row[col.id] ?? '')}</td>`
        }
        for (const col of extendCols) {
            if (col.subColumns && col.subColumns.length) {
                for (const sub of col.subColumns) {
                    rowHtml += `<td>${escapeHtml(row[sub.id] ?? '')}</td>`
                }
            } else {
                rowHtml += `<td>${escapeHtml(row[col.id] ?? '')}</td>`
            }
        }
        rowHtml += '</tr>'
        tbody += rowHtml
    }

    return `<table class="data-table"><thead>${theadRow1}${theadRow2}</thead><tbody>${tbody}</tbody></table>`
}

// 渲染照片行
export function renderPhotoRows(photoRows) {
    if (!photoRows || photoRows.length === 0) return ''
    let html = '<div><strong>试验照片</strong></div>'
    for (const row of photoRows) {
        html += '<div class="photo-row">'
        if (row.LeftDataURL) html += `<div class="photo-item"><img src="${row.LeftDataURL}" alt="左图"><div>${escapeHtml(row.LeftDesc)}</div></div>`
        if (row.RightDataURL) html += `<div class="photo-item"><img src="${row.RightDataURL}" alt="右图"><div>${escapeHtml(row.RightDesc)}</div></div>`
        html += '</div>'
    }
    return html
}

// 生成打印HTML（✅ 带调试日志，兼容所有可能的字段名）
export function generatePrintHTML(homeForm, fixedForm, testProjects) {
    // ========== 调试日志：打开浏览器控制台就能看到数据 ==========
    console.log('===== 调试开始 =====')
    console.log('fixedForm:', fixedForm)
    console.log('fixedForm.FixedInfo:', fixedForm?.FixedInfo)
    console.log('fixedForm.fixedInfo:', fixedForm?.fixedInfo) // 兼容小写
    console.log('homeForm:', homeForm)
    console.log('homeForm.testEnv:', homeForm?.testEnv)
    console.log('homeForm.TestEnvironment:', homeForm?.TestEnvironment)
    console.log('===== 调试结束 =====')

    const validProjects = testProjects.filter(item => item?.schemeConfig)
    const totalPages = 1 + 1 + validProjects.length
    const A4_HEIGHT_MM = 297

    // 分页虚线+页码
    let pageMarkers = ''
    for (let i = 1; i <= totalPages; i++) {
        const pageTop = A4_HEIGHT_MM * i
        pageMarkers += `
            <hr class="page-divider" style="top: ${pageTop}mm;">
            <div class="page-number" style="top: ${pageTop - 10}mm;">第 ${i} 页 / 共 ${totalPages} 页</div>
        `
    }

    // ✅ 兼容所有可能的字段名，按优先级从高到低
    const testEnvironmentList =
        fixedForm?.FixedInfo?.testEnv ||
        fixedForm?.fixedInfo?.testEnv ||
        fixedForm?.testEnv ||
        homeForm?.testEnv ||
        homeForm?.TestEnvironment ||
        homeForm?.testEnvironment ||
        []

    console.log('最终使用的检测环境数据:', testEnvironmentList)

    // 报告正文：样品描述、客户信息、检测环境、检测设备（第二页开始）
    const reportBodyHtml = `
        <div class="print-body" style="padding: 8mm; width:100%;">
            <!-- 1. 样品描述 -->
            <div class="section">
                <h3>1、样品描述/Sample Description</h3>
                <p class="content-text">${escapeHtml(homeForm.SampleDescription || fixedForm?.FixedInfo?.sampleDesc || fixedForm?.fixedInfo?.sampleDesc || '')}</p>
            </div>

            <!-- 2. 客户提供信息（✅ 也兼容大小写） -->
            <div class="section">
                <h3>2、客户提供信息/Information Provided by Client</h3>
                <table class="info-table">
                    <tr><th>报检单号/Inspection Order No.</th><td>${escapeHtml(homeForm.InspectionOrderNo || fixedForm?.FixedInfo?.inspectionOrderNo || fixedForm?.fixedInfo?.inspectionOrderNo || '')}</td></tr>
                    <tr><th>委托单号/Order No.</th><td>${escapeHtml(homeForm.OrderNo || fixedForm?.FixedInfo?.orderNo || fixedForm?.fixedInfo?.orderNo || '')}</td></tr>
                    <tr><th>技术条件/Material specification</th><td>${escapeHtml(homeForm.MaterialSpecification || fixedForm?.FixedInfo?.materialSpec || fixedForm?.fixedInfo?.materialSpec || '')}</td></tr>
                    <tr><th>样品名称/Sample Name</th><td>${escapeHtml(homeForm.SampleName || fixedForm?.FixedInfo?.sampleName || fixedForm?.fixedInfo?.sampleName || '')}</td></tr>
                    <tr><th>样品牌号/Sample Material</th><td>${escapeHtml(homeForm.SampleMaterial || fixedForm?.FixedInfo?.sampleMaterial || fixedForm?.fixedInfo?.sampleMaterial || '')}</td></tr>
                    <tr><th>样品规格/Sample Specification</th><td>${escapeHtml(homeForm.SampleSpecification || fixedForm?.FixedInfo?.sampleSpec || fixedForm?.fixedInfo?.sampleSpec || '')}</td></tr>
                    <tr><th>其余信息/Additional Information</th><td>${escapeHtml(homeForm.AdditionalInformation || fixedForm?.FixedInfo?.additionalInfo || fixedForm?.fixedInfo?.additionalInfo || '')}</td></tr>
                </table>
            </div>

            <!-- 3. 检测环境 ✅ 兼容所有字段名，且加了调试输出 -->
            <div class="section">
                <h3>3、检测环境/Test Environment</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>检测项目编码</th>
                            <th>项目/Item</th>
                            <th>温度要求 (℃)</th>
                            <th>检测室温度 (℃)</th>
                            <th>湿度要求 (%RH)</th>
                            <th>检测室湿度 (%RH)</th>
                            <th>技术要求</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${testEnvironmentList.length > 0
            ? testEnvironmentList.map((item, index) => {
                // 每个item也打印调试日志
                console.log(`检测环境第${index}条数据:`, item)
                return `
                                <tr>
                                    <td>${escapeHtml(item.projectCode || item.projectcode || item['检测项目编码'] || '')}</td>
                                    <td>${escapeHtml(item.item || item['项目/Item'] || '')}</td>
                                    <td>${escapeHtml(item.reqTemp || item.reqtemp || item['温度要求'] || '')}</td>
                                    <td>${escapeHtml(item.testTemp || item.testtemp || item['检测室温度'] || '')}</td>
                                    <td>${escapeHtml(item.reqHumidity || item.reqhumidity || item['湿度要求'] || '')}</td>
                                    <td>${escapeHtml(item.testHumidity || item.testhumidity || item['检测室湿度'] || '')}</td>
                                    <td>${escapeHtml(item.techSpecName || item.techspecname || item['技术要求'] || '')}</td>
                                </tr>
                            `}).join('')
            : '<tr><td colspan="7" style="text-align:center;">无检测环境数据</td></tr>'
        }
                    </tbody>
                </table>
            </div>

            <!-- 4. 检测设备 -->
            <div class="section">
                <h3>4、检测设备/Test Equipment</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>序号/No.</th>
                            <th>设备名称</th>
                            <th>型号/Model</th>
                            <th>设备编号</th>
                            <th>校准有效期至</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(homeForm.TestEquipment || homeForm.testEquipment || []).map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(item.Name || item.name || '')}</td>
                                <td>${escapeHtml(item.Model || item.model || '')}</td>
                                <td>${escapeHtml(item.Code || item.code || '')}</td>
                                <td>${escapeHtml(item.CalibrationDate || item.calibrationdate || '')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `

    // 检测项目内容
    let projectsHtml = ''
    validProjects.forEach((project, index) => {
        const config = project.schemeConfig
        const rd = project.reportData || {}
        const projectId = `proj_${index}`
        const minusId = `minus_${index}`
        const plusId = `plus_${index}`
        const valId = `val_${index}`

        projectsHtml += `
            <div class="ctrl-box">
                项目起始位置调整(mm)：
                <button id="${minusId}" class="ctrl-btn">-</button>
                <input type="number" id="${valId}" class="val-input" value="10" min="-297" max="297" step="10">
                <span class="unit">mm</span>
                <button id="${plusId}" class="ctrl-btn">+</button>
                <span class="offset-hint">正数=向下偏移，负数=向上偏移（可跨页）</span>
            </div>
            <div class="print-project" id="${projectId}" style="margin-top:10mm; --offset: 10mm;">
                <h3>5.${index + 1} ${escapeHtml(config.ProjectTitle || project.techSpecName || '检测项目')}${config.ProjectEnTitle ? ` / ${escapeHtml(config.ProjectEnTitle)}` : ''}</h3>
                <div>检测依据：${escapeHtml(rd.testReference || '')}</div>
                ${renderParamItems(config.ParamItems, rd.paramValues)}
                ${renderMainTable(config, rd.tableData)}
                ${renderPhotoRows(rd.photoRows)}
            </div>
        `
    })

    // 第一页：纯首页（标题+委托信息+声明）
    const homeHtml = `
        <div class="print-home">
            <h1>检测报告</h1>
            <h2>TEST REPORT</h2>

            <!-- 委托信息 -->
            <table class="info-table">
                <tr><th>委托单位名称 / Client</th><td>${escapeHtml(homeForm.ClientName || '')}</td></tr>
                <tr><th>委托单位地址 / Client Address</th><td>${escapeHtml(homeForm.ClientAddress || '')}</td></tr>
                <tr><th>收样日期 / Date of Receipt</th><td>${formatDate(homeForm.ReceiptDate)}</td></tr>
                <tr><th>报告日期 / Report Date</th><td>${formatDate(homeForm.ReportDate)}</td></tr>
            </table>

            <!-- 声明文字：第一页底部 -->
            <div class="disclaimer">${escapeHtml(disclaimerText).replace(/\n/g, '<br>')}</div>
        </div>
    `

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>打印预览</title>
        <style>
            * { box-sizing: border-box; margin:0; padding:0; }
            body {
                font-family: '宋体', SimSun;
                background:#fff;
                width: 210mm;
                max-width: 210mm;
                margin: 0 auto;
                position: relative;
                z-index: 1;
            }

            .page-divider {
                position:absolute;
                left:0; right:0;
                border:none;
                border-top:2px dashed #999;
                z-index:0;
            }
            .page-number {
                position:absolute;
                left:0; right:0;
                text-align:center;
                font-size:14px;
                color:#333;
                z-index:0;
            }

            /* 关键修改：预览模式下模拟A4高度，强制分页 */
            .print-home {
                width: 100%;
                padding: 8mm;
                height: 297mm; /* A4高度 */
                overflow: hidden; /* 超出部分隐藏 */
            }

            h1,h2 { text-align:center; margin:0 0 6px 0; }
            h1 { font-size:26pt; }
            h2 { font-size:22pt; }

            .section { margin: 10mm 0; }
            .section h3 { font-size:14pt; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
            .content-text { line-height: 1.4; padding: 3px 0; }

            .info-table {
                width:100%; border-collapse:collapse; margin:8px 0;
            }
            .info-table th,td { border:1px solid #000; padding:6px; text-align:left; vertical-align:top; font-size:10pt; }
            .info-table th { width:30%; background:#f5f5f5; }

            /* 控制栏 */
            .ctrl-box {
                width: calc(100% - 16mm);
                margin: 10px auto;
                background:#f8f8f8;
                padding:10px;
                border:1px solid #ccc;
                border-radius:4px;
                display:flex;
                align-items:center;
                gap:10px;
            }
            .ctrl-btn {
                width:36px; height:36px;
                border:1px solid #1890ff;
                background:#fff; color:#1890ff;
                border-radius:4px;
                cursor:pointer;
                font-size:18px;
            }
            .ctrl-btn:hover {
                background:#1890ff;
                color:#fff;
            }
            .val-input {
                width:100px; height:36px;
                text-align:center;
                border:1px solid #ccc;
                border-radius:4px;
                font-size:16px;
            }
            .unit { font-size:16px; font-weight:bold; }
            .offset-hint { font-size:12px; color:#666; margin-left:10px; }

            .print-project {
                width: 100%;
                padding: 0 8mm;
                margin:0 auto;
                margin-top: var(--offset, 10mm) !important;
                page-break-inside:avoid;
            }
            .print-project h3 {
                background:#e6e6e6;
                padding:8px; margin:10px 0;
                font-size:16pt;
            }

            .data-table {
                width:100%; border-collapse:collapse; margin:8px 0; font-size:10pt;
                table-layout: fixed;
            }
            .data-table th,td {
                border:1px solid #aaa; padding:5px 4px; text-align:center; vertical-align:middle;
                word-break: break-word;
            }
            .data-table th { background:#e6e6e6; font-weight:bold; }
            .photo-row { display:flex; gap:20px; margin:15px 0; }
            .photo-item { flex:1; text-align:center; }
            .photo-item img { max-width:100%; max-height:200px; border:1px solid #ccc; }

            .disclaimer { font-size:8pt; line-height:1.4; margin-top:10mm; text-align:justify; }

            /* 关键修改：打印模式下恢复并强制分页 */
            @media print {
                .print-home {
                    height: auto !important; /* 恢复自动高度 */
                    page-break-after: always !important; /* 强制分页 */
                    overflow: visible !important;
                }
                .page-divider,.page-number,.ctrl-box,.action-buttons { display:none !important; }
                .print-project { margin-top: var(--offset) !important; }
                @page { size:A4; margin:0; }
                body { width:210mm; max-width:210mm; margin:0; padding:0 !important; }
            }

            .action-buttons {
                position:fixed; bottom:20px; right:20px; z-index:10000;
                background:#fff; border:1px solid #1890ff; border-radius:8px; padding:8px 12px;
            }
            .action-buttons button {
                margin-left:8px; padding:6px 12px; border:none; border-radius:4px; background:#1890ff; color:#fff; cursor:pointer;
            }
            .action-buttons button:last-child { background:#f5222d; }
        </style>
    </head>
    <body>
        ${pageMarkers}
        <!-- 第1页：报告首页（独占一页） -->
        ${homeHtml}

        <!-- 第2页开始：报告正文 + 检测项目 -->
        ${reportBodyHtml}
        ${projectsHtml}

        <div class="action-buttons">
            <button id="printBtn">确认打印</button>
            <button id="closeBtn">关闭预览</button>
        </div>
        <script>
            const MIN_OFFSET = -297;
            const MAX_OFFSET = 297;
            const STEP_MM = 10;

            function bindControls() {
                const btns = document.querySelectorAll('.ctrl-btn');
                const inputs = document.querySelectorAll('.val-input');

                btns.forEach(btn => {
                    btn.onclick = function() {
                        const index = this.id.split('_')[1];
                        const input = document.getElementById('val_' + index);
                        const project = document.getElementById('proj_' + index);
                        let val = parseInt(input.value) || 0;

                        if (this.textContent === '+') {
                            val = Math.min(val + STEP_MM, MAX_OFFSET);
                        } else {
                            val = Math.max(val - STEP_MM, MIN_OFFSET);
                        }

                        input.value = val;
                        project.style.marginTop = val + 'mm';
                        project.style.setProperty('--offset', val + 'mm');
                    };
                });

                inputs.forEach(input => {
                    input.onchange = function() {
                        const index = this.id.split('_')[1];
                        const project = document.getElementById('proj_' + index);
                        let val = parseInt(this.value) || 0;
                        val = Math.max(MIN_OFFSET, Math.min(val, MAX_OFFSET));
                        val = Math.round(val / STEP_MM) * STEP_MM;
                        this.value = val;
                        project.style.marginTop = val + 'mm';
                        project.style.setProperty('--offset', val + 'mm');
                    };
                });
            }

            document.getElementById('printBtn').onclick = () => window.print();
// 预览页关闭按钮逻辑（发送消息给父页面关闭）
document.getElementById('closeBtn').onclick = () => {
  window.parent.postMessage('closePrintPreview', '*')
}

            window.onload = () => {
                bindControls();
                const firstProject = document.querySelector('.print-project');
                if (firstProject) {
                    firstProject.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
        </script>
    </body>
    </html>`
}