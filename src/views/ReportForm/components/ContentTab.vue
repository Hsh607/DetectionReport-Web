<template>
    <div>
        <!-- 固定信息区域 -->
        <div class="fixed-info-section" style="border: 1px solid #e6e6e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; background: #fafafa;">
            <div class="fixed-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">1、样品描述/Sample Description</h3>
                <!-- eslint-disable-next-line vue/no-mutating-props -->
                <el-input v-model="fixedForm.sampleDesc" placeholder="请输入样品描述" clearable :disabled="isDetail" />
            </div>

            <div class="fixed-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">2、客户提供信息/Information Provided by Client</h3>
                <el-form :model="fixedForm" label-width="250px" label-position="left" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <el-form-item label="报检单号/Inspection Order No.">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.inspectionOrderNo"
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
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.orderNo" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="技术条件/Material specification">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.materialSpec" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品名称/Sample Name">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.sampleName" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品牌号/Sample Material">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.sampleMaterial" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品规格/Sample Specification">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.sampleSpec" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="其余信息/Additional Information">
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <el-input v-model="fixedForm.additionalInfo" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                </el-form>
            </div>

            <!-- 检测环境表格 -->
            <TestEnvTable :test-env="fixedForm.testEnv"
                          :env-list="envList"
                          :tech-spec-list="techSpecList"
                          :is-detail="isDetail"
                          @add-row="emit('addTestEnvRow')"
                          @delete-row="emit('deleteTestEnvRow', $event)"
                          @project-code-change="emit('projectCodeChange', $event.index, $event.code)"
                          @tech-spec-change="emit('techSpecChange', $event)" />

            <!-- 检测设备表格 -->
            <TestEquipmentTable :test-equipment="fixedForm.testEquipment"
                                :is-detail="isDetail"
                                @add-row="emit('addTestEquipmentRow')"
                                @delete-row="emit('deleteTestEquipmentRow', $event)"
                                @equipment-select="emit('equipmentSelect', $event)" />
        </div>

        <!-- 动态检测项目列表 -->
        <div v-for="(project, projectIndex) in validTestProjects" :key="projectIndex" style="margin-bottom: 30px;">
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
                        <el-input v-model="project.reportData.testReference" :disabled="isDetail" style="flex: 1;" placeholder="请输入检测依据" />
                    </div>
                </div>

                <!-- 参数行（ParamItems） -->
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
                                        <el-input v-model="project.reportData.paramValues[param.id]" placeholder="/" size="small" :disabled="isDetail" class="param-input" />
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 主表格（BaseColumns + ExtendColumns + 操作列） -->
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
                                    <el-input v-model="row[col.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                </td>
                                <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                    <template v-if="col.subColumns?.length > 0">
                                        <td v-for="subCol in col.subColumns" :key="subCol.id">
                                            <el-input v-model="row[subCol.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                        </td>
                                    </template>
                                    <td v-else>
                                        <!-- ✅ 检测结论列：下拉选择框（和尾部结论一致） -->
                                        <el-select v-if="col.label.includes('结论')"
                                                   v-model="row[col.id]"
                                                   size="small"
                                                   :disabled="isDetail"
                                                   style="width: 160px; text-align: center;">
                                            <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                            <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                        </el-select>
                                        <!-- ❌ 其他普通列：保持输入框 -->
                                        <el-input v-else
                                                  v-model="row[col.id]"
                                                  size="small"
                                                  :disabled="isDetail"
                                                  style="text-align: center; border: none; background: transparent;" />
                                    </td>
                                </template>
                                <td v-if="!isDetail">
                                    <el-button type="link" danger size="small" @click="emit('deleteTableRow', projectIndex, rowIndex)">删除</el-button>
                                </td>
                            </tr>

                            <!-- 底部列组（BottomColumns） -->
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
                                                            <el-input v-model="project.reportData.bottomRequirement[`${col.id}_${subCol.id}`]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                                        </td>
                                                    </template>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </template>

                            <!-- 尾部字段（FooterColumns） -->
                            <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                <td :colspan="project.schemeConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                    {{ footRow.label }}
                                    <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                </td>
                                <template v-if="footRow.label.includes('技术要求')">
                                    <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                        <template v-if="col.subColumns?.length > 0">
                                            <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                <el-input v-model="project.reportData.techRequirement[subCol.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                            </td>
                                        </template>
                                        <td v-else style="text-align: center; padding: 8px 12px;">
                                            <el-input v-model="project.reportData.techRequirement[col.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                        </td>
                                    </template>
                                </template>
                                <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <!-- 加上 placeholder="请选择"，和主表格保持一致 -->
                                    <el-select v-model="project.reportData.conclusion" :disabled="isDetail" style="width:200px" placeholder="请选择">
                                        <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                        <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                    </el-select>
                                </td>
                                <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <el-input v-model="project.reportData.note" type="textarea" :rows="2" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                </td>
                                <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                    <el-input v-model="project.reportData[footRow.field || '']" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="padding: 10px 20px; background: #fafafa;" v-if="!isDetail">
                        <el-button size="small" type="primary" @click="emit('addTableRow', projectIndex)">+ 新增数据行</el-button>
                    </div>

                    <!-- 照片区域  -->
                    <!-- 照片区域 - 高辨识度按钮版 -->
                    <div v-if="project.showPhotoArea" style="margin: 20px;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 15px;">试验照片 / Test Photos</div>
                        <el-button v-if="!isDetail" type="primary" size="small" icon="el-icon-plus" @click="emit('addPhotoRow', projectIndex)" style="margin-bottom:15px;">新增照片行（2张/行）</el-button>
                        <div v-for="(row, idx) in project.reportData.photoRows" :key="idx" style="display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-end; position: relative;">
                            <!-- 左侧图片 -->
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.LeftUrl" :src="row.LeftUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 1)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 1)" />
                                        <el-button type="text" icon="el-icon-upload" @click="triggerUpload(projectIndex, idx, 1)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <!-- 优化1：单张图片删除按钮（内部右上角，红底白叉，超大辨识度） -->
                                <el-button v-if="row.LeftUrl && !isDetail"
                                           type="danger"
                                           circle
                                           size="small"
                                           icon="el-icon-close"
                                           title="删除当前图片"
                                           style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    z-index: 10;
                    background-color: #ff4d4f;
                    color: #fff;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    font-size: 18px;
                "
                                           @click="deleteSinglePhoto(projectIndex, idx, 1)" />
                                <el-input v-model="row.LeftDesc" :disabled="isDetail" placeholder="照片描述" style="margin-top: 8px;" />
                            </div>

                            <!-- 右侧图片 -->
                            <div style="flex: 1; position: relative;">
                                <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;">
                                    <img v-if="row.RightUrl" :src="row.RightUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                    <div v-else>
                                        <input :ref="el => setUploadRef(el, projectIndex, idx, 2)" type="file" accept="image/*" style="display:none" @change="uploadPhoto($event, projectIndex, idx, 2)" />
                                        <el-button type="text" icon="el-icon-upload" @click="triggerUpload(projectIndex, idx, 2)" :disabled="isDetail">点击上传</el-button>
                                    </div>
                                </div>
                                <!-- 优化1：单张图片删除按钮（内部右上角，红底白叉，超大辨识度） -->
                                <el-button v-if="row.RightUrl && !isDetail"
                                           type="danger"
                                           circle
                                           size="small"
                                           icon="el-icon-close"
                                           title="删除当前图片"
                                           style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    z-index: 10;
                    background-color: #ff4d4f;
                    color: #fff;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    font-size: 18px;
                "
                                           @click="deleteSinglePhoto(projectIndex, idx, 2)" />
                                <el-input v-model="row.RightDesc" :disabled="isDetail" placeholder="照片描述" style="margin-top: 8px;" />
                            </div>

                            <!-- 优化2：整行删除按钮（带文字+图标，放在行末，一眼看懂） -->
                            <el-button v-if="!isDetail"
                                       type="danger"
                                       icon="el-icon-delete"
                                       size="small"
                                       style="align-self: center; white-space: nowrap;"
                                       @click="emit('removePhotoRow', projectIndex, idx)">
                                删除此行
                            </el-button>
                        </div>
                    </div>

                    <!-- 审批区域 -->
                    <div v-if="project.schemeConfig.ApprovalItems?.length > 0" style="margin: 20px; padding-bottom: 20px;">
                        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                <tr>
                                    <td v-for="item in project.schemeConfig.ApprovalItems" :key="item.id" style="width: calc(100% / project.schemeConfig.ApprovalItems.length); text-align: center;">
                                        <div style="font-weight: 500; margin-bottom: 4px;">{{ item.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ item.enLabel }}</div>
                                        <el-input v-model="project.reportData.approval[item.id]" :disabled="isDetail" size="small" placeholder="请输入" style="text-align: center;" />
                                    </td>
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
    /* globals defineProps, defineEmits */
    import { computed, ref } from 'vue'
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
        'openInspectionDialog',
        'addTestEnvRow', 'deleteTestEnvRow',
        'addTestEquipmentRow', 'deleteTestEquipmentRow',
        'addTableRow', 'deleteTableRow',
        'addPhotoRow', 'removePhotoRow',
        'projectCodeChange', 'techSpecChange'
    ])

    // ===================== 【仅新增：图片上传核心逻辑】 =====================
    // 存储上传文件DOM引用
    const uploadRefs = ref({})
    // 存储上传框引用
    const setUploadRef = (el, projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        if (el) uploadRefs.value[key] = el
    }
    // 触发文件选择
    const triggerUpload = (projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        uploadRefs.value[key]?.click()
    }
    // 上传图片到服务器
    const uploadPhoto = async (e, projectIndex, rowIndex, type) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            ElMessage.error('仅支持上传图片！')
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            ElMessage.error('图片大小不能超过20MB！')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post('/api/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.success) {
                const photoRow = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
                const finalUrl = res.data.url.replace("/uploads/", "/api/upload/image/")

                if (type === 1) photoRow.LeftUrl = finalUrl
                else photoRow.RightUrl = finalUrl

                ElMessage.success('上传成功！')
            } else {
                ElMessage.error(res.data.message || '上传失败')
            }
        } catch (err) {
            ElMessage.error('上传失败')
            console.error(err)
        }
    }

    // 删除单张图片（清空图片地址+描述）
    const deleteSinglePhoto = (projectIndex, rowIndex, type) => {
        const photoRow = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
        if (type === 1) {
            // 清空左侧图片
            photoRow.LeftUrl = ''
            photoRow.LeftDesc = ''
        } else {
            // 清空右侧图片
            photoRow.RightUrl = ''
            photoRow.RightDesc = ''
        }
        ElMessage.success('已删除当前图片')
    }
    // ======================================================================

    const validTestProjects = computed(() => {
        return props.testProjects.filter(project => !!project)
    })
</script>

<style scoped>
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