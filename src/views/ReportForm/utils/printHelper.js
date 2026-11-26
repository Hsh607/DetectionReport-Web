/* eslint-disable */
// 转义 HTML 特殊字符
export function escapeHtml(str) {
    if (!str) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        //.replace(/[\u0027\u2019]/g, '&#39;')
}

/**
 * 把一段文本按中英文拆开，英文/数字包 en-num-font（Arial），中文走外层（宋体）
 */
function formatMixedText(str) {
    if (!str) return ''

    // 1. 安全转义
    let html = escapeHtml(str)

    // 2. 保底处理：如果数据里还有那个生僻字符，强行变成 <sup>C</sup> 和 <sup>c</sup>
    html = html.replace(/ꟲ/g, '<sup>C</sup>')
        .replace(/ᶜ/g, '<sup>c</sup>')

    // 3. 还原历史存在的白名单标签
    html = html.replace(/&lt;sup&gt;/gi, '<sup>')
        .replace(/&lt;\/sup&gt;/gi, '</sup>')
        .replace(/&lt;sub&gt;/gi, '<sub>')
        .replace(/&lt;\/sub&gt;/gi, '</sub>')

    // 4. 安全套用 Arial 字体
    const parts = html.split(/(<[^>]+>)/g);
    for (let i = 0; i < parts.length; i++) {
        if (!parts[i].startsWith('<')) {
            parts[i] = parts[i].replace(/([A-Za-z0-9%.,;:()\-+/*=<>!&|^~`'"\[\]{}\\/]+)/g,
                '<span class="en-num-font">$1</span>')
                .replace(/\n/g, '<br>');
        }
    }
    return parts.join('');
}

/**
 * 估算字符串的"视觉宽度"
 */
function calcTextWidth(str) {
    if (!str) return 0
    const s = String(str)
    let width = 0
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i)
        if (code >= 0x4e00 && code <= 0x9fa5) {
            width += 2          // 中文
        } else if (code >= 0x30 && code <= 0x39) {
            width += 0.6        // 数字
        } else {
            width += 0.6        // 字母/符号
        }
    }
    return width
}

function calcColumnWidths(columns, tableData, minPercent = 6) {
    if (!columns || columns.length === 0) return []

    // 1. 权重（按内容）
    const weights = columns.map(col => {
        const titleW = Math.max(calcTextWidth(col.label), calcTextWidth(col.enLabel))
        let dataW = 0
        if (col.key && Array.isArray(tableData)) {
            tableData.forEach(row => {
                if (!row) return
                const w = calcTextWidth(row[col.key])
                if (w > dataW) dataW = w
            })
        }
        return Math.max(titleW, dataW, 6) + 2
    })

    // 2. 归一化到 100%
    const total = weights.reduce((a, b) => a + b, 0)
    let widths = weights.map(w => (w / total) * 100)

    const PER_ZH_CHAR = 2.2
    const TITLE_PADDING = 3
    const minWidths = columns.map(col => {
        const label = col.label || ''
        const zhCount = (label.match(/[\u4e00-\u9fa5]/g) || []).length
        // 标题有中文 → 至少放下中文；没中文 → 用 minPercent
        return zhCount > 0 ? zhCount * PER_ZH_CHAR + TITLE_PADDING : minPercent
    })


    for (let i = 0; i < widths.length; i++) {
        if (widths[i] < minWidths[i]) {
            widths[i] = minWidths[i]
        }
    }

    let sum = widths.reduce((a, b) => a + b, 0)
    if (sum > 100) {
        let extraNeeded = sum - 100
        
        const candidates = widths.map((w, i) => ({
            idx: i,
            slack: w - minWidths[i]
        })).filter(c => c.slack > 0).sort((a, b) => b.slack - a.slack)

        for (const c of candidates) {
            if (extraNeeded <= 0) break
            const take = Math.min(c.slack, extraNeeded)
            widths[c.idx] -= take
            extraNeeded -= take
        }

        sum = widths.reduce((a, b) => a + b, 0)
        if (sum > 100) {
            widths = widths.map(w => (w * 100) / sum)
        }
    } else if (sum < 100) {
        
        const remaining = 100 - sum
        const candidates = widths.map((w, i) => ({
            idx: i,
            slack: w - minWidths[i]
        })).filter(c => c.slack > 0).sort((a, b) => b.slack - a.slack)

        const totalSlack = candidates.reduce((a, c) => a + c.slack, 0)
        if (totalSlack > 0) {
            for (const c of candidates) {
                widths[c.idx] += remaining * (c.slack / totalSlack)
            }
        } else {
            widths = widths.map(w => (w * 100) / sum)
        }
    }

    return widths
}

function buildColgroup(widths) {
    if (!widths || widths.length === 0) return ''
    let html = '<colgroup>'
    widths.forEach(w => {
        html += `<col style="width:${w.toFixed(2)}%;">`
    })
    html += '</colgroup>'
    return html
}

// ==================== 维氏渲染工具 ====================

function isSampleNoCol(col) {
    const l = (col.label || '').trim();
    const f = (col.yunbiaoField || '').trim();
    return l.includes('试样编号') || l.includes('Sample No') || f === '试样编号';
}

function isPositionCol(col) {
    const l = (col.label || '').trim();
    const f = (col.yunbiaoField || '').trim();
    return l.includes('检测位置') || l.includes('Position') || f === '检测位置';
}

function isVickersDynamicRow(config) {
    return config.ExtendColumns?.some(c => c.isDynamicRow === true);
}

function chunkSubColumns(subColumns, size = 4) {
    const list = subColumns || [];
    const chunks = [];
    for (let i = 0; i < list.length; i += size) {
        const c = list.slice(i, i + size);
        while (c.length < size) c.push(null);
        chunks.push(c);
    }
    return chunks;
}

function getVickersResultColumns(group) {
    if (group.subColumns?.length > 0) return group.subColumns;
    let tableData = group.tableData || [];
    if (typeof tableData === 'string') {
        try { tableData = JSON.parse(tableData); } catch { tableData = []; }
    }
    if (!Array.isArray(tableData) || tableData.length === 0) return [];
    const keys = new Set();
    tableData.forEach(row => {
        if (!row || typeof row !== 'object') return;
        Object.keys(row).forEach(k => {
            if (!/^结果\d+$/.test(k)) return;
            const v = row[k];
            if (v !== null && v !== undefined && v !== '') keys.add(k);
        });
    });
    if (keys.size === 0) return [];
    return [...keys]
        .sort((a, b) => parseInt(a.replace('结果', ''), 10) - parseInt(b.replace('结果', ''), 10))
        .map(k => ({ id: k, label: k.replace('结果', '') }));
}

/** 维氏表格渲染主入口 */
function renderVickersTable(config, group, reportData) {
    const isDynamicRow = isVickersDynamicRow(config);
    const enableConversion = group.enableConversion === true;
    const multiplier = enableConversion ? 2 : 1;

    if (isDynamicRow) {
        return renderVickersDynamicRow(config, group, reportData, multiplier);
    }
    return renderVickersNormal(config, group, reportData, multiplier);
}

/** 动态列 / 固定列 */
function renderVickersNormal(config, group, reportData, multiplier) {
    const baseCols = config.BaseColumns || [];
    const extendCols = config.ExtendColumns || [];
    const tableData = group.tableData || [];

    // 表头第一行
    let thead = '<tr>';
    baseCols.forEach(col => {
        thead += `<th rowspan="2" class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`;
    });
    extendCols.forEach(col => {
        if (col.subColumns?.length > 0) {
            thead += `<th colspan="${col.subColumns.length}" class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`;
        } else {
            thead += `<th rowspan="2" class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`;
        }
    });
    thead += '</tr>';

    // 第二行表头（子列）
    const hasSub = extendCols.some(c => c.subColumns?.length > 0);
    let thead2 = '';
    if (hasSub) {
        thead2 = '<tr>';
        extendCols.forEach(col => {
            if (col.subColumns?.length > 0) {
                col.subColumns.forEach(sub => {
                    // ⭐ 和 renderMainTable 一致：中英分两行
                    if (sub.label && sub.enLabel && sub.label !== sub.enLabel) {
                        thead2 += `<th class="content-table-font">${escapeHtml(sub.label)}<br><small class="en-num-font">${escapeHtml(sub.enLabel)}</small></th>`;
                    } else {
                        thead2 += `<th class="content-table-font">${escapeHtml(sub.label || sub.enLabel || '')}</th>`;
                    }
                });
            }
        });
        thead2 += '</tr>';
    }

    // 数据体
    let tbody = '';
    tableData.forEach(row => {
        // ========== 数据行 ==========
        tbody += '<tr>';
        baseCols.forEach(col => {
            if (isSampleNoCol(col)) {
                tbody += `<td rowspan="${multiplier}" class="content-table-font" style="text-align:center;vertical-align:middle;font-weight:500;"><span class="en-num-font">${escapeHtml(row[col.id] ?? '')}</span></td>`;
            } else {
                
                tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row[col.id] ?? '')}</span></td>`;
            }
        });
        extendCols.forEach(col => {
            if (col.subColumns?.length > 0) {
                col.subColumns.forEach(sub => {
                    tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row[sub.id] ?? '')}</span></td>`;
                });
            } else {
                tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row[col.id] ?? '')}</span></td>`;
            }
        });
        tbody += '</tr>';

        // ========== 转换行 ==========
        if (multiplier === 2) {
            tbody += '<tr>';
            baseCols.forEach(col => {
                if (isSampleNoCol(col)) {
                    
                } else if (isPositionCol(col)) {
                   
                    tbody += `<td class="content-table-font" style="text-align:center;vertical-align:middle;">转换值<span class="en-num-font">(HRC)</span><br><small class="en-num-font">Conversion value</small></td>`;
                } else {
                    tbody += `<td class="content-table-font"></td>`;
                }
            });
            extendCols.forEach(col => {
                if (col.subColumns?.length > 0) {
                    col.subColumns.forEach(sub => {
                        tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row['conv_' + sub.id] ?? '')}</span></td>`;
                    });
                } else {
                    tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row['conv_' + col.id] ?? '')}</span></td>`;
                }
            });
            tbody += '</tr>';
        }
    });

    // Footer
    //tbody += renderFooterColumns(config, reportData);
    // Footer（维氏普通列：所有 footer 行合并成一格）
    // Footer（维氏普通列：所有 footer 行合并成一格）
    const totalExtendCols = extendCols.reduce((sum, col) => sum + (col.subColumns?.length || 1), 0);
    (config.FooterColumns || []).forEach(footRow => {
        const label = escapeHtml(footRow.label) + (footRow.enLabel ? ` <span class="en-num-font">/ ${escapeHtml(footRow.enLabel)}</span>` : '');
        let content = '';
        if (footRow.label.includes('技术要求')) {
            content = formatMixedText(reportData._vickersTechRequirement || '');      
        } else if (footRow.label.includes('结论')) {
            content = formatMixedText(reportData.conclusion || '');                 
        } else if (footRow.label.includes('备注')) {
            content = formatMixedText(reportData.note || '');                        
        } else {
            content = formatMixedText(reportData[footRow.field] || '');              
        }
        tbody += `<tr style="background:#f9f9f9;">
        <td colspan="${baseCols.length}" class="content-table-font" style="text-align:left;padding:8px 12px;font-weight:500;border:1px solid #000;">${label}</td>
        <td colspan="${totalExtendCols}" class="content-table-font" style="padding:8px 12px;border:1px solid #000;">${content}</td>
    </tr>`;
    });

    // ⭐ 拍平所有列
    const allCols = []
    baseCols.forEach(col => {
        allCols.push({ label: col.label, enLabel: col.enLabel, key: col.id })
    })
    extendCols.forEach(col => {
        if (col.subColumns?.length > 0) {
            col.subColumns.forEach(sub => {
                allCols.push({ label: sub.label, enLabel: sub.enLabel, key: sub.id })
            })
        } else {
            allCols.push({ label: col.label, enLabel: col.enLabel, key: col.id })
        }
    })

    const widths = calcColumnWidths(allCols, tableData, 6)
    const colgroup = buildColgroup(widths)

    return `<table class="data-table content-table-font" style="width:100%;border-collapse:collapse;text-align:center;table-layout:fixed;">
    ${colgroup}
    <thead>${thead}${thead2}</thead>
    <tbody>${tbody}</tbody>
</table>`;
}

/** 动态行 */
function renderVickersDynamicRow(config, group, reportData, multiplier) {
    const baseCols = config.BaseColumns || [];
    const tableData = group.tableData || [];
    const resultCols = getVickersResultColumns(group);
    const chunks = chunkSubColumns(resultCols, 4);
    const chunkCount = chunks.length;
    const totalRowSpan = Math.max(1, tableData.length) * chunkCount * multiplier;

    // 加 colgroup，让浏览器知道实际列数
    const baseWidth = 10;
    const resultWidth = Math.max((100 - baseCols.length * baseWidth) / 8, 3);
    let colgroup = '<colgroup>';
    baseCols.forEach(() => {
        colgroup += `<col style="width:${baseWidth}%;">`;
    });
    for (let i = 0; i <  8; i++) {
        colgroup += `<col style="width:${resultWidth}%;">`;
    }
    colgroup += '</colgroup>';
    // 表头
    let thead = '<tr>';
    baseCols.forEach(col => {
        thead += `<th rowspan="2" class="content-table-font">${escapeHtml(col.label)}<br><small class="en-num-font">${escapeHtml(col.enLabel || '')}</small></th>`;
    });
    thead += `<th colspan="8" class="content-table-font">检测结果<br><small class="en-num-font">Test Results</small></th>`;
    thead += '</tr>';

    // 数据体
    let tbody = '';
    tableData.forEach((row, rowIndex) => {
        chunks.forEach((chunk, cIdx) => {
            tbody += '<tr>';
            baseCols.forEach(col => {
                if (isSampleNoCol(col)) {
                    if (rowIndex === 0 && cIdx === 0) {
                        tbody += `<td rowspan="${totalRowSpan}" style="text-align:center;vertical-align:middle;font-weight:500;"><span class="en-num-font">${escapeHtml(row[col.id] ?? '')}</span></td>`;
                    }
                } else {
                    tbody += `<td style="text-align:center;vertical-align:middle;"><span class="en-num-font">${escapeHtml(row[col.id] ?? '')}</span></td>`;
                }
            });
            chunk.forEach(sc => {
                if (sc) {
                    tbody += `<td rowspan="${multiplier}" class="content-table-font" style="text-align:right;"><span class="en-num-font">${escapeHtml(sc.label)}</span></td>`;
                    tbody += `<td><span class="en-num-font">${escapeHtml(row[sc.id] ?? '')}</span></td>`;
                } else {
                    tbody += `<td rowspan="${multiplier}" style="background:#fafafa;"></td><td style="background:#fafafa;"></td>`;
                }
            });
            tbody += '</tr>';

            if (multiplier === 2) {
                tbody += '<tr>';
                baseCols.forEach(col => {
                    if (isSampleNoCol(col)) {
                        // 跳过（rowspan 覆盖）
                    } else if (isPositionCol(col)) {
                        // 与 renderVickersNormal 完全一致
                        tbody += `<td class="content-table-font" style="text-align:center;vertical-align:middle;">转换值<span class="en-num-font">(HRC)</span><br><small class="en-num-font">Conversion value</small></td>`;
                    } else {
                        tbody += `<td class="content-table-font"></td>`;
                    }
                });
                chunk.forEach(sc => {
                    if (sc) {
                        tbody += `<td class="content-table-font"><span class="en-num-font">${escapeHtml(row['conv_' + sc.id] ?? '')}</span></td>`;
                    } else {
                        tbody += `<td style="background:#fafafa;"></td>`;
                    }
                });
                tbody += '</tr>';
            }
        });
    });

    // Footer
    let foot = '';
    (config.FooterColumns || []).forEach(footRow => {
        const label = escapeHtml(footRow.label) + (footRow.enLabel ? ` <span class="en-num-font">/ ${escapeHtml(footRow.enLabel)}</span>` : '');
        let content = '';
        if (footRow.label.includes('技术要求')) {
            content = formatMixedText(group.techRequirement || '');
        } else if (footRow.label.includes('结论')) {
            content = formatMixedText(group.conclusion || '');
        } else if (footRow.label.includes('备注')) {
            content = formatMixedText(group.note || '');
        } else {
            content = formatMixedText(group[footRow.field] || '');
        }
        foot += `<tr style="background:#f9f9f9;">
    <td colspan="${baseCols.length}" class="content-table-font" style="...">${label}</td>
    <td colspan="8" class="content-table-font" style="...">${content}</td>
</tr>`;
    });

    return `<table class="data-table content-table-font" style="width:100%;border-collapse:collapse;text-align:center;table-layout:fixed;">
    ${colgroup}
    <thead>${thead}</thead>
    <tbody>${tbody}${foot}</tbody>
</table>`;
}


export function splitTextName(name) {
    if (!name) return { zh: '', en: '' }
    const text = name.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')
    const zhPattern = /^([\u4e00-\u9fa5\s、，.()]+)/
    const zhMatch = text.match(zhPattern)
    if (zhMatch) {
        const zhPart = zhMatch[1].trim()
        const enPart = text.slice(zhMatch[0].length).trim()
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
            <span class="en-num-font">${escapeHtml(String(val))}</span>
      </td>
    `
    }
    html += '</tr></tbody></table>'
    return html
}


// 渲染主表格（支持行合并，仅针对 rowSpanColumns）
export function renderMainTable(config, tableData, reportData, bottomHtml = '') {
    if (!tableData || tableData.length === 0) return '<div class="content-table-font">无数据</div>'
    const baseCols = config.BaseColumns || []
    const extendCols = config.ExtendColumns || []
    // 只有子列有非空标签时才显示第二行表头
    const hasSubColumns = extendCols.some(col => {
        if (!col.subColumns || col.subColumns.length === 0) return false;
        return col.subColumns.some(sub => (sub.label && sub.label.trim()) || (sub.enLabel && sub.enLabel.trim()));
    });

    // ========== 判断是否为铁素体（用于列合并） ==========
    const projectTitle = (config.ProjectTitle || '').toLowerCase()
    const isFerrite = projectTitle.includes('铁素体')

    // 铁素体合并字段（使用 yunbiaoField）
    const MERGE_TARGETS = isFerrite ? [
        '试样编号', '检测位置', 'PP', 's', 's_95CI', 'Vv', 'RA'
    ] : [];

    const mergeColumnIds = [];
    baseCols.forEach(col => {
        const field = col.yunbiaoField || col.label || '';
        if (MERGE_TARGETS.includes(field)) {
            mergeColumnIds.push(col.id);
        }
    });
    extendCols.forEach(col => {
        // 处理没有 subColumns 的独立列
        if (!col.subColumns || col.subColumns.length === 0) {
            const field = col.yunbiaoField || col.label || '';
            if (MERGE_TARGETS.includes(field)) {
                mergeColumnIds.push(col.id);
            }
        } else {
            // 有 subColumns 的处理
            col.subColumns.forEach(sub => {
                const field = sub.yunbiaoField || sub.label || '';
                if (MERGE_TARGETS.includes(field)) {
                    mergeColumnIds.push(sub.id);
                }
            });
        }
    });


    // 列合并规则（铁素体）
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
                        
                        displayText = `${escapeHtml(sub.label)}<br><small class="en-num-font">${escapeHtml(sub.enLabel)}</small>`;
                    } else {
                        
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
                rowHtml += `<td rowspan="${rowspan}" class="content-table-font"><span class="en-num-font">${escapeHtml(row[colId] ?? '')}</span></td>`;
            } else {
                // 普通渲染（但需考虑冲击列合并）
                const key = `${rowIndex}_${colId}`;
                const rowspan = mergeRules[key];
                if (rowspan === 0) continue;
                const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                rowHtml += `<td ${rowspanAttr} class="content-table-font"><span class="en-num-font">${escapeHtml(row[colId] ?? '')}</span></td>`;
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
                        rowHtml += `<td rowspan="${rowspan}" class="content-table-font"><span class="en-num-font">${escapeHtml(row[subId] ?? '')}</span></td>`;
                    } else {
                        const key = `${rowIndex}_${subId}`;
                        const rowspan = mergeRules[key];
                        if (rowspan === 0) continue;
                        const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                        rowHtml += `<td ${rowspanAttr} class="content-table-font"><span class="en-num-font">${escapeHtml(row[subId] ?? '')}</span></td>`;
                    }
                }
            } else {
                const colId = col.id;
                if (rowSpanCols.includes(colId)) {
                    const rowspan = rowMergeRules[`${rowIndex}_${colId}`];
                    if (rowspan === 0) continue;
                    rowHtml += `<td rowspan="${rowspan}" class="content-table-font"><span class="en-num-font">${escapeHtml(row[colId] ?? '')}</span></td>`;
                } else {
                    const key = `${rowIndex}_${colId}`;
                    const rowspan = mergeRules[key];
                    if (rowspan === 0) continue;
                    const rowspanAttr = rowspan ? `rowspan="${rowspan}"` : '';
                    rowHtml += `<td ${rowspanAttr} class="content-table-font"><span class="en-num-font">${escapeHtml(row[colId] ?? '')}</span></td>`;
                }
            }
        }
        rowHtml += '</tr>';
        tbody += rowHtml;
    }

    // 先渲染底部列组（可能为空字符串）
    tbody += bottomHtml
    // 再渲染 FooterColumns（备注/结论/技术要求）
    tbody += renderFooterColumns(config, reportData)

    // ⭐ 拍平所有列（含子列），并记录每列对应的数据 key
    const allCols = []
    baseCols.forEach(col => {
        allCols.push({ label: col.label, enLabel: col.enLabel, key: col.id })
    })
    extendCols.forEach(col => {
        if (col.subColumns?.length > 0) {
            col.subColumns.forEach(sub => {
                allCols.push({ label: sub.label, enLabel: sub.enLabel, key: sub.id })
            })
        } else {
            allCols.push({ label: col.label, enLabel: col.enLabel, key: col.id })
        }
    })

    // ⭐ 按每列实际内容算宽度
    let widths = calcColumnWidths(allCols, tableData, 6)

    const colgroup = buildColgroup(widths)

    // ⭐ 铁素体单独紧凑样式
    const compactClass = isFerrite ? 'ferrite-compact' : ''

    return `<table class="data-table content-table-font ${compactClass}" style="width:100%;table-layout:fixed;">
    ${colgroup}
    <thead>${theadRow1}${theadRow2}</thead>
    <tbody>${tbody}</tbody>
</table>`
}

// 渲染照片：固定标题 + 每个项目独立判断模板配置
export function renderPhotoRows(photoRows, config) {
    const photoConfig = config?.PhotoConfig;
    if (!photoConfig || !photoConfig.enabled) {
        return '';
    }

    // 新增：没数据 / 没实际照片 不渲染（避免空标题）
    if (!Array.isArray(photoRows) || photoRows.length === 0) return ''
    const hasAnyPhoto = photoRows.some(r =>
        r && (r.LeftUrl || r.RightUrl || r.LeftDataURL || r.RightDataURL)
    )
    if (!hasAnyPhoto) return ''

    const API_BASE = process.env.VUE_APP_BASE_URL

    const convertUrl = (url) => {
        if (!url) return ''
        if (url.includes('/api/upload/image/')) {
            return url.replace('/api/upload/image/', '/uploads/')
        }
        return url
    }

    let html = '<div class="photo-title title-num-font">试验照片 <span class="en-num-font">/ Test Photos</span></div>'

    for (const row of photoRows) {
        const marginTop = row.marginTop ?? 2.65
        html += `<div class="photo-row" style="margin-top:${marginTop}mm;">`
        // Left 照片（完整闭合）
        if (row.LeftUrl || row.LeftDataURL) {
            let originalUrl = row.LeftDataURL || row.LeftUrl
            let convertedUrl = convertUrl(originalUrl)
            const url = convertedUrl.startsWith('http') ? convertedUrl : `${API_BASE}${convertedUrl}`
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:360px;border:1px solid #ccc;"><div class="content-table-font"><span class="en-num-font">${escapeHtml(row.LeftDesc || '')}</span></div></div>`
        }

        //  Right 照片（完整闭合）
        if (row.RightUrl || row.RightDataURL) {
            let originalUrl = row.RightDataURL || row.RightUrl
            let convertedUrl = convertUrl(originalUrl)
            const url = convertedUrl.startsWith('http') ? convertedUrl : `${API_BASE}${convertedUrl}`
            html += `<div class="photo-item"><img src="${url}" style="max-width:100%;max-height:360px;border:1px solid #ccc;"><div class="content-table-font"><span class="en-num-font">${escapeHtml(row.RightDesc || '')}</span></div></div>`
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
            return `<td><span class="en-num-font">${escapeHtml(value)}</span></td>`;
        }).join('');
    }).join('');

    return `
        <tr>
            <td colspan="${totalCols}" style="padding: 0 !important; border: none !important;">
                <table class="data-table content-table-font" style="width: 100%; margin: 0 !important; table-layout: fixed;">
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

    const projectTitle = config.ProjectTitle || ''
    const isFerrite = projectTitle.includes('铁素体')
    const isCorrosion = projectTitle.includes('点腐蚀') || projectTitle.includes('晶间腐蚀')
    const isBend = projectTitle.includes('弯曲')

    // 左侧列数：只有弯曲缩成 2 列，其他项目保持占满基础列
    const leftCols = isBend ? Math.min(2, totalBaseCols) : totalBaseCols
    const rightCols = totalBaseCols + totalExtendCols - leftCols

    let html = ''
    for (const footRow of footerColumns) {
        // 左侧标签：英文部分加 en-num-font
        let labelHtml = escapeHtml(footRow.label)
        if (footRow.enLabel) {
            labelHtml += ` <span class="en-num-font">/ ${escapeHtml(footRow.enLabel)}</span>`
        }

        html += `
    <tr style="background: #f9f9f9;">
      <td colspan="${leftCols}" style="text-align: left; padding: 8px 12px; font-weight: 500; border: 1px solid #000;">
        ${labelHtml}
      </td>
    `

        if (footRow.label.includes('技术要求')) {

            // 铁素体 / 点腐蚀 / 晶间腐蚀：合并成一格
            if (isFerrite || isCorrosion || isBend) {
                let val = ''
                if (isCorrosion || isBend) {
                    if (typeof reportData.techRequirement === 'string') {
                        // 字符串直接拿
                        val = reportData.techRequirement
                    } else if (reportData.techRequirement && typeof reportData.techRequirement === 'object') {
                        // 如果是对象（如接口返回的格式），尝试取第一个扩展列的 ID 对应的值
                        for (const col of config.ExtendColumns || []) {
                            if (col.subColumns?.length > 0) { val = reportData.techRequirement?.[col.subColumns[0].id] || ''; break }
                            else { val = reportData.techRequirement?.[col.id] || ''; break }
                        }
                        // 如果还没取到，兜底取对象里面的第一个值
                        if (!val && Object.keys(reportData.techRequirement).length > 0) {
                            val = Object.values(reportData.techRequirement)[0]
                        }
                    }
                } else {
                    // 铁素体原逻辑：取第一个子列
                    for (const col of config.ExtendColumns || []) {
                        if (col.subColumns?.length > 0) { val = reportData.techRequirement?.[col.subColumns[0].id] || ''; break }
                        else { val = reportData.techRequirement?.[col.id] || ''; break }
                    }
                }
                // 弯曲用 rightCols（补满），其他合并项目仍用 totalExtendCols
                const span = isBend ? rightCols : totalExtendCols
                html += `<td colspan="${span}" class="content-table-font" style="text-align:center;padding:8px 12px;border:1px solid #000;">${formatMixedText(val)}</td>`
            } else {
                // 其他项目：按扩展列展开
                config.ExtendColumns?.forEach(col => {
                    if (col.subColumns?.length > 0) {
                        col.subColumns.forEach(sub => {
                            const val = reportData.techRequirement?.[sub.id] || ''
                            html += `<td class="content-table-font" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${formatMixedText(val)}</td>`
                        })
                    } else {
                        const val = reportData.techRequirement?.[col.id] || ''
                        html += `<td class="content-table-font" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${formatMixedText(val)}</td>`
                    }
                })
            }
        } else if (footRow.label.includes('结论')) {
            const val = reportData.conclusion || ''
           
            html += `<td colspan="${rightCols}" class="content-table-font" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${formatMixedText(val)}</td>`
        } else if (footRow.label.includes('备注')) {
            const val = reportData.note || ''
            
            html += `<td colspan="${rightCols}" class="content-table-font" style="padding: 8px 12px; border: 1px solid #000; text-align: left; white-space: pre-wrap; word-wrap: break-word;">${formatMixedText(val)}</td>`
        } else {
            const field = footRow.yunbiaoField || footRow.field || footRow.id || ''
            const val = reportData[field] || ''
            
            html += `<td colspan="${rightCols}" class="content-table-font" style="text-align: center; padding: 8px 12px; border: 1px solid #000;">${formatMixedText(val)}</td>`
        }
        html += '</tr>'
    }
    return html
}


// 渲染审批签名（预览/导出用）
function renderSignatures(signatureItems) {
    if (!signatureItems || signatureItems.length === 0) return '';

    //  过滤掉"姓名和签名图都为空"的项
    const validItems = signatureItems.filter(sig =>
        (sig.name && String(sig.name).trim()) ||
        (sig.signatureUrl && String(sig.signatureUrl).trim())
    );

    if (validItems.length === 0) return '';


    let html = `
        <div style="margin: 20px 0 10px 0; padding: 5px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 30px; flex-wrap: wrap;">
    `;

    for (const sig of signatureItems) {
        const imgHtml = sig.signatureUrl
            ? `<img src="${sig.signatureUrl}" style="height: 36px; max-width: 100px; object-fit: contain; background: #fff;" />`
            : `<span style="color: #ccc; font-size: 12px;"></span>`;

        html += `
    <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 150px;">
                <div style="display: flex; flex-direction: column; line-height: 1.3; min-width: 60px; text-align: justify; text-align-last: justify;">
            <span class="signature-role" style="font-size: 14px; color: #333;">${sig.role}</span>
            <span class="signature-label en-num-font">${sig.enLabel || ''}</span>
        </div>
        ${imgHtml}
    </div>
`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}





export function generatePrintHTML(homeForm, fixedForm, testProjects, watermarkText = "NORMAL TESTING TECHNOLOGY", isCNAS = false) {
    // 厂区代码  公司名称映射
    const companyMap = {
        'SZNM': { cn: '苏州诺码检测技术有限公司', en: 'Suzhou Normal Testing Technology Co., Ltd.' },
        'JANM': {
            cn: '苏州诺码检测技术有限公司吉安分公司',
            en: 'Normal Testing Technology Co., Ltd.(Ji\u0027an Branch)'  
        },
    };
    const defaultCompany = { cn: '苏州诺码检测技术有限公司', en: 'Suzhou Normal Testing Technology Co., Ltd.' };

    //  CNAS 报告统一用苏州公司信息；非 CNAS 报告才按 factoryCode 匹配
    const company = isCNAS
        ? defaultCompany
        : (companyMap[(homeForm.FactoryCode || '').toUpperCase()] || defaultCompany);

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

    @page {
        size: A4;
    /* margin: 1.3cm 1.5cm 1.5cm 1.5cm; */  /* 注释掉，由后端控制 */

    }

    body {
        background: #fff;
        margin: 0;
        padding: 0;
        font-family: '宋体', 'SimSun', serif;
    }

    img {
        height: auto !important;
        object-fit: contain !important;
    }

/* 默认：所有 content-block 不加 padding-top */
.content-block {
    page-break-inside: avoid !important;
    margin-bottom: 12px !important;
    margin-top: 0 !important;
    padding-top: 0;
}

/* 只有强制分页的区块才加 padding-top（给页眉留空间） */
.content-block.page-break {
    padding-top: 18mm !important;
}
    h3 {
        page-break-after: avoid !important;
        margin-bottom: 6px !important;
    }

    /* ===== 1. 主标题 ===== */
    h1 {
        font-family: '宋体', 'SimSun', serif;
        font-size: 28pt;
        font-weight: 700;
        text-align: center;
        margin: 15mm  0 4mm 0;
    }
    h2 {
        font-family: '宋体', 'SimSun', serif;
        font-size: 24pt;
        font-weight: 700;
        text-align: center;
        margin: 0 0 6mm 0;
    }

    /* ===== 2. 英文/数字通用 ===== */
    .en-num-font {
        font-family: 'Arial', 'Helvetica', sans-serif;
    }

    /* ===== 3. 带数字的标题（小四宋体加粗 / 英文Arial加粗） ===== */
    .title-num-font {
        font-family: '宋体', 'SimSun', serif;
        font-size: 12pt;
        font-weight: 700;
    }
    .title-num-font .en-num-font {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 12pt;
        font-weight: 700;
    }

    /* ===== 4. 表格内容（五号宋体 / 英文Arial） ===== */
    .content-table-font {
        font-family: '宋体', 'SimSun', serif;
        font-size: 10.5pt;
    }
    .content-table-font .en-num-font {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 10.5pt;
    }

        .content-table-font + .info-table {
        margin-top: 0 !important;
    }

.data-table, .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 !important;
}

.data-table th, .data-table td,
.info-table th, .info-table td {
    font-family: '宋体', 'SimSun', serif;
    font-size: 10.5pt;
    border: 1px solid #000;
    padding: 5px;
    vertical-align: middle;
        /* 删掉 word-break: keep-all */
    word-break: normal;              /* ⭐ 中文正常换行，英文在空格处换行 */
    overflow-wrap: break-word;       /* ⭐ 遇到超长单词（无空格），才断字 */
    word-wrap: break-word;           /* ⭐ 老浏览器兼容（IE/旧 Edge） */
    text-align: center;
}
    .data-table th, .info-table th {
        font-weight: 700;
        background: #e6e6e6;
    }
    .data-table th {
        background: #e6e6e6;
    }
    .data-table th .en-num-font,
    .data-table td .en-num-font,
    .info-table th .en-num-font,
    .info-table td .en-num-font {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 10.5pt;
    }

    /* ===== 5. 首页信息表（委托单位-报告日期：中文宋体/英文Arial 11号） ===== */
.info-table-home {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}
.info-table-home th {
    width: 28%;
    border: none !important;
    text-align: left;
    padding: 6px 0 !important;
    padding-left: 10px !important;
    vertical-align: middle !important;
    line-height: 1.6 !important;
    font-family: '宋体', 'SimSun', serif;
    font-size: 11pt;
    background: transparent !important;
}
.info-table-home td {
    width: 72%;
    border: none !important;
    border-bottom: 1px solid #000 !important;
    text-align: center !important;
    padding: 6px 0 !important;
    vertical-align: middle !important;
    line-height: 1.6 !important;
    font-family: '宋体', 'SimSun', serif;
    font-size: 11pt;
    min-width: 0;
}

    /* ===== 6. 免责声明（中文宋体小五 / 英文新罗马小五） ===== */
    .disclaimer {
        font-family: '宋体', 'SimSun', serif;
        font-size: 9pt;
        line-height: 1.7;
        margin: 6mm 0;
        text-align: justify;
    }
    .disclaimer-en {
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        line-height: 1.7;
        text-align: justify;
    }

    /* ===== 7. 公司名称（中文宋体三号加粗 / 英文宋体四号加粗） ===== */
    .company {
        text-align: center;
        margin: 25mm 0 5mm;
    }
    .company-cn {
        font-family: '宋体', 'SimSun', serif;
        font-size: 16pt;
        font-weight: 700;
    }
    .company-en {
        font-family: '宋体', 'SimSun', serif;
        font-size: 14pt;
        font-weight: 700;
        margin-top: 4px;
    }

    /* ===== 8. 页脚（中文宋体 / 英文Calibri 小五） ===== */
    .footer-zh {
        font-family: '宋体', 'SimSun', serif;
        font-size: 9pt;
    }
    .footer-en {
        font-family: 'Calibri', 'Arial', sans-serif;
        font-size: 9pt;
    }

    /* ===== 9. CNAS注释（中文六号宋体 / 英文六号Arial） ===== */
    .cnas-remark {
        font-size: 7.5pt;
        line-height: 1.5;
        margin-top: 6px;
    }
    .cnas-remark .cnas-zh {
        font-family: '宋体', 'SimSun', serif;
        font-size: 7.5pt;
    }
    .cnas-remark .cnas-en {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 7.5pt;
    }

    /* ===== 10. 签名 ===== */
    .signature-role {
        font-family: '宋体', 'SimSun', serif;
        font-weight: 700;
    }
.signature-label {
    font-family: 'Arial', 'Helvetica', sans-serif !important;
}

    /* ===== 11. 照片 ===== */
    .photo-row {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    .photo-item {
        flex: 1;
        min-width: 45%;
        text-align: center;
    }

    /* ===== 12. 其他 ===== */
    .spacer { height: var(--block-margin, 5mm); }
    .info-table th { background: #e6e6e6; }
    .data-table th { background: #e6e6e6; }

    /* ===== 13. 接下页/报告结束 ===== */
    .page-end {
        font-family: '宋体', 'SimSun', serif;
        font-size: 12pt;
    }
    .page-end .en-num-font {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 12pt;
    }

    /* ===== 铁素体紧凑行高（字号不变，只压缩间距）===== */
.data-table.ferrite-compact th,
.data-table.ferrite-compact td {
    padding: 3px 4px !important;       /* 原 5px → 3px */
    line-height: 1.25 !important;      /* 显式指定，避免浏览器默认 1.4~1.5 */
}

/* 表头也同步（如果表头两行也想省空间） */
.data-table.ferrite-compact thead th {
    padding: 2px 4px !important;
    line-height: 1.2 !important;
}

/* 单元格里的内联元素也压一下 */
.data-table.ferrite-compact br {
    line-height: 0 !important;
}



@media print {
    @page { size: A4; }

        table thead {
        display: table-row-group !important;
    }

    body {
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* 强制所有表格单元格（包括表头）背景为纯白 */
    .data-table th,
    .data-table td,
    .info-table th,
    .info-table td,
    .data-table th[style*="background"],
    .data-table td[style*="background"],
    .info-table th[style*="background"],
    .info-table td[style*="background"],
    .data-table tr[style*="background"],
    .info-table tr[style*="background"] {
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* 表头仅用加粗文字和底部边框区分（无灰色背景） */
    .data-table th,
    .info-table th {
        font-weight: 700 !important;
        border-bottom: 2px solid #000000 !important;
        border-top: 1px solid #000000 !important;
        border-left: 1px solid #000000 !important;
        border-right: 1px solid #000000 !important;
    }

    /* 所有表格边框黑色 */
    .data-table th,
    .data-table td,
    .info-table th,
    .info-table td {
        border-color: #000000 !important;
        border-width: 1px !important;
        border-style: solid !important;
    }

    /* 强制水印图片不透明度保留 */
    img[src*="svg"] {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
/* 所有输入框：英文/数字用 Arial，中文回退宋体 */
input, .el-input__inner, .el-textarea__inner,
.data-table td input, .data-table td .el-input__inner {
    font-family: 'Arial', '宋体', 'SimSun', sans-serif !important;
}



/* ===== 终极方案：强制所有 td/th 用 Arial ===== */
td, th {
    font-family: 'Arial', '宋体', 'SimSun', sans-serif !important;
}

/* ===== 强制 en-num-font 用 Arial（优先级更高） ===== */
.en-num-font,
.info-table-font td .en-num-font,
.data-table td .en-num-font {
    font-family: 'Arial', 'Helvetica', sans-serif !important;
}

/* 客户提供信息表格不要背景色 */
.info-table.info-table-font th {
    background: transparent !important;
}

    /*  强制覆盖表头 th 的内联背景色（解决列名偏绿） */
    .data-table th[style*="background"],
    .info-table th[style*="background"] {
        background: #e6e6e6 !important;
    }

</style>
</head>
<body>
<div style="
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 42px;
    color: rgba(0,0,0,0.04);
    opacity: 1;
    font-family: Arial, sans-serif;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    user-select: none;
">
    NORMAL TESTING TECHNOLOGY
</div>

  <!-- 首页 -->
  <div class="content-block" style="padding-top: 1mm;">
    <h1>检 测 报 告</h1>
    <h2>TEST REPORT</h2>
<table class="info-table-home">
<tr>
    <th>委托单位名称<br><span class="en-num-font">Client</span></th>
    <td><span class="en-num-font">${escapeHtml((homeForm.ClientName || '').split(/\r?\n/).filter(line => line.trim()).join('\n'))}</span></td>
</tr>
<tr>
    <th>委托单位地址<br><span class="en-num-font">Client Address</span></th>
    <td><span class="en-num-font">${escapeHtml((homeForm.ClientAddress || '').split(/\r?\n/).filter(line => line.trim()).join('\n'))}</span></td>
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
      <div class="company-cn">${escapeHtml(company.cn)}</div>
      <div class="company-en">${escapeHtml(company.en).replace(/&#39;/g, '<span style="font-family:Arial,Helvetica,sans-serif;">\'</span>')}</div>    </div>
  </div>

  <!-- 内页 -->
  <div class="content-block" style="page-break-before: always;">
    <div class="spacer" style="--block-margin:${margin.sampleDesc}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font"><span class="en-num-font">1、</span>样品描述 <span class="en-num-font">/ Sample Description</span></h3>
      <p class="content-table-font"><span class="en-num-font">${escapeHtml(fixedForm.sampleDesc || '无')}</span></p>
    </div>
  </div>

<!-- 2、客户提供信息 -->
<div class="content-block">
    <div class="spacer" style="--block-margin:${margin.clientInfo}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font"><span class="en-num-font">2、</span>客户提供信息 <span class="en-num-font">/ Information Provided by Client</span></h3>
      <table class="info-table info-table-font">
        <tr><th>委托单号<br><span class="en-num-font">Order No.</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.orderNo || '').replace(/\n/g, '<br>') }</span></td></tr>
        <tr><th>样品名称<br><span class="en-num-font">Sample Name</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.sampleName || '').replace(/\n/g, '<br>') }</span></td></tr>
        <tr><th>样品牌号<br><span class="en-num-font">Sample Material</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.sampleMaterial || '').replace(/\n/g, '<br>') }</span></td></tr>
        <tr><th>样品规格<br><span class="en-num-font">Sample Specification</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.sampleSpec || '').replace(/\n/g, '<br>') }</span></td></tr>
        <tr><th>样品信息<br><span class="en-num-font">Sample Information</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.sampleInfo || '').replace(/\n/g, '<br>')}</span></td></tr>
        <tr><th>其余信息<br><span class="en-num-font">Additional Information</span></th><td><span class="en-num-font">${escapeHtml(fixedForm?.additionalInfo || '').replace(/\n/g, '<br>')}</span></td></tr>
      </table>
    </div>
  </div>

  <div class="content-block">
    <div class="spacer" style="--block-margin:${margin.testEnv}mm;"></div>
    <div class="content-section">
      <h3 class="title-num-font"><span class="en-num-font">3、</span>检测环境 <span class="en-num-font">/ Test Environment</span></h3>
<table class="data-table content-table-font">
  <thead>
    <tr>
      <th class="content-table-font">序号<br><small class="en-num-font">No.</small></th>
      <th class="content-table-font">项目<br><small class="en-num-font">Item</small></th>
      <th class="content-table-font">温度要求（℃）<br><small class="en-num-font">Required Ambient Temperature</small></th>
      <th class="content-table-font">检测室温度（℃）<br><small class="en-num-font">Test Room Ambient Temperature</small></th>
    </tr>
  </thead>
<tbody>
  ${(() => {
            const envItems = (fixedForm.testEnv || []).map((envItem, idx) => ({ envItem, idx }))
                .filter(({ idx }) => {
                    const project = testProjects?.[idx];
                    if (!project) return true;
                    const projectTitle = project?.schemeConfig?.ProjectTitle || '';
                    return !projectTitle.includes('外包项目');
                });
            return envItems.map(({ envItem: item, idx: originalIdx }, displayIdx) => `
      <tr>
        <td class="en-num-font">${displayIdx + 1}</td>
<td class="content-table-font">
  ${(() => {
                    const { zh, en } = splitTextName(item.item || '');
                    return `${escapeHtml(zh)}${en ? `<br><span class="en-num-font">${escapeHtml(en)}</span>` : ''}`;
                })()}
</td>
        <td class="en-num-font">${escapeHtml(item.reqTemp || '')}</td>
        <td class="en-num-font">${escapeHtml(item.testTemp || '')}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="content-table-font">无数据</td></tr>';
        })()}
</tbody>
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
    <div class="cnas-remark">
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
    const isVickers = projectTitle.includes('维氏硬度') || projectTitle.includes('Vickers')


    // 外包项目：只显示"外包项目见附件"，不带"检测依据："标签
    // 非外包项目：显示"检测依据：" + 输入值
    const outsourcedZh = (config?.TestReference || '试验报告见附件。').trim()
    const outsourcedEn = (config?.TestReferenceEn || 'The test report is attached to the attachment.').trim()

    const testReferenceHtml = isOutsourced
        ? `<div class="content-table-font" style="margin-bottom: 8px; ">${escapeHtml((config?.TestReference || '试验报告见附件。').trim())}${config?.TestReferenceEn ? `<span class="en-num-font">/ ${escapeHtml(config.TestReferenceEn.trim())}</span>` : ''}</div>`
        : `<div class="content-table-font" style="margin-bottom: 8px;">检测依据 <span class="en-num-font">/ Test Reference：</span><span class="en-num-font">${escapeHtml(rd.testReference || '')}</span></div>`

    return `
    <div class="content-block ${isVickers ? 'vickers-hardness' : ''}">
      <div class="spacer" style="--block-margin:${gap}mm;"></div>
      <div class="content-section">
<h3 class="title-num-font"><span class="en-num-font">5.${index + 1}</span> ${escapeHtml(config.ProjectTitle || project.techSpecName || '检测项目')}<span class="en-num-font">${config.ProjectEnTitle ? ' / ' + escapeHtml(config.ProjectEnTitle) : ''}</span></h3>       
${testReferenceHtml}
        ${(() => {
            // ===== 1. 铁素体多分组 =====
            if (rd.isFerriteGrouped && rd.ferriteGroups?.length > 0) {
                return rd.ferriteGroups.map((group, idx) => {
                    const groupConfig = JSON.parse(JSON.stringify(config));
                    const dynamicCol = groupConfig.ExtendColumns?.find(col => col.isDynamic);
                    if (dynamicCol) {
                        dynamicCol.subColumns = group.subColumns || [];
                    }

                    // 把 group.techRequirement 映射到每个列 id
                    const techReqObj = {};
                    groupConfig.ExtendColumns?.forEach(col => {
                        if (col.subColumns?.length > 0) {
                            col.subColumns.forEach(sub => {
                                techReqObj[sub.id] = group.techRequirement || '';
                            });
                        } else {
                            techReqObj[col.id] = group.techRequirement || '';
                        }
                    });
                    const groupReportData = {
                        ...rd,
                        ...group,
                        tableData: group.tableData, 
                        conclusion: group.conclusion || '',
                        note: group.note || '',                      
                        techRequirement: techReqObj,  
                    };
                    let html = '';
                    html += renderParamItems(config.ParamItems, rd.paramValues);
                    const bottomHtml = renderBottomColumns(groupConfig, rd.bottomRequirement);
                    html += renderMainTable(groupConfig, group.tableData, groupReportData, bottomHtml);
                    const marginTop = (group.marginTop ?? 5) + 'mm';
                    return `<div style="margin-top: ${marginTop};">${html}</div>`;
                }).join('');
            }

        // ===== 2. 冲击多分组 =====
        if (rd.isImpactGrouped && rd.impactGroups?.length > 0) {
            return rd.impactGroups.map((group, idx) => {
                const groupConfig = JSON.parse(JSON.stringify(config));
                groupConfig.BaseColumns = groupConfig.BaseColumns.filter(col => col.label !== '试样编号');
                const dynamicCol = groupConfig.ExtendColumns?.find(col => col.isDynamic);
                if (dynamicCol) {
                    dynamicCol.subColumns = group.subColumns || [];
                }

                // 构建分组独立数据，覆盖备注字段
                const groupReportData = {
                    ...rd,
                    note: group.note || '',   // 使备注独立
                };

                let html = '';
                const groupParams = group.paramValues || rd.paramValues || {}
                html += renderParamItems(config.ParamItems, groupParams);

                // 底部列组（BottomColumns）独立处理
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
                const bottomHtml = renderBottomColumns(groupConfig, bottomReqForRender);
                html += renderMainTable(groupConfig, group.tableData, groupReportData, bottomHtml);

                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${html}</div>`;
            }).join('');
        }

            // ===== 3. 室温拉伸多分组（新增） =====
            if (rd.isTensileGrouped && rd.tensileGroups?.length > 0) {
                return rd.tensileGroups.map((group, idx) => {
                    const groupReportData = {
                        ...rd,
                        techRequirement: group.techRequirements || {},
                        conclusion: group.conclusion || '',
                        note: group.note || '',
                        bottomRequirement: group.bottomRequirement || {},
                    };
                    let html = '';
                    html += renderParamItems(config.ParamItems, rd.paramValues);
                    const bottomHtml = renderBottomColumns(config, groupReportData.bottomRequirement);
                    html += renderMainTable(config, group.tableData, groupReportData, bottomHtml);
                    const marginTop = (group.marginTop ?? 5) + 'mm';

                    return `<div style="margin-top: ${marginTop};">${html}</div>`;
                }).join('');
        }

        // ===== 4. 维氏硬度多分组 =====
        if (rd.isVickersGrouped && rd.vickersGroups?.length > 0) {
            return rd.vickersGroups.map((group, idx) => {
                const groupConfig = JSON.parse(JSON.stringify(config));
                // 不要清空 FooterColumns，保留配置以便自动渲染

                // 替换动态列子列
                const dynamicCol = groupConfig.ExtendColumns?.find(col => col.isDynamic);
                if (dynamicCol) {
                    dynamicCol.subColumns = group.subColumns || [];
                    dynamicCol.label = '检测结果';
                    dynamicCol.enLabel = 'Test Results';
                }

                // 构建 techRequirement 对象（将 group.techRequirement 映射到每个子列）
                const techReqObj = {};
                if (dynamicCol && dynamicCol.subColumns) {
                    dynamicCol.subColumns.forEach(sub => {
                        techReqObj[sub.id] = group.techRequirement || '';
                    });
                }

                const groupReportData = {
                    ...rd,
                    techRequirement: techReqObj,
                    _vickersTechRequirement: group.techRequirement || '',
                    conclusion: group.conclusion || '',
                    note: group.note || '',
                    bottomRequirement: group.bottomRequirement || {},
                };

                // 直接生成主表格（renderMainTable 内部会调用 renderFooterColumns）
                const mainTableHtml = renderVickersTable(groupConfig, group, groupReportData);

                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${mainTableHtml}</div>`;
            }).join('');
        }

        // ===== 5. 点腐蚀 / 晶间腐蚀多分组 =====
        if (rd.isCorrosionGrouped && rd.corrosionGroups?.length > 0) {
            return rd.corrosionGroups.map((group, idx) => {
                const groupReportData = {
                    ...rd,
                    ...group,     // 把 group 里所有字段（含数字 id key）平铺
                };
                let html = '';
                html += renderParamItems(config.ParamItems, rd.paramValues);
                const bottomHtml = renderBottomColumns(config, group.bottomRequirement || {});
                html += renderMainTable(config, group.tableData, groupReportData, bottomHtml);
                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${html}</div>`;
            }).join('');
        }

        // =====6. 非金属夹杂物多分组 =====
        if (rd.isInclusionGrouped && rd.inclusionGroups?.length > 0) {
            return rd.inclusionGroups.map((group, idx) => {
                const groupReportData = {
                    ...rd,
                    techRequirement: group.techRequirement || {},
                    conclusion: group.conclusion || '',
                    note: group.note || '',
                    bottomRequirement: group.bottomRequirement || {},
                };

                let html = '';
                html += renderParamItems(config.ParamItems, rd.paramValues);
                const bottomHtml = renderBottomColumns(config, group.bottomRequirement || {});
                html += renderMainTable(config, group.tableData, groupReportData, bottomHtml);

                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${html}</div>`;
            }).join('');
        }

        // ===== 金相检验多分组 =====
        if (rd.isMetallographicGrouped && rd.metallographicGroups?.length > 0) {
            return rd.metallographicGroups.map((group, idx) => {
                const groupConfig = JSON.parse(JSON.stringify(config));

                const groupReportData = {
                    ...rd,
                    techRequirement: group.techRequirement || {},
                    conclusion: group.conclusion || '',
                    note: group.note || '',
                    bottomRequirement: group.bottomRequirement || {},
                };

                let html = '';

                // ⭐ 新增：输出当前分组独立的检测依据 ⭐
                if (group.testReference) {
                    html += `<div class="content-table-font" style="margin-bottom: 8px;">检测依据：<span class="en-num-font">${escapeHtml(group.testReference)}</span></div>`;
                }

                html += renderParamItems(config.ParamItems, rd.paramValues);
                const bottomHtml = renderBottomColumns(groupConfig, group.bottomRequirement || {});
                html += renderMainTable(groupConfig, group.tableData, groupReportData, bottomHtml);

                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${html}</div>`;
            }).join('');
        }

        // ===== 化学成分多分组 =====
        if (rd.isChemGrouped && rd.chemGroups?.length > 0) {
            return rd.chemGroups.map((group, idx) => {
                const groupConfig = JSON.parse(JSON.stringify(config));
                // 处理动态列：替换成该分组的 subColumns
                const dynamicCol = groupConfig.ExtendColumns?.find(col => col.isDynamic);
                if (dynamicCol) {
                    dynamicCol.subColumns = group.dynamicSubColumns || [];
                }

                const groupReportData = {
                    ...rd,
                    techRequirement: group.techRequirement || {},
                    conclusion: group.conclusion || '',
                    note: group.note || '',
                    bottomRequirement: group.bottomRequirement || {},
                };

                let html = '';
                html += renderParamItems(config.ParamItems, rd.paramValues);
                const bottomHtml = renderBottomColumns(groupConfig, group.bottomRequirement || {});
                html += renderMainTable(groupConfig, group.tableData, groupReportData, bottomHtml);

                const marginTop = (group.marginTop ?? 5) + 'mm';
                return `<div style="margin-top: ${marginTop};">${html}</div>`;
            }).join('');
        }


        // =====  普通单表（兜底） =====
        let html = '';
        html += renderParamItems(config.ParamItems, rd.paramValues);
        const bottomHtml = renderBottomColumns(config, rd.bottomRequirement);
        html += renderMainTable(config, rd.tableData, rd, bottomHtml);
        return html;
        })()}
        ${renderPhotoRows(rd.photoRows, config)}
        ${renderSignatures(rd.signatureItems)}   
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