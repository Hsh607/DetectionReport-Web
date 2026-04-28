<template>
    <div>
        <!-- 固定信息区域 -->
        <div class="fixed-info-section" style="border: 1px solid #e6e6e6; padding: 20px; border-radius: 8px; background: #fafafa;">
            <!-- 1、样品描述 -->
            <div class="fixed-section spacing-module" :style="{ marginTop: sampleDescMargin + 'px' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(px)</span>
                    <el-input-number v-model="sampleDescMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">1、样品描述/Sample Description</h3>
                <el-input :value="fixedForm.sampleDesc"
                          @input="(val) => $emit('update:fixedForm', { ...fixedForm, sampleDesc: val })"
                          placeholder="请输入样品描述"
                          clearable
                          :disabled="isDetail" />
            </div>

            <!-- 2、客户提供信息 -->
            <div class="fixed-section spacing-module" :style="{ marginTop: clientInfoMargin + 'px' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(px)</span>
                    <el-input-number v-model="clientInfoMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">2、客户提供信息/Information Provided by Client</h3>
                <el-form :model="fixedForm" label-width="250px" label-position="left" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <el-form-item label="报检单号/Inspection Order No.">
                        <el-input :value="fixedForm.inspectionOrderNo"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, inspectionOrderNo: val })"
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
                        <el-input :value="fixedForm.orderNo"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, orderNo: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="技术条件/Material specification">
                        <el-input :value="fixedForm.materialSpec"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, materialSpec: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品名称/Sample Name">
                        <el-input :value="fixedForm.sampleName"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, sampleName: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品牌号/Sample Material">
                        <el-input :value="fixedForm.sampleMaterial"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, sampleMaterial: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品规格/Sample Specification">
                        <el-input :value="fixedForm.sampleSpec"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, sampleSpec: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="其余信息/Additional Information">
                        <el-input :value="fixedForm.additionalInfo"
                                  @input="(val) => $emit('update:fixedForm', { ...fixedForm, additionalInfo: val })"
                                  placeholder="请输入"
                                  clearable
                                  :disabled="isDetail" />
                    </el-form-item>
                </el-form>
            </div>

            <!-- 检测环境表格 -->
            <div class="spacing-module" :style="{ marginTop: testEnvMargin + 'px' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(px)</span>
                    <el-input-number v-model="testEnvMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <TestEnvTable :test-env="fixedForm.testEnv"
                              :env-list="envList"
                              :tech-spec-list="techSpecList"
                              :is-detail="isDetail"
                              @add-row="emit('addTestEnvRow')"
                              @delete-row="emit('deleteTestEnvRow', $event)"
                              @project-code-change="emit('projectCodeChange', $event)"
                              @tech-spec-change="emit('techSpecChange', $event)" />
            </div>

            <!-- 检测设备表格 -->
            <div class="spacing-module" :style="{ marginTop: testEquipmentMargin + 'px' }">
                <div class="spacing-input" v-if="!isDetail">
                    <span>间距(px)</span>
                    <el-input-number v-model="testEquipmentMargin" :min="0" :max="160" :step="2" size="small" style="width: 80px;" />
                </div>
                <TestEquipmentTable :test-equipment="fixedForm.testEquipment"
                                    :is-detail="isDetail"
                                    @add-row="emit('addTestEquipmentRow')"
                                    @delete-row="emit('deleteTestEquipmentRow', $event)"
                                    @equipment-select="emit('equipmentSelect', $event)" />
            </div>
        </div>

        <!-- 动态检测项目列表 -->
        <div v-for="(project, projectIndex) in validTestProjects"
             :key="projectIndex"
             :style="{ marginTop: projectMargins[projectIndex] + 'px' }"
             class="project-spacing-wrapper">
            <!-- 每个检测项目 独立间距输入框 -->
            <div class="project-spacing-module" v-if="!isDetail">
                <div class="spacing-input project-input">
                    <span>项目间距(px)</span>
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

                <div style="padding: 12px 20px; border-bottom: 1px solid #e6e6e6; background: #fff;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500; font-size: 16px; color: #666; white-space: nowrap;">检测依据 / Test Reference：</span>
                        <el-input :value="project.reportData.testReference"
                                  @input="(val) => (project.reportData.testReference = val)"
                                  :disabled="isDetail"
                                  style="flex: 1;"
                                  placeholder="请输入检测依据" />
                    </div>
                </div>

                <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0" style="margin: 0; padding: 0; width: 100%;">
                    <table border="1" cellpadding="8" cellspacing="0" style="width: calc(100% - 80px); border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                        <tbody>
                            <tr>
                                <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                    <td style="background: #f5f7fa; font-weight: 600; border: 1px solid #dcdfe6;">
                                        <div>{{ param.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                    </td>
                                    <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                        <el-input :value="project.reportData.paramValues[param.id]"
                                                  @input="(val) => (project.reportData.paramValues[param.id] = val)"
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
                                        <div>{{ subCol.label }}</div>
                                        <div style="font-size:12px;color:#666;">{{ subCol.enLabel }}</div>
                                    </th>
                                </template>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in project.reportData.tableData" :key="rowIndex">
                                <td v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id">
                                    <el-input :value="row[col.id]"
                                              @input="(val) => (row[col.id] = val)"
                                              size="small"
                                              :disabled="isDetail"
                                              style="text-align: center; border: none; background: transparent;" />
                                </td>
                                <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                    <template v-if="col.subColumns?.length > 0">
                                        <td v-for="subCol in col.subColumns" :key="subCol.id">
                                            <el-input :value="row[subCol.id]"
                                                      @input="(val) => (row[subCol.id] = val)"
                                                      size="small"
                                                      :disabled="isDetail"
                                                      style="text-align: center; border: none; background: transparent;" />
                                        </td>
                                    </template>
                                    <td v-else>
                                        <el-select v-if="col.label.includes('结论')"
                                                   :model-value="row[col.id]"
                                                   @change="(val) => (row[col.id] = val)"
                                                   size="small"
                                                   :disabled="isDetail"
                                                   style="width: 160px; text-align: center;">
                                            <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                            <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                        </el-select>
                                        <el-input v-else
                                                  :value="row[col.id]"
                                                  @input="(val) => (row[col.id] = val)"
                                                  size="small"
                                                  :disabled="isDetail"
                                                  style="text-align: center; border: none; background: transparent;" />
                                    </td>
                                </template>
                                <td v-if="!isDetail">
                                    <el-button type="link" danger size="small" @click="emit('deleteTableRow', projectIndex, rowIndex)">删除</el-button>
                                </td>
                            </tr>

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
                                                            <el-input :value="project.reportData.bottomRequirement[`${col.id}_${subCol.id}`]"
                                                                      @input="(val) => (project.reportData.bottomRequirement[`${col.id}_${subCol.id}`] = val)"
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

                            <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                <td :colspan="project.schemeConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                    {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                </td>
                                <template v-if="footRow.label.includes('技术要求')">
                                    <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                        <template v-if="col.subColumns?.length > 0">
                                            <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                <el-input :value="project.reportData.techRequirement[subCol.id]"
                                                          @input="(val) => (project.reportData.techRequirement[subCol.id] = val)"
                                                          size="small"
                                                          :disabled="isDetail"
                                                          style="text-align:center; border:none; background:transparent;" />
                                            </td>
                                        </template>
                                        <td v-else style="text-align: center; padding: 8px 12px;">
                                            <el-input :value="project.reportData.techRequirement[col.id]"
                                                      @input="(val) => (project.reportData.techRequirement[col.id] = val)"
                                                      size="small"
                                                      :disabled="isDetail"
                                                      style="text-align:center; border:none; background:transparent;" />
                                        </td>
                                    </template>
                                </template>
                                <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <el-select :model-value="project.reportData.conclusion"
                                               @change="(val) => (project.reportData.conclusion = val)"
                                               :disabled="isDetail"
                                               style="width:200px"
                                               placeholder="请选择">
                                        <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                        <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                    </el-select>
                                </td>
                                <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <el-input :value="project.reportData.note"
                                              @input="(val) => (project.reportData.note = val)"
                                              type="textarea"
                                              :rows="2"
                                              :disabled="isDetail"
                                              style="width:100%; border:none; background:transparent;" />
                                </td>
                                <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <el-input :value="project.reportData[footRow.field || '']"
                                              @input="(val) => (project.reportData[footRow.field || ''] = val)"
                                              :disabled="isDetail"
                                              style="width:100%; border:none; background:transparent;" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="padding: 10px 20px; background: #fafafa;" v-if="!isDetail">
                        <el-button size="small" type="primary" @click="emit('addTableRow', projectIndex)">+ 新增数据行</el-button>
                    </div>

                    <div v-if="project.showPhotoArea" style="margin: 20px;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 15px;">试验照片 / Test Photos</div>
                        <el-button v-if="!isDetail" type="primary" size="small" icon="el-icon-plus" @click="emit('addPhotoRow', projectIndex)">新增照片行（2张/行）</el-button>
                        <div v-for="(row, idx) in project.reportData.photoRows" :key="idx" style="display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-end; position: relative;">
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.LeftUrl" :src="row.LeftUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 1)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 1)" />
                                        <el-button type="text" icon="el-icon-upload" @click="triggerUpload(projectIndex, idx, 1)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <el-button v-if="row.LeftUrl && !isDetail" type="danger" circle size="small" icon="el-icon-close" style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;" @click="deleteSinglePhoto(projectIndex, idx, 1)" />
                                <el-input :value="row.LeftDesc"
                                          @input="(val) => (row.LeftDesc = val)"
                                          :disabled="isDetail"
                                          placeholder="照片描述"
                                          style="margin-top: 8px;" />
                            </div>
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.RightUrl" :src="row.RightUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 2)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 2)" />
                                        <el-button type="text" icon="el-icon-upload" @click="triggerUpload(projectIndex, idx, 2)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <el-button v-if="row.RightUrl && !isDetail" type="danger" circle size="small" icon="el-icon-close" style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;" @click="deleteSinglePhoto(projectIndex, idx, 2)" />
                                <el-input :value="row.RightDesc"
                                          @input="(val) => (row.RightDesc = val)"
                                          :disabled="isDetail"
                                          placeholder="照片描述"
                                          style="margin-top: 8px;" />
                            </div>
                            <el-button v-if="!isDetail" type="danger" icon="el-icon-delete" size="small" style="align-self: center;" @click="emit('removePhotoRow', projectIndex, idx)">删除此行</el-button>
                        </div>
                    </div>

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
                                            <input type="text"
                                                   :value="project.reportData.approval[item.id]"
                                                   @input="(val) => (project.reportData.approval[item.id] = val)"
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
        'equipmentSelect'
    ])

    // 固定模块间距（带默认值）
    const sampleDescMargin = ref(20)
    const clientInfoMargin = ref(20)
    const testEnvMargin = ref(20)
    const testEquipmentMargin = ref(30)
    const projectMargins = ref([])

    // ====================== 终极回显逻辑（兼容所有情况） ======================
    // ====================== 最终正确回显 ======================
    const initMarginsFromData = () => {
        console.log('📌 fixedForm:', props.fixedForm)

        // 🔥 必须用大写 M：MarginSettings（和接口完全一致）
        if (props.fixedForm?.MarginSettings) {
            console.log('✅ 读到间距数据：', props.fixedForm.MarginSettings)

            sampleDescMargin.value = props.fixedForm.MarginSettings.sampleDesc ?? 20
            clientInfoMargin.value = props.fixedForm.MarginSettings.clientInfo ?? 20
            testEnvMargin.value = props.fixedForm.MarginSettings.testEnv ?? 20
            testEquipmentMargin.value = props.fixedForm.MarginSettings.testEquipment ?? 30
        }

        // 项目间距
        if (props.testProjects?.length) {
            projectMargins.value = props.testProjects.map(item => item.ProjectMargin ?? 30)
        }
    }

    // 监听 + 立即执行
    watch(
        () => [props.fixedForm, props.testProjects],
        initMarginsFromData,
        { deep: true, immediate: true }
    )

    // 监听数据变化（保持不变）
    watch(
        () => [props.fixedForm, props.testProjects],
        initMarginsFromData,
        { deep: true, immediate: true }
    )

    // 👇 👇 👇 【必须加】触发器，让函数执行
    watch(
        () => [props.fixedForm, props.testProjects],
        initMarginsFromData,
        { deep: true, immediate: true }
    )

    // 组件挂载时强制执行一次（防止初始化时没触发）
    onMounted(() => {
        console.log('📌 组件挂载，强制执行回显')
        initMarginsFromData()
    })

    // 监听 props 变化，加 immediate: true 确保第一次挂载就触发
    watch(
        () => [props.fixedForm, props.testProjects],
        () => {
            console.log('📌 props 变化，重新执行回显')
            initMarginsFromData()
        },
        { deep: true, immediate: true } // 关键：加了 immediate: true
    )

    // ====================== 导出间距给父组件 ======================
    const getMarginData = () => {
        return {
            fixedMargins: {
                sampleDesc: sampleDescMargin.value,
                clientInfo: clientInfoMargin.value,
                testEnv: testEnvMargin.value,
                testEquipment: testEquipmentMargin.value
            },
            projectMargins: projectMargins.value
        }
    }

    defineExpose({ getMarginData })

    // ====================== 原有业务代码（完全不动） ======================
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
                const url = res.data.url.replace('/uploads/', '/api/upload/image/')
                type === 1 ? (row.LeftUrl = url) : (row.RightUrl = url)
                ElMessage.success('上传成功')
            }
        } catch (err) {
            ElMessage.error('上传失败')
        }
    }
    const deleteSinglePhoto = (projectIndex, rowIndex, type) => {
        const row = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
        type === 1 ? (row.LeftUrl = '', row.LeftDesc = '') : (row.RightUrl = '', row.RightDesc = '')
        ElMessage.success('删除成功')
    }

    const validTestProjects = computed(() => props.testProjects?.filter(Boolean) || [])
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
    }

    .spacing-module:hover .spacing-input {
        opacity: 1;
    }

    .spacing-input span {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
    }

    /* 检测项目悬浮间距框 */
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
    }

    .project-spacing-wrapper:hover .project-input {
        opacity: 1;
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