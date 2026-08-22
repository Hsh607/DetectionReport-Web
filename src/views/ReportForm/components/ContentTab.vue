<template>
    <div>
        <!-- 固定信息区域 -->
        <div class="fixed-info-section" style="border: 1px solid #e6e6e6; padding: 10px; border-radius: 8px; background: #fafafa;">
            <!-- 1、样品描述 -->
            <div class="fixed-section spacing-module" :style="{ marginTop: sampleDescMargin + 'mm' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(mm)</span>
                    <el-input-number v-model="sampleDescMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">1、样品描述/Sample Description</h3>
                <el-input v-model="localFixedForm.sampleDesc"
                          placeholder="请输入样品描述"
                          clearable
                          :disabled="isDetail" />
            </div>

            <!-- 2、客户提供信息 -->
            <div class="fixed-section spacing-module" :style="{ marginTop: clientInfoMargin + 'mm' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(mm)</span>
                    <el-input-number v-model="clientInfoMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">2、客户提供信息/Information Provided by Client</h3>
                <el-form :model="localFixedForm" label-width="250px" label-position="left" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <el-form-item label="报检单号/Inspection Order No.">
                        <el-input v-model="localFixedForm.inspectionOrderNo"
                                  placeholder="点击选择报检单号"
                                  clearable
                                  :disabled="isDetail"
                                  readonly
                                  style="cursor: pointer;"
                                  @click="emit('openInspectionDialog')">
                            <template #append>
                                <el-button icon="Search" @click="emit('openInspectionDialog')" />
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="委托单号/Order No.">
                        <el-input v-model="localFixedForm.orderNo"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <!--
                <el-form-item label="技术条件/Material specification">
                    <el-input v-model="localFixedForm.materialSpec"
                              placeholder="请输入"
                              clearable
                              :disabled="isDetail" />
                </el-form-item>
                -->
                    <el-form-item label="样品名称/Sample Name">
                        <el-input v-model="localFixedForm.sampleName"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品牌号/Sample Material">
                        <el-input v-model="localFixedForm.sampleMaterial"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品规格/Sample Specification">
                        <el-input v-model="localFixedForm.sampleSpec"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品信息/Sample Information">
                        <el-input v-model="localFixedForm.sampleInfo"
                                  type="textarea"
                                  :rows="4"
                                  placeholder="请输入样品信息，每行一个样品"
                                  clearable
                                  :disabled="isDetail" />
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">
                            按 Enter 键换行，自由增减行数
                        </div>
                    </el-form-item>
                    <el-form-item label="其余信息/Additional Information">
                        <el-input v-model="localFixedForm.additionalInfo"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                </el-form>
            </div>

            <!-- 检测环境表格 -->
            <div class="spacing-module" :style="{ marginTop: testEnvMargin + 'mm' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(mm)</span>
                    <el-input-number v-model="testEnvMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <TestEnvTable ref="testEnvTableRef"
                              :test-env="localFixedForm.testEnv"
                              :env-list="envList"
                              :tech-spec-list="techSpecList"
                              :is-detail="isDetail"
                              @add-row="emit('addTestEnvRow')"
                              @delete-row="emit('deleteTestEnvRow', $event)"
                              @project-code-change="emit('projectCodeChange', $event)"
                              @tech-spec-change="emit('techSpecChange', $event)" />
            </div>

            <!-- 检测设备表格 -->
            <div class="spacing-module" :style="{ marginTop: testEquipmentMargin + 'mm' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(mm)</span>
                    <el-input-number v-model="testEquipmentMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <TestEquipmentTable :test-equipment="localFixedForm.testEquipment"
                                    :is-detail="isDetail"
                                    @add-row="emit('addTestEquipmentRow')"
                                    @delete-row="emit('deleteTestEquipmentRow', $event)"
                                    @equipment-select="emit('equipmentSelect', $event)" />
            </div>
        </div>

        <!-- 动态检测项目列表 -->
        <div class="spacing-module" :style="{ marginTop: resultTitleMargin + 'mm' }">
            <div class="spacing-input" v-if="!isDetail">
                <span>间距(mm)</span>
                <el-input-number v-model="resultTitleMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
            </div>
            <h3 style="font-size: 18px; font-weight: bold; color: #333; margin: 0; padding-bottom: 5px;">
                5、检测结果及检测依据/Test Results and Test Reference
            </h3>
        </div>

        <div v-for="(project, projectIndex) in validTestProjects"
             :key="projectIndex"
             :style="{ marginTop: projectMargins[projectIndex] + 'mm' }"
             class="project-spacing-wrapper">

            <!-- 每个检测项目 独立间距输入框 -->
            <div class="project-spacing-module" v-if="!isDetail">
                <div class="spacing-input project-input">
                    <span>项目间距(mm)</span>
                    <el-input-number v-model="projectMargins[projectIndex]" :min="0" :max="160" :step="2" size="small" style="width: 100px;" />
                </div>
            </div>

            <div style="border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
                <div style="background: #fff3cd; padding: 12px 20px; border-bottom: 1px solid #e6e6e6;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                        5.{{ projectIndex + 1 }}
                        {{ project?.schemeConfig?.ProjectTitle || project?.techSpecName || '检测项目' }}
                        <template v-if="project?.schemeConfig?.ProjectEnTitle">
                            / {{ project.schemeConfig.ProjectEnTitle }}
                        </template>
                    </h3>
                </div>


                <!-- 检测依据区域 -->
                <div style="padding: 12px 20px; border-bottom: 1px solid #e6e6e6; background: #fff;">
                    <!-- 非外包项目：显示标签 + 输入框 -->
                    <div v-if="!isOutsourcedProject(project)" style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500; font-size: 16px; color: #666; white-space: nowrap;">检测依据 / Test Reference：</span>
                        <el-input v-model="project.reportData.testReference"
                                  :disabled="isDetail"
                                  style="flex: 1;"
                                  placeholder="请输入检测依据" />
                    </div>
                    <!-- 外包项目：仅显示纯文字（无标签） -->
                    <div v-else style="font-size: 16px; color: #333; font-weight: 500; padding: 4px 0;">
                        试验报告见附件。/The test report is attached to the attachment.
                    </div>
                </div>


                <!-- 参数行（非冲击/单组冲击使用，在循环外部） -->
                <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0 && !(project.reportData.isImpactGrouped && project.reportData.impactGroups?.length > 0)" style="margin: 0; padding: 0; width: 100%;">
                    <table border="1" cellpadding="8" cellspacing="0" style="width: calc(100% - 80px); border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                        <tbody>
                            <tr>
                                <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                    <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                        <div>{{ param.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                    </td>
                                    <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                        <el-input v-model="project.reportData.paramValues[param.id]"
                                                  placeholder="/"
                                                  size="small"
                                                  :disabled="isDetail"
                                                  class="param-input" />
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="project?.schemeConfig" style="padding: 0;">
                    <!-- ========== 冲击多分组分支（冲击多个技术要求分不同表格显示） ========== -->
                    <template v-if="project.reportData.isImpactGrouped && project.reportData.impactGroups?.length > 0 && project.projectCode === 'JCXMHJ-06'">
                        <!-- 循环每个分组 -->
                        <div v-for="(group, gIdx) in project.reportData.impactGroups" :key="gIdx" style="margin-top: 0px;">
                            <!-- 参数行：每个分组独立显示（位于表格上方） -->
                            <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0" style="margin: 0; padding: 0; width: 100%;">
                                <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                                    <tbody>
                                        <tr>
                                            <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                                <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                                    <div>{{ param.label }}</div>
                                                    <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                                </td>
                                                <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                                    <el-input v-model="project.reportData.paramValues[param.id]"
                                                              placeholder="/"
                                                              size="small"
                                                              :disabled="isDetail"
                                                              class="param-input" />
                                                </td>
                                            </template>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- 使用该组的独立配置和 tableData -->
                            <template v-for="gConfig in [getGroupConfig(project, group)]" :key="gConfig.SchemeId">
                                {{ console.log('gConfig.ExtendColumns:', gConfig.ExtendColumns) }}

                                <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                                    <thead>
                                        <tr>
                                            <th v-for="col in gConfig.BaseColumns || []" :key="col.id" :rowspan="2" style="background: #d9d9d9; white-space: pre-line;">
                                                <div>{{ col.label }}</div>
                                                <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                            </th>
                                            <template v-for="col in gConfig.ExtendColumns || []" :key="col.id">
                                                <th v-if="col.subColumns?.length > 0" :colspan="col.subColumns.length" style="background:#e6e6e6; white-space: pre-line;">
                                                    <div>{{ col.label }}</div>
                                                    <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                                </th>
                                                <th v-else :rowspan="2" style="background:#e6e6e6; white-space: pre-line;">
                                                    <div>{{ col.label }}</div>
                                                    <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                                </th>
                                            </template>
                                            <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                                        </tr>
                                        <tr>
                                            <template v-for="col in gConfig.ExtendColumns || []" :key="col.id">
                                                <th v-for="subCol in col.subColumns || []" :key="subCol.id" style="background:#f0f0f0; white-space: pre-line;">
                                                    <template v-if="subCol.label && subCol.enLabel && subCol.label !== subCol.enLabel">
                                                        <div>{{ subCol.label }}</div>
                                                        <div style="font-size:12px;color:#666;">{{ subCol.enLabel }}</div>
                                                    </template>
                                                    <template v-else>
                                                        <div>{{ subCol.label || subCol.enLabel }}</div>
                                                    </template>
                                                </th>
                                            </template>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- 数据行 -->
                                        <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
                                            <td v-for="col in gConfig.BaseColumns || []" :key="col.id">
                                                <el-input v-model="row[col.id]"
                                                          size="small"
                                                          :disabled="isDetail"
                                                          style="text-align: center; border: none; background: transparent;" />
                                            </td>
                                            <template v-for="col in gConfig.ExtendColumns || []" :key="col.id">
                                                <template v-if="col.subColumns?.length > 0">
                                                    <td v-for="subCol in col.subColumns" :key="subCol.id">
                                                        <el-input v-model="row[subCol.id]"
                                                                  size="small"
                                                                  :disabled="isDetail"
                                                                  style="text-align: center; border: none; background: transparent;" />
                                                    </td>
                                                </template>
                                                <td v-else>
                                                    <el-select v-if="col.label.includes('结论')"
                                                               v-model="row[col.id]"
                                                               size="small"
                                                               :disabled="isDetail"
                                                               style="width: 160px; text-align: center;">
                                                        <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                                        <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                                    </el-select>
                                                    <el-input v-else v-model="row[col.id]"
                                                              size="small"
                                                              :disabled="isDetail"
                                                              style="text-align: center; border: none; background: transparent;" />
                                                </td>
                                            </template>
                                            <td v-if="!isDetail">
                                                <el-button type="link" danger size="small" @click="emit('deleteImpactRow', projectIndex, gIdx, rowIndex)">删除</el-button>
                                            </td>
                                        </tr>

                                        <!-- 底部列组 -->
                                        <template v-if="gConfig.BottomColumns?.length > 0">
                                            <tr>
                                                <td :colspan="getTotalColSpan(gConfig)" style="padding: 0; border: none;">
                                                    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                                        <thead>
                                                            <tr style="background: #e6e6e6;">
                                                                <th v-for="col in gConfig.BottomColumns" :key="col.id" :colspan="col.subColumns?.length || getExtendTotalColSpan(gConfig.ExtendColumns) / gConfig.BottomColumns.length" :style="{ width: (100 / gConfig.BottomColumns.length) + '%' }" style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                                    <div>{{ col.label }}</div>
                                                                    <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr style="background: #f0f0f0;">
                                                                <template v-for="col in gConfig.BottomColumns" :key="col.id">
                                                                    <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(gConfig.ExtendColumns, gConfig.BottomColumns.length))" :key="idx" style="border: 1px solid #dcdfe6;">
                                                                        <div>{{ subCol.label }}</div>
                                                                        <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                                    </th>
                                                                </template>
                                                            </tr>
                                                            <tr style="background: #fff;">
                                                                <template v-for="col in gConfig.BottomColumns" :key="col.id">
                                                                    <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(gConfig.ExtendColumns, gConfig.BottomColumns.length))" :key="idx" style="border: 1px solid #dcdfe6;">
                                                                        <el-input :model-value="getGroupBottomValue(group, subCol)"
                                                                                  @update:model-value="(val) => updateGroupBottomValue(group, subCol, val)"
                                                                                  size="small"
                                                                                  :disabled="isDetail"
                                                                                  style="text-align: center; border: none; background: transparent;" />
                                                                    </td>
                                                                </template>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </template>

                                        <!-- 尾部行 -->
                                        <tr v-for="(footRow, brIdx) in gConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                            <td :colspan="gConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                                {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                            </td>
                                            <template v-if="footRow.label.includes('技术要求')">
                                                <template v-for="col in gConfig.ExtendColumns || []" :key="col.id">
                                                    <template v-if="col.subColumns?.length > 0">
                                                        <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                            <el-input v-model="project.reportData.techRequirement[subCol.id]"
                                                                      size="small"
                                                                      :disabled="isDetail"
                                                                      style="text-align:center; border:none; background:transparent;" />
                                                        </td>
                                                    </template>
                                                    <td v-else style="text-align: center; padding: 8px 12px;">
                                                        <el-input v-model="project.reportData.techRequirement[col.id]"
                                                                  size="small"
                                                                  :disabled="isDetail"
                                                                  style="text-align:center; border:none; background:transparent;" />
                                                    </td>
                                                </template>
                                            </template>
                                            <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                                <el-select v-model="project.reportData.conclusion"
                                                           :disabled="isDetail"
                                                           style="width:200px"
                                                           placeholder="请选择">
                                                    <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                                    <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                                </el-select>
                                            </td>
                                            <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                                <el-input v-model="project.reportData.note"
                                                          type="textarea"
                                                          rows="2"
                                                          :disabled="isDetail"
                                                          style="width:100%; border:none; background:transparent;" />
                                            </td>
                                            <td v-else :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                                <el-input v-model="project.reportData[footRow.field || '']"
                                                          :disabled="isDetail"
                                                          style="width:100%; border:none; background:transparent;" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>
                        </div>
                    </template>

                    <!-- ========== 铁素体多分组分支 ========== -->

                    <template v-else-if="project.reportData.isFerriteGrouped && project.reportData.ferriteGroups?.length > 0">
                        <div style="background: purple; color: white; padding: 4px; margin: 4px;">
                            项目 {{ projectIndex }} 铁素体分组数: {{ project.reportData.ferriteGroups?.length || 0 }}
                        </div>

                        <div v-for="(group, fIdx) in project.reportData.ferriteGroups" :key="fIdx" style="margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <!-- 分组标题 -->
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                                <span style="font-weight: bold;">{{ group.groupLabel || `铁素体 ${fIdx + 1}` }}</span>
                                <el-button v-if="!isDetail" type="danger" size="small" @click="emit('deleteFerriteGroup', projectIndex, fIdx)">删除本组</el-button>
                            </div>

                            <!-- 参数行（如果有 ParamItems） -->
                            <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0">
                                <!-- 复用原有的参数表格渲染 -->
                            </div>
                            <div style="background: yellow; padding: 4px; margin: 4px;">
                                当前分组行数: {{ group.tableData.length }}
                            </div>
                            <!-- 核心表格（使用 renderMainTable 直接渲染） -->
                            <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                                <thead>
                                    <tr>
                                        <th v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id" :rowspan="2" style="background: #d9d9d9;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                        </th>
                                        <!-- 铁素体没有动态列，直接显示 ExtendColumns 中的固定列 -->
                                        <th v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id" :rowspan="2" style="background: #e6e6e6;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                        </th>
                                        <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
                                        <!-- ===== BaseColumns（固定列） ===== -->
                                        <template v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id">
                                            <!-- 如果是合并列，且当前行不是该值的第一次出现，则跳过 -->
                                            <td v-if="isMergeColumn(col) && !shouldShowCell(rowIndex, col.id, group.tableData)"
                                                style="display: none;"></td>
                                            <td v-else-if="isMergeColumn(col) && shouldShowCell(rowIndex, col.id, group.tableData)"
                                                :rowspan="getRowSpan(rowIndex, col.id, group.tableData)"
                                                style="text-align: center; vertical-align: middle;">
                                                <el-input v-model="row[col.id]" size="small" :disabled="isDetail"
                                                          style="border: none; background: transparent; text-align: center;" />
                                            </td>
                                            <!-- 非合并列（正常显示） -->
                                            <td v-else>
                                                <el-input v-model="row[col.id]" size="small" :disabled="isDetail"
                                                          style="text-align: center; border: none; background: transparent;" />
                                            </td>
                                        </template>

                                        <!-- ===== ExtendColumns（扩展列） ===== -->
                                        <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                            <!-- 如果是合并列，且当前行不是该值的第一次出现，则跳过 -->
                                            <td v-if="isMergeColumn(col) && !shouldShowCell(rowIndex, col.id, group.tableData)"
                                                style="display: none;"></td>
                                            <td v-else-if="isMergeColumn(col) && shouldShowCell(rowIndex, col.id, group.tableData)"
                                                :rowspan="getRowSpan(rowIndex, col.id, group.tableData)"
                                                style="text-align: center; vertical-align: middle;">
                                                <el-input v-model="row[col.id]" size="small" :disabled="isDetail"
                                                          style="border: none; background: transparent; text-align: center;" />
                                            </td>
                                            <!-- 非合并列（正常显示） -->
                                            <td v-else>
                                                <el-input v-model="row[col.id]" size="small" :disabled="isDetail"
                                                          style="text-align: center; border: none; background: transparent;" />
                                            </td>
                                        </template>

                                        <!-- 操作列 -->
                                        <td v-if="!isDetail">
                                            <el-button type="link" danger size="small"
                                                       @click="emit('deleteFerriteRow', projectIndex, fIdx, rowIndex)">删除</el-button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns" :key="brIdx" style="background: #f9f9f9;">
                                        <td :colspan="(project.schemeConfig.BaseColumns || []).length" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                            {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                        </td>
                                        <td :colspan="(project.schemeConfig.ExtendColumns || []).length + (isDetail ? 0 : 1)">
                                            <el-select v-model="project.reportData.conclusion" :disabled="isDetail" style="width:200px" placeholder="请选择">
                                                <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                                <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                            </el-select>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </template>

                    <!-- ========== 原有分支（非冲击 / 单组冲击） ========== -->
                    <template v-else>
                        <!-- 原有表格代码（完全不变） -->
                        <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                            <thead>
                                <tr>
                                    <th v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id" :rowspan="2" style="background: #d9d9d9; white-space: pre-line;">
                                        <div>{{ col.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                    </th>
                                    <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                        <th v-if="col.subColumns?.length > 0" :colspan="col.subColumns.length" style="background:#e6e6e6; white-space: pre-line;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                        </th>
                                        <th v-else :rowspan="2" style="background:#e6e6e6; white-space: pre-line;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                        </th>
                                    </template>
                                    <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                                </tr>
                                <tr>
                                    <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                        <th v-for="subCol in col.subColumns || []" :key="subCol.id" style="background:#f0f0f0; white-space: pre-line;">
                                            <template v-if="subCol.label && subCol.enLabel && subCol.label !== subCol.enLabel">
                                                <div>{{ subCol.label }}</div>
                                                <div style="font-size:12px;color:#666;">{{ subCol.enLabel }}</div>
                                            </template>
                                            <template v-else>
                                                <div>{{ subCol.label || subCol.enLabel }}</div>
                                            </template>
                                        </th>
                                    </template>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIndex) in project.reportData.tableData" :key="rowIndex">
                                    <td v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id">
                                        <el-input v-model="row[col.id]"
                                                  size="small"
                                                  :disabled="isDetail"
                                                  style="text-align: center; border: none; background: transparent;" />
                                    </td>
                                    <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                        <template v-if="col.subColumns?.length > 0">
                                            <td v-for="subCol in col.subColumns" :key="subCol.id">
                                                <el-input v-model="row[subCol.id]"
                                                          size="small"
                                                          :disabled="isDetail"
                                                          style="text-align: center; border: none; background: transparent;" />
                                            </td>
                                        </template>
                                        <td v-else>
                                            <el-select v-if="col.label.includes('结论')"
                                                       v-model="row[col.id]"
                                                       size="small"
                                                       :disabled="isDetail"
                                                       style="width: 160px; text-align: center;">
                                                <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                                <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                            </el-select>
                                            <el-input v-else v-model="row[col.id]"
                                                      size="small"
                                                      :disabled="isDetail"
                                                      style="text-align: center; border: none; background: transparent;" />
                                        </td>
                                    </template>
                                    <td v-if="!isDetail">
                                        <el-button type="link" danger size="small" @click="emit('deleteTableRow', projectIndex, rowIndex)">删除</el-button>
                                    </td>
                                </tr>
                                <!-- 底部列组 -->
                                <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                                    <tr>
                                        <td :colspan="getTotalColSpan(project.schemeConfig)" style="padding: 0; border: none;">
                                            <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                                <thead>
                                                    <tr style="background: #e6e6e6;">
                                                        <th v-for="col in project.schemeConfig.BottomColumns" :key="col.id" :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length" :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }" style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                            <div>{{ col.label }}</div>
                                                            <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr style="background: #f0f0f0;">
                                                        <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                            <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))" :key="idx" style="border: 1px solid #dcdfe6;">
                                                                <div>{{ subCol.label }}</div>
                                                                <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                            </th>
                                                        </template>
                                                    </tr>
                                                    <tr style="background: #fff;">
                                                        <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                            <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))" :key="idx" style="border: 1px solid #dcdfe6;">
                                                                <el-input v-model="project.reportData.bottomRequirement[`${col.id}_${subCol.id}`]"
                                                                          size="small"
                                                                          :disabled="isDetail"
                                                                          style="text-align: center; border: none; background: transparent;" />
                                                            </td>
                                                        </template>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </template>

                                <!-- 尾部行 -->
                                <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                    <td :colspan="project.schemeConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                        {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                    </td>
                                    <template v-if="footRow.label.includes('技术要求')">
                                        <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                            <template v-if="col.subColumns?.length > 0">
                                                <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                    <el-input v-model="project.reportData.techRequirement[subCol.id]"
                                                              size="small"
                                                              :disabled="isDetail"
                                                              style="text-align:center; border:none; background:transparent;" />
                                                </td>
                                            </template>
                                            <td v-else style="text-align: center; padding: 8px 12px;">
                                                <el-input v-model="project.reportData.techRequirement[col.id]"
                                                          size="small"
                                                          :disabled="isDetail"
                                                          style="text-align:center; border:none; background:transparent;" />
                                            </td>
                                        </template>
                                    </template>
                                    <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                        <el-select v-model="project.reportData.conclusion"
                                                   :disabled="isDetail"
                                                   style="width:200px"
                                                   placeholder="请选择">
                                            <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                            <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                        </el-select>
                                    </td>
                                    <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                        <el-input v-model="project.reportData.note"
                                                  type="textarea"
                                                  rows="2"
                                                  :disabled="isDetail"
                                                  style="width:100%; border:none; background:transparent;" />
                                    </td>
                                    <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                        <el-input v-model="project.reportData[footRow.field || '']"
                                                  :disabled="isDetail"
                                                  style="width:100%; border:none; background:transparent;" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </template>

                    <!-- ========== 公共区域：新增行、照片、审批（不论分组情况都显示） ========== -->
                    <!-- 新增行按钮（仅非详情、且不是多分组冲击时显示） -->
                    <div style="padding: 10px 20px; background: #fafafa;" v-if="!isDetail && !(project.reportData.isImpactGrouped && project.reportData.impactGroups?.length > 0)">
                        <el-button size="small" type="primary" @click="emit('addTableRow', projectIndex)">+ 新增数据行</el-button>
                    </div>

                    <!-- 照片区域 -->
                    <div v-if="project.showPhotoArea" style="margin: 20px;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 15px;">试验照片 / Test Photos</div>
                        <el-button v-if="!isDetail" type="primary" size="small" @click="emit('addPhotoRow', projectIndex)">新增照片行（2张/行）</el-button>
                        <div v-for="(row, idx) in project.reportData.photoRows" :key="idx" style="display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-end; position: relative;">
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 360px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.LeftUrl" :src="convertImageUrl(row.LeftUrl)" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 1)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 1)" />
                                        <el-button type="text" icon="Upload" @click="triggerUpload(projectIndex, idx, 1)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <el-button v-if="row.LeftUrl && !isDetail" type="danger" circle size="small" icon="Close" style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" @click="deleteSinglePhoto(projectIndex, idx, 1)" />
                                <el-input v-model="row.LeftDesc"
                                          :disabled="isDetail"
                                          placeholder="照片描述"
                                          style="margin-top: 8px;" />
                            </div>
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 360px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.RightUrl" :src="convertImageUrl(row.RightUrl)" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 2)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 2)" />
                                        <el-button type="text" icon="Upload" @click="triggerUpload(projectIndex, idx, 2)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <el-button v-if="row.RightUrl && !isDetail" type="danger" circle size="small" icon="Close" style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" @click="deleteSinglePhoto(projectIndex, idx, 2)" />
                                <el-input v-model="row.RightDesc"
                                          :disabled="isDetail"
                                          placeholder="照片描述"
                                          style="margin-top: 8px;" />
                            </div>
                            <el-button v-if="!isDetail" type="danger" icon="Delete" size="small" style="align-self: center;" @click="emit('removePhotoRow', projectIndex, idx)">删除此行</el-button>
                        </div>
                    </div>

                    <!-- 审批区域 -->
                    <div v-if="project.schemeConfig.ApprovalItems?.length > 0" style="margin: 20px; padding-bottom: 20px;">
                        <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <template v-for="item in project.schemeConfig.ApprovalItems" :key="item.id">
                                        <td style="white-space: nowrap; text-align: left; padding: 8px 16px; font-weight: 500;">
                                            <div>{{ item.label }}</div>
                                            <div style="font-size: 12px; color: #666; margin-top: 2px;">{{ item.enLabel }}</div>
                                        </td>
                                        <td style="width: 200px; padding: 8px 16px;">
                                            <input v-model="project.reportData.approval[item.id]"
                                                   type="text"
                                                   :disabled="isDetail"
                                                   placeholder="/"
                                                   style="width: 100%;border: none; background: transparent;outline: none;text-align: left; padding: 0; font-size: 14px;" />
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-else style="color: #999; padding: 30px; text-align: center;">
                    请在检测环境中选择 检测项目编码 + 技术要求编码，自动加载模板
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { defineProps, defineEmits, computed, ref, watch, onMounted, defineExpose } from 'vue'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'
    import TestEnvTable from './TestEnvTable.vue'
    import TestEquipmentTable from './TestEquipmentTable.vue'
    import { getExtendTotalColSpan, getTotalColSpan, getSubColumnsByExtend } from '../utils/reportMapper'


        const testEnvTableRef = ref(null)


    // 为冲击分组构建独立的配置副本（替换动态列的 subColumns）
    function getGroupConfig(project, group) {
        const config = JSON.parse(JSON.stringify(project.schemeConfig));

        // 1. 过滤 BaseColumns 中含“试样编号”的列
        config.BaseColumns = config.BaseColumns.filter(col => {
            const label = (col.label || '').trim();
            return !label.includes('试样编号') && !label.includes('Sample No.');
        });

        // 2. 过滤 ExtendColumns：保留动态列，移除含“试样编号”的非动态列
        config.ExtendColumns = config.ExtendColumns.filter(col => {
            if (col.isDynamic) return true; // 动态列保留（用于生成试样列）
            const label = (col.label || '').trim();
            return !label.includes('试样编号') && !label.includes('Sample No.');
        });

        // 3. 替换动态列的子列为分组试样
        const dynamicCol = config.ExtendColumns?.find(col => col.isDynamic);
        if (dynamicCol) {
            dynamicCol.subColumns = group.subColumns && group.subColumns.length > 0
                ? group.subColumns
                : dynamicCol.subColumns || [];
            console.log('替换后 dynamicCol.subColumns:', dynamicCol.subColumns);

        }

        return config;
    }

    // 更新分组底部要求值
    function updateGroupBottomValue(group, subCol, val) {
        if (!group.bottomRequirement) {
            group.bottomRequirement = {};
        }
        const label = (subCol?.label || '').trim();
        if (label.includes('单个')) group.bottomRequirement.singleReq = val;
        else if (label.includes('平均')) group.bottomRequirement.avgReq = val;
        else if (label.includes('侧向')) group.bottomRequirement.leReq = val;
        else if (label.includes('剪切') || label.includes('断面')) group.bottomRequirement.shearReq = val;
    }

    function getGroupBottomValue(group, subCol) {
        const bottomReq = group.bottomRequirement || {};
        const label = (subCol?.label || '').trim();
        if (label.includes('单个')) return bottomReq.singleReq || '';
        if (label.includes('平均')) return bottomReq.avgReq || '';
        if (label.includes('侧向')) return bottomReq.leReq || '';
        if (label.includes('剪切') || label.includes('断面')) return bottomReq.shearReq || '';
        return '';
    }

    const props = defineProps({
        fixedForm: Object,
        testProjects: Array,
        isDetail: Boolean,
        envList: Array,
        techSpecList: Array
    })

    const emit = defineEmits([
        'update:fixedForm',
        'openInspectionDialog',
        'addTestEnvRow', 'deleteTestEnvRow',
        'addTestEquipmentRow', 'deleteTestEquipmentRow',
        'addTableRow', 'deleteTableRow',
        'addPhotoRow', 'removePhotoRow',
        'pickPhoto',
        'projectCodeChange', 'techSpecChange',
        'equipmentSelect',
        'deleteImpactRow',
        'deleteFerriteRow',
        'deleteFerriteGroup' 
    ])

    // ===== 铁素体表格合并单元格辅助函数 =====

    /**
     * 判断该列是否需要合并（基于 yunbiaoField）
     */
    const mergeFields = ['试样编号', 'PP', 's', 's_95CI', 'Vv', 'RA'];
    function isMergeColumn(col) {
        return mergeFields.includes(col.yunbiaoField) || mergeFields.includes(col.id);
    }

    /**
     * 计算从当前行开始，连续相同值的行数
     */
    function getRowSpan(rowIndex, colId, tableData) {
        if (!tableData || tableData.length === 0) return 1;
        let count = 1;
        const currentVal = tableData[rowIndex]?.[colId];
        // 如果当前值为空，则和空值合并
        for (let i = rowIndex + 1; i < tableData.length; i++) {
            const nextVal = tableData[i]?.[colId];
            if (nextVal === currentVal) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    /**
     * 判断当前单元格是否应该显示（即该值是第一次出现）
     */
    function shouldShowCell(rowIndex, colId, tableData) {
        if (!tableData || rowIndex === 0) return true;
        const prevVal = tableData[rowIndex - 1]?.[colId];
        const currVal = tableData[rowIndex]?.[colId];
        return currVal !== prevVal;
    }

    // 本地表单双向绑定
    const localFixedForm = computed({
        get() {
            return props.fixedForm || {}
        },
        set(val) {
            emit('update:fixedForm', val)
        }
    })

    // 固定模块间距（带默认值）
    const resultTitleMargin = ref(5)
    const sampleDescMargin = ref(5)
    const clientInfoMargin = ref(5)
    const testEnvMargin = ref(5)
    const testEquipmentMargin = ref(5)
    const projectMargins = ref([])

    // 初始化间距
    const initMarginsFromData = () => {
        if (props.fixedForm?.MarginSettings) {
            sampleDescMargin.value = props.fixedForm.MarginSettings.sampleDesc ?? 5
            clientInfoMargin.value = props.fixedForm.MarginSettings.clientInfo ?? 5
            testEnvMargin.value = props.fixedForm.MarginSettings.testEnv ?? 5
            testEquipmentMargin.value = props.fixedForm.MarginSettings.testEquipment ?? 5
            resultTitleMargin.value = 5
        }
        if (props.testProjects?.length) {
            projectMargins.value = props.testProjects.map(item => item.ProjectMargin ?? 5)
        }
    }

    const isOutsourcedProject = (project) => {
        if (!project) return false
        const title = project?.schemeConfig?.ProjectTitle || project?.techSpecName || ''
        return title.includes('外包项目')
    }

    watch(() => props.testProjects, (newVal) => {
        console.log('🔄 ContentTab testProjects 更新:', newVal);
        newVal?.forEach((p, idx) => {
            if (p?.schemeConfig?.ProjectTitle?.includes('铁素体')) {
                console.log(`铁素体项目 ${idx}:`, {
                    ferriteGroups: p.reportData?.ferriteGroups,
                    isFerriteGrouped: p.reportData?.isFerriteGrouped,
                    tableData: p.reportData?.tableData
                });
            }
        });
    }, { deep: true, immediate: true });

    watch(
        () => [props.fixedForm, props.testProjects],
        initMarginsFromData,
        { deep: true, immediate: true }
    )

    onMounted(() => {
        initMarginsFromData()
    })

    // 导出间距给父组件
    const getMarginData = () => {
        return {
            fixedMargins: {
                sampleDesc: sampleDescMargin.value,
                clientInfo: clientInfoMargin.value,
                testEnv: testEnvMargin.value,
                testEquipment: testEquipmentMargin.value,
                resultTitle: resultTitleMargin.value

            },
            projectMargins: projectMargins.value
        }
    }

defineExpose({
    getMarginData,
    refreshAllTechRequirements: async () => {
        if (testEnvTableRef.value) {
            console.log('✅ ContentTab: 正在调用 TestEnvTable 刷新...')
            return await testEnvTableRef.value.refreshAllTechRequirements()
        } else {
            console.warn('⚠️ ContentTab: testEnvTableRef 未就绪')
            return Promise.resolve()
        }
    }
})

    // 照片上传相关
    const uploadRefs = ref({})
    const setUploadRef = (el, projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        if (el) uploadRefs.value[key] = el
    }
    const triggerUpload = (projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        uploadRefs.value[key]?.click()
    }
    const uploadPhoto = async (e, projectIndex, rowIndex, type) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) return ElMessage.error('仅支持图片')
        if (file.size > 20 * 1024 * 1024) return ElMessage.error('最大20MB')

        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post('/api/upload/image', formData)
            if (res.data.success) {
                const row = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
                let url = res.data.url

                // 新增：转换旧格式URL
                if (url && url.includes('/api/upload/image/')) {
                    url = url.replace('/api/upload/image/', '/uploads/')
                }

                type === 1 ? (row.LeftUrl = url) : (row.RightUrl = url)
                ElMessage.success('上传成功')
            }
        } catch (err) {
            ElMessage.error('上传失败')
        }
    }

    // 转换图片URL（兼容旧数据）
    const convertImageUrl = (url) => {
        if (!url) return ''
        // 旧格式: /api/upload/image/2026/0510/xxx.png
        // 新格式: /uploads/2026/0514/xxx.png
        if (url.includes('/api/upload/image/')) {
            return url.replace('/api/upload/image/', '/uploads/')
        }
        return url
    }

    const deleteSinglePhoto = (projectIndex, rowIndex, type) => {
        const row = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
        type === 1 ? (row.LeftUrl = '', row.LeftDesc = '') : (row.RightUrl = '', row.RightDesc = '')
        ElMessage.success('删除成功')
    }

    const validTestProjects = computed(() => {
    const valid = props.testProjects?.filter(Boolean) || []
    console.log('📊 validTestProjects 长度:', valid.length)
    valid.forEach((p, i) => {
        console.log(`项目 ${i}:`, p.projectCode, p.schemeConfig?.ProjectTitle, 'impactGroups 长度:', p.reportData?.impactGroups?.length)
    })
    return valid
})
</script>

<style scoped>
    .spacing-module {
        position: relative;
    }

    .spacing-input {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 99;
        pointer-events: none;
    }

    .spacing-module:hover .spacing-input {
        opacity: 1;
        pointer-events: all;
    }

    .spacing-input span {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
    }

    .project-spacing-wrapper {
        position: relative;
    }

    .project-spacing-module {
        position: absolute;
        top: -35px;
        right: 0;
        z-index: 99;
    }

    .project-input {
        opacity: 0;
        pointer-events: none;
    }

    .project-spacing-wrapper:hover .project-input {
        opacity: 1;
        pointer-events: all;
    }

    .param-input :deep(.el-input__wrapper) {
        border: none !important;
        text-align: center !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
    }

    .param-input :deep(.el-input__inner) {
        text-align: center !important;
        padding: 0 !important;
    }
</style>