<template>
    <div class="report-container" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">
            {{ isDetail ? '报告详情' : isEdit ? '编辑检测报告' : '新增检测报告' }}
        </h2>

        <!-- ========== 1. 固定上部信息区 ========== -->
        <div class="fixed-info-section" style="border: 1px solid #e6e6e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; background: #fafafa;">
            <div class="fixed-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">1、样品描述/Sample Description</h3>
                <el-input v-model="fixedForm.sampleDesc" type="textarea" :rows="2" placeholder="请输入样品描述" clearable :disabled="isDetail" />
            </div>

            <div class="fixed-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">2、客户提供信息/Information Provided by Client</h3>
                <el-form :model="fixedForm" label-width="180px" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <el-form-item label="报检单号/Inspection Order No.">
                        <el-input v-model="fixedForm.inspectionOrderNo" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="委托单号/Order No.">
                        <el-input v-model="fixedForm.orderNo" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="技术条件/Material specification">
                        <el-input v-model="fixedForm.materialSpec" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品名称/Sample Name">
                        <el-input v-model="fixedForm.sampleName" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品牌号/Sample Material">
                        <el-input v-model="fixedForm.sampleMaterial" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="样品规格/Sample Specification">
                        <el-input v-model="fixedForm.sampleSpec" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                    <el-form-item label="其余信息/Additional Information" style="grid-column: 1 / -1;">
                        <el-input v-model="fixedForm.additionalInfo" type="textarea" :rows="2" placeholder="请输入" clearable :disabled="isDetail" />
                    </el-form-item>
                </el-form>
            </div>

            <div class="fixed-section" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">3、检测环境/Test Environment</h3>
                <el-button type="primary" size="small" style="margin-bottom: 10px;" @click="addTestEnvRow" :disabled="isDetail">+ 新增行</el-button>
                <el-table :data="fixedForm.testEnv" border stripe style="width: 100%;">
                    <el-table-column label="检测项目编码" prop="projectCode" min-width="130">
                        <template #default="scope">
                            <el-select v-model="scope.row.projectCode"
                                       placeholder="选择项目"
                                       size="small"
                                       clearable
                                       :disabled="isDetail"
                                       @change="(val) => onProjectCodeChange(scope.$index, val)">
                                <el-option v-for="env in envList" :key="env.EnvCode" :label="env.EnvCode" :value="env.EnvCode" />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column label="项目/Item" prop="item" min-width="120">
                        <template #default="scope">
                            <el-input v-model="scope.row.item" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="温度要求（℃）" prop="reqTemp" min-width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.reqTemp" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="检测室温度（℃）" prop="testTemp" min-width="180">
                        <template #default="scope">
                            <el-input v-model="scope.row.testTemp" placeholder="实际温度" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="湿度要求（%RH）" prop="reqHumidity" min-width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.reqHumidity" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="检测室湿度（%RH）" prop="testHumidity" min-width="180">
                        <template #default="scope">
                            <el-input v-model="scope.row.testHumidity" placeholder="实际湿度" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>

                    <el-table-column label="技术要求" prop="techSpecCode" min-width="200">
                        <template #default="scope">
                            <el-select v-model="scope.row.techSpecCode"
                                       placeholder="选择技术要求"
                                       size="small"
                                       clearable
                                       :disabled="isDetail"
                                       @change="(val) => onTechSpecChange(scope.$index, val)">
                                <el-option v-for="t in techSpecList"
                                           :key="t.Id"
                                           :label="t.Name"
                                           :value="t.Id" />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="80" fixed="right">
                        <template #default="scope">
                            <el-button type="link" color="danger" size="small" @click="deleteTestEnvRow(scope.$index)" :disabled="fixedForm.testEnv.length <=1 || isDetail">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="fixed-section">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">4、检测设备/Test Equipment</h3>
                <el-button type="primary" size="small" style="margin-bottom: 10px;" @click="addTestEquipmentRow" :disabled="isDetail">+ 新增行</el-button>
                <el-table :data="fixedForm.testEquipment" border stripe style="width: 100%;">
                    <el-table-column label="序号/No." prop="no" width="80">
                        <template #default="scope">
                            <el-input v-model="scope.row.no" placeholder="" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="设备名称" prop="name" min-width="180">
                        <template #default="scope">
                            <el-input v-model="scope.row.name" placeholder="" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="型号/Model" prop="model" min-width="120">
                        <template #default="scope">
                            <el-input v-model="scope.row.model" placeholder="" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="设备编号" prop="eqNo" min-width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.eqNo" placeholder="" size="small" clearable :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="校准有效期至" prop="validUntil" min-width="180">
                        <template #default="scope">
                            <el-date-picker v-model="scope.row.validUntil" type="date" placeholder="" size="small" style="width: 100%;" :disabled="isDetail" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" fixed="right">
                        <template #default="scope">
                            <el-button type="link" color="danger" size="small" @click="deleteTestEquipmentRow(scope.$index)" :disabled="fixedForm.testEquipment.length <=1 || isDetail">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <!-- 🔥 核心：1:1还原预览样式的动态检测项目区域 -->
        <div v-for="(project, projectIndex) in testProjects" :key="projectIndex" style="margin-bottom: 30px;">
            <div style="border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
                <!-- 1. 黄色标题栏（中英双行，完全匹配预览） -->
                <div style="background: #fff3cd; padding: 12px 20px; border-bottom: 1px solid #e6e6e6;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                        {{ project.schemeConfig?.ProjectTitle || project.techSpecName || '检测项目' }}
                        <template v-if="project.schemeConfig?.ProjectEnTitle">
                            / {{ project.schemeConfig.ProjectEnTitle }}
                        </template>
                    </h3>
                </div>

                <!-- 2. 检测依据行（带输入框，左右对齐，全宽一致） -->
                <div style="padding: 12px 20px; border-bottom: 1px solid #e6e6e6; background: #fff;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500; font-size: 16px; color: #666; white-space: nowrap;">
                            检测依据 / Test Reference：
                        </span>
                        <el-input v-model="project.reportData.testReference"
                                  :disabled="isDetail"
                                  style="flex: 1; max-width: none;"
                                  placeholder="请输入检测依据" />
                    </div>
                </div>

                <!-- 🔥 动态试样参数（尺寸/温度/缺口）同步渲染 -->
                <div v-if="project.schemeConfig?.ParamItems?.length"
                     style="padding: 12px 20px; border-bottom: 1px solid #e6e6e6; background: #fff;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #333;">
                        试样参数 / Sample Parameters
                    </div>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <div v-for="param in project.schemeConfig.ParamItems"
                             :key="param.id"
                             style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-weight: 500; min-width: 100px;">
                                {{ param.label }} / {{ param.enLabel }}：
                            </span>
                            <el-input v-model="project.reportData.paramValues[param.id]"
                                      size="small"
                                      :disabled="isDetail"
                                      style="width: 160px;"
                                      placeholder="请输入" />
                        </div>
                    </div>
                </div>

                <!-- 3. 核心表格（1:1还原预览样式，全宽一致） -->
                <div v-if="project.schemeConfig" style="padding: 0;">
                    <el-table :data="project.reportData.tableData"
                              border
                              style="width: 100%;"
                              :header-cell-style="{ background: '#e0e0e0', fontWeight: 'bold', textAlign: 'center' }"
                              :cell-style="{ textAlign: 'center' }"
                              :show-summary="false">
                        <!-- 基础列（试验编号、检测位置、试样类型） -->
                        <el-table-column v-for="col in project.schemeConfig.BaseColumns"
                                         :key="col.id"
                                         :label="`${col.label}${col.enLabel ? `\n${col.enLabel}` : ''}`"
                                         min-width="120"
                                         :align="'center'">
                            <template #default="scope">
                                <el-input v-model="scope.row[col.id]"
                                          size="small"
                                          :disabled="isDetail"
                                          style="text-align: center; border: none; background: transparent;" />
                            </template>
                        </el-table-column>

                        <!-- 检测结果合并表头（完全匹配预览） -->
                        <el-table-column label="检测结果\nTest Results" min-width="600" align="center">
                            <el-table-column v-for="col in project.schemeConfig.ExtendColumns"
                                             :key="col.id"
                                             :label="`${col.label}${col.enLabel ? `\n${col.enLabel}` : ''}`"
                                             min-width="120"
                                             align="center">
                                <template #default="scope">
                                    <el-input v-model="scope.row[col.id]"
                                              size="small"
                                              :disabled="isDetail"
                                              style="text-align: center; border: none; background: transparent;" />
                                </template>
                            </el-table-column>
                        </el-table-column>

                        <!-- 操作列（仅编辑页显示） -->
                        <el-table-column v-if="!isDetail" label="操作" width="100" fixed="right" align="center">
                            <template #default="scope">
                                <el-button type="link"
                                           danger
                                           size="small"
                                           @click="() => deleteTableRow(projectIndex, scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 4. 技术要求、结论、备注行（1:1还原预览表格行，全宽一致） -->
                    <el-table :data="[{ key: 'techRequirement' }]"
                              border
                              style="width: 100%; margin-top: -1px;"
                              :header-cell-style="{ display: 'none' }"
                              :cell-style="{ textAlign: 'left', padding: '8px 12px' }">
                        <!-- 技术要求行 -->
                        <el-table-column label="技术要求" min-width="200" :align="'left'">
                            <template #default>
                                <span style="font-weight: bold;">技术要求/Requirement(s)</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-for="col in project.schemeConfig.ExtendColumns"
                                         :key="col.id"
                                         min-width="120"
                                         align="center">
                            <template #default>
                                <el-input v-model="project.reportData.techRequirement[col.id]"
                                          size="small"
                                          :disabled="isDetail"
                                          style="text-align: center; border: none; background: transparent;" />
                            </template>
                        </el-table-column>
                        <el-table-column v-if="!isDetail" width="100" fixed="right" />
                    </el-table>

                    <!-- 结论行（合并列，完全匹配预览） -->
                    <el-table :data="[{ key: 'conclusion' }]"
                              border
                              style="width: 100%; margin-top: -1px;"
                              :header-cell-style="{ display: 'none' }"
                              :cell-style="{ textAlign: 'left', padding: '8px 12px' }">
                        <el-table-column label="结论" min-width="200" align="left">
                            <template #default>
                                <span style="font-weight: bold;">结论/Conclusion</span>
                            </template>
                        </el-table-column>
                        <el-table-column :colspan="project.schemeConfig.ExtendColumns.length + project.schemeConfig.BaseColumns.length - (isDetail ? 0 : 1)"
                                         align="center">
                            <template #default>
                                <el-select v-model="project.reportData.conclusion" :disabled="isDetail" style="width: 200px;">
                                    <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                    <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="!isDetail" width="100" fixed="right" />
                    </el-table>

                    <!-- 备注行（合并列，完全匹配预览） -->
                    <el-table :data="[{ key: 'note' }]"
                              border
                              style="width: 100%; margin-top: -1px;"
                              :header-cell-style="{ display: 'none' }"
                              :cell-style="{ textAlign: 'left', padding: '8px 12px' }">
                        <el-table-column label="备注" min-width="200" align="left">
                            <template #default>
                                <span style="font-weight: bold;">备注/Note</span>
                            </template>
                        </el-table-column>
                        <el-table-column :colspan="project.schemeConfig.ExtendColumns.length + project.schemeConfig.BaseColumns.length - (isDetail ? 0 : 1)"
                                         align="left">
                            <template #default>
                                <el-input v-model="project.reportData.note"
                                          type="textarea"
                                          :rows="2"
                                          :disabled="isDetail"
                                          style="width: 100%; border: none; background: transparent;" />
                            </template>
                        </el-table-column>
                        <el-table-column v-if="!isDetail" width="100" fixed="right" />
                    </el-table>

                    <!-- 新增数据行按钮 -->
                    <div style="padding: 10px 20px; background: #fafafa;" v-if="!isDetail">
                        <el-button size="small" type="primary" @click="() => addTableRow(projectIndex)">
                            + 新增数据行
                        </el-button>
                    </div>
                </div>

                <!-- 无模板提示 -->
                <div v-else style="color: #999; padding: 30px; text-align: center;">
                    请在检测环境中选择 检测项目编码 + 技术要求编码，自动加载模板
                </div>
            </div>
        </div>

        <!-- 提交/返回按钮 -->
        <div style="text-align: center; margin-top: 30px; gap:20px; display: flex; justify-content: center;">
            <el-button @click="back">返回列表</el-button>
            <el-button type="primary" size="large" @click="submitReport" :disabled="isDetail || loading">保存报告</el-button>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { ElMessage } from 'element-plus'
    import { useRouter, useRoute } from 'vue-router'
    import axios from 'axios'

    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)

    // 路由参数
    const id = route.query.id
    const isDetail = !!route.query.detail
    const isEdit = !!id && !isDetail

    // 数据字典
    const envList = ref([])
    const techSpecList = ref([])

    // 🔥 修复：初始化完整结构，保证回显兼容
    const fixedForm = reactive({
        sampleDesc: '', inspectionOrderNo: '', orderNo: '', materialSpec: '',
        sampleName: '', sampleMaterial: '', sampleSpec: '', additionalInfo: '',
        testEnv: [{
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', projectId: null, techSpecCode: '', techSpecName: ''
        }],
        testEquipment: [{ no: '', name: '', model: '', eqNo: '', validUntil: '' }]
    })

    // 动态项目
    const testProjects = ref([])

    // 获取技术要求
    const getTechSpecList = async () => {
        try {
            const res = await axios.get('/api/DetectionConfig/enable-tech-requirements')
            if (res.data.Success) techSpecList.value = res.data.Data
        } catch (err) { console.error('获取技术要求失败', err) }
    }

    // 选择检测项目
    const onProjectCodeChange = (rowIndex, envCode) => {
        const row = fixedForm.testEnv[rowIndex]
        const env = envList.value.find(item => item.EnvCode === envCode)
        if (env) {
            row.item = env.ProjectName
            row.reqTemp = env.RequiredTemperature
            row.reqHumidity = env.RequiredHumidity
            row.projectId = env.Id
        }
        matchSchemeAndLoadTemplate(rowIndex)
    }

    // 选择技术要求
    const onTechSpecChange = (rowIndex, val) => {
        const row = fixedForm.testEnv[rowIndex]
        const tech = techSpecList.value.find(t => t.Id === val)
        row.techSpecName = tech ? tech.Name : ''
        matchSchemeAndLoadTemplate(rowIndex)
    }

    // 匹配模板
    const matchSchemeAndLoadTemplate = async (rowIndex) => {
        const row = fixedForm.testEnv[rowIndex]
        const { projectId, techSpecCode } = row
        if (!projectId || !techSpecCode) return

        try {
            const res = await axios.get(`/api/DetectionConfig/scheme-by-id`, { params: { projectId, techSpecCode } })
            if (res.data.Success && res.data.Data) {
                const schemeConfig = JSON.parse(res.data.Data.ConfigContent || '{}')
                testProjects.value[rowIndex] = {
                    projectCode: row.projectCode,
                    techSpecCode,
                    techSpecName: row.techSpecName,
                    schemeConfig,
                    reportData: {
                        testReference: '', // ✅ 这里修复了！
                        header: {},
                        tableData: [],
                        techRequirement: {},
                        conclusion: '符合 / Qualified',
                        note: '',
                        paramValues: {}
                    }
                }
                ElMessage.success('模板加载成功')
            } else {
                ElMessage.warning('未匹配到对应配置模板')
            }
        } catch (err) {
            ElMessage.error('模板查询失败')
            console.error(err)
        }
    }

    // 工具方法
    const addTestEnvRow = () => {
        fixedForm.testEnv.push({
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', projectId: null, techSpecCode: '', techSpecName: ''
        })
        testProjects.value.push({
            projectCode: '',
            techSpecCode: '',
            techSpecName: '',
            schemeConfig: null,
            reportData: {
                testReference: '', // ✅ 修复
                header: {},
                tableData: [],
                techRequirement: {},
                conclusion: '符合 / Qualified',
                note: ''
            }
        })
    }
    const deleteTestEnvRow = (index) => {
        if (fixedForm.testEnv.length <= 1) { ElMessage.warning('至少保留1行！'); return }
        fixedForm.testEnv.splice(index, 1)
        testProjects.value.splice(index, 1)
    }
    const addTestEquipmentRow = () => fixedForm.testEquipment.push({ no: '', name: '', model: '', eqNo: '', validUntil: '' })
    const deleteTestEquipmentRow = (index) => {
        if (fixedForm.testEquipment.length <= 1) { ElMessage.warning('至少保留1行！'); return }
        fixedForm.testEquipment.splice(index, 1)
    }
    const addTableRow = (index) => {
        const project = testProjects.value[index]
        if (!project?.schemeConfig) { ElMessage.warning('请先加载模板'); return }
        const row = {};
        [...project.schemeConfig.BaseColumns, ...project.schemeConfig.ExtendColumns].forEach(col => row[col.id] = '')
        project.reportData.tableData.push(row)
    }
    const deleteTableRow = (pIndex, rIndex) => testProjects.value[pIndex].reportData.tableData.splice(rIndex, 1)
    const back = () => router.push('/report/list')

    // 提交 ✅ 完全修复
    const submitReport = async () => {
        if (!fixedForm.inspectionOrderNo) { ElMessage.warning('请填写报检单号'); return }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) { ElMessage.warning('请完善所有检测环境'); return }

        loading.value = true
        const submitData = { FixedInfo: fixedForm, TestProjects: testProjects.value }
        try {
            const res = isEdit
                ? await axios.put(`/api/DetectionReport/${id}`, submitData)
                : await axios.post('/api/DetectionReport', submitData)
            if (res.data.Success) {
                ElMessage.success('保存成功')
                back()
            } else {
                ElMessage.error(res.data.Message)
            }
        } catch (err) {
            ElMessage.error('保存失败')
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    // ===================== 🔥 核心修复：编辑页回显方法 =====================
    // ===================== 🔥 终极修复：回显方法 =====================
    const getDetail = async () => {
        try {
            const res = await axios.get(`/api/DetectionReport/${id}`)
            if (res.data.Success) {
                const data = res.data.Data;

                fixedForm.sampleDesc = data.FixedInfo?.sampleDesc || ''
                fixedForm.inspectionOrderNo = data.FixedInfo?.inspectionOrderNo || ''
                fixedForm.orderNo = data.FixedInfo?.orderNo || ''
                fixedForm.materialSpec = data.FixedInfo?.materialSpec || ''
                fixedForm.sampleName = data.FixedInfo?.sampleName || ''
                fixedForm.sampleMaterial = data.FixedInfo?.sampleMaterial || ''
                fixedForm.sampleSpec = data.FixedInfo?.sampleSpec || ''
                fixedForm.additionalInfo = data.FixedInfo?.additionalInfo || ''
                fixedForm.testEnv = data.FixedInfo?.testEnv || []
                fixedForm.testEquipment = data.FixedInfo?.testEquipment || []

                // ✅ 终极修复：适配后端大驼峰字段，100%读取
                testProjects.value = (data.TestProjects || []).map(item => {
                    if (typeof item.SchemeConfig === 'string') {
                        item.SchemeConfig = JSON.parse(item.SchemeConfig)
                    }

                    // 后端存的是 ReportData（大驼峰）
                    const rd = item.ReportData || {}

                    item.reportData = {
                        testReference: rd.TestReference || '',
                        tableData: rd.TableData || [],
                        techRequirement: rd.TechRequirement || {},
                        conclusion: rd.Conclusion || '符合 / Qualified',
                        note: rd.Note || ''
                    }

                    // 配置用大驼峰
                    item.schemeConfig = item.SchemeConfig
                    return item
                })

                ElMessage.success('数据加载成功')
            }
        } catch (err) {
            ElMessage.error('加载失败')
            console.error(err)
        }
    }

    // 初始化
    onMounted(() => {
        axios.get('/api/DetectionConfig/env-project-list').then(res => {
            if (res.data.Success) envList.value = res.data.Data
        })
        getTechSpecList()
        if (isEdit || isDetail) getDetail()
    })
</script>

<style scoped>
    .report-container .el-form-item {
        margin-bottom: 15px;
    }

    .el-input__inner {
        text-align: center;
    }

    .el-table__header-wrapper .el-table__cell {
        white-space: pre-line;
    }
</style>