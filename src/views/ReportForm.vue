<template>
    <div class="report-container" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">
            {{ isDetail ? '报告详情' : isEdit ? '编辑检测报告' : '新增检测报告' }}
        </h2>

        <el-tabs v-model="activeTab" type="card" style="margin-bottom: 30px;">
            <el-tab-pane label="报告首页" name="home">
                <div class="home-tab" style="width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 15mm; background: #fff; border: 1px solid #ddd; box-sizing: border-box; position: relative;">
                    <div style="text-align: center; margin-bottom: 20mm;">
                        <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">检测报告</h1>
                        <h2 style="font-size: 28px; font-weight: bold; margin: 0;">TEST REPORT</h2>
                    </div>

                    <el-descriptions :column="1" border label-position="left" size="small" style="width: 100%; margin-bottom: 25mm;">
                        <el-descriptions-item label="委托单位名称 / Client">
                            <el-input v-model="homeForm.ClientName"
                                      type="textarea"
                                      :disabled="isDetail"
                                      :rows="3"
                                      resize="none"
                                      style="min-height:72px;" />
                        </el-descriptions-item>

                        <el-descriptions-item label="委托单位地址 / Client Address">
                            <el-input v-model="homeForm.ClientAddress"
                                      type="textarea"
                                      :disabled="isDetail"
                                      :rows="4"
                                      resize="none"
                                      style="min-height:96px;" />
                        </el-descriptions-item>

                        <el-descriptions-item label="收样日期 / Date of Receipt">
                            <el-date-picker v-model="homeForm.ReceiptDate" type="date" :disabled="isDetail" style="width:100%" />
                        </el-descriptions-item>

                        <el-descriptions-item label="报告日期 / Report Date">
                            <el-date-picker v-model="homeForm.ReportDate" type="date" :disabled="isDetail" style="width:100%" />
                        </el-descriptions-item>
                    </el-descriptions>

                    <div style="font-size: 12px; line-height: 1.7; color: #333; margin-bottom: 20mm;">
                        <p>本报告未加盖本公司检测专用章无效；无编辑、审核、签发人签字无效；涂改无效。生产厂家、规格、炉批号、标准、牌号、样品标识等信息由委托人提供，其真实性由委托人负责。报告仅对来样负责。未经本公司书面同意，不得部分地复制本报告。对测试报告若有异议，请于收到报告之日起十五日内提出。如果报告中的中、英文内容上有矛盾，以中文内容为准。报告封面无CNAS标识时，此报告不做仲裁及相关证明用。</p>
                        <p style="margin-top: 8px;">This report without the company's special seal for testing is invalid. This report is invalid without the signature of the editor, auditor or approver. This report shall be invalid if the content of the report is altered. Sample's information (Manufacturer, Size, Heat No., Lot No, Specification, Grade, Marking.etc.) is submitted by the applicant. Its authenticity is the responsibility of the applicant. This report is only responsible for the test sample. This report shall not be copied partially without the written permission of the company. If you have any objection to the test report, please submit it within 15 days from the date of receiving the report. In case of any discrepancy between the Chinese and English contents of this report, the Chinese contents shall prevail. The report without the mark of CNAS, shall not be used for arbitration or other relevant certification.</p>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="报告内容" name="content">
                <div class="fixed-info-section" style="border: 1px solid #e6e6e6; padding: 20px; border-radius: 8px; margin-bottom: 30px; background: #fafafa;">
                    <div class="fixed-section" style="margin-bottom: 20px;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">1、样品描述/Sample Description</h3>
                        <el-input v-model="fixedForm.sampleDesc" placeholder="请输入样品描述" clearable :disabled="isDetail" />
                    </div>

                    <div class="fixed-section" style="margin-bottom: 20px;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">2、客户提供信息/Information Provided by Client</h3>
                        <el-form :model="fixedForm" label-width="250px" label-position="left" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <el-form-item label="报检单号/Inspection Order No.">
                                <el-input v-model="fixedForm.inspectionOrderNo"
                                          placeholder="点击选择报检单号"
                                          clearable
                                          :disabled="isDetail"
                                          readonly
                                          style="cursor: pointer;"
                                          @click="openInspectionDialog">
                                    <template #append>
                                        <el-button icon="Search" @click="openInspectionDialog" />
                                    </template>
                                </el-input>
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
                            <el-form-item label="其余信息/Additional Information">
                                <el-input v-model="fixedForm.additionalInfo" placeholder="请输入" clearable :disabled="isDetail" />
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
                                        <el-option v-for="env in envList"
                                                   :key="env.EnvCode"
                                                   :label="env.EnvCode"
                                                   :value="env.EnvCode">
                                            <span>{{ env.EnvCode }} - {{ env.ProjectName || '' }}</span>
                                        </el-option>
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

                <div v-for="(project, projectIndex) in validTestProjects"
                     :key="projectIndex"
                     style="margin-bottom: 30px;">
                    <div style="border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
                        <div style="background: #fff3cd; padding: 12px 20px; border-bottom: 1px solid #e6e6e6;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                                {{ project?.schemeConfig?.ProjectTitle || project?.techSpecName || '检测项目' }}
                                <template v-if="project?.schemeConfig?.ProjectEnTitle">
                                    / {{ project.schemeConfig.ProjectEnTitle }}
                                </template>
                            </h3>
                        </div>

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

                        <!-- 🔥 完美对齐版：宽度=表格-操作列 | 左对齐 | 零间距 -->
                        <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0"
                             style="margin: 0; padding: 0; width: 100%;">
                            <table border="1" cellpadding="8" cellspacing="0"
                                   style="width: calc(100% - 80px); border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                                <tbody>
                                    <tr>
                                        <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                            <td style="background: #f5f7fa; font-weight: 600; border: 1px solid #dcdfe6;">
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
                            <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                                <thead>
                                    <tr>
                                        <th v-for="col in project?.schemeConfig?.BaseColumns || []"
                                            :key="col.id"
                                            :rowspan="2"
                                            style="background: #d9d9d9; white-space: pre-line;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                        </th>
                                        <th :colspan="project?.schemeConfig?.ExtendColumns?.length || 0"
                                            :rowspan="1"
                                            style="background: #d9d9d9; white-space: pre-line;">
                                            <div>检测结果</div>
                                            <div style="font-size: 12px; color: #666;">Test Results</div>
                                        </th>
                                        <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                                    </tr>
                                    <tr>
                                        <th v-for="col in project?.schemeConfig?.ExtendColumns || []"
                                            :key="col.id"
                                            style="background: #e6e6e6; white-space: pre-line;">
                                            <div>{{ col.label }}</div>
                                            <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rowIndex) in project.reportData.tableData" :key="rowIndex">
                                        <td v-for="col in project?.schemeConfig?.BaseColumns || []" :key="col.id">
                                            <el-input v-model="row[col.id]"
                                                      size="small"
                                                      :disabled="isDetail"
                                                      style="text-align: center; border: none; background: transparent;" />
                                        </td>
                                        <td v-for="col in project?.schemeConfig?.ExtendColumns || []" :key="col.id">
                                            <el-input v-model="row[col.id]"
                                                      size="small"
                                                      :disabled="isDetail"
                                                      style="text-align: center; border: none; background: transparent;" />
                                        </td>
                                        <td v-if="!isDetail">
                                            <el-button type="link" danger size="small" @click="() => deleteTableRow(projectIndex, rowIndex)">
                                                删除
                                            </el-button>
                                        </td>
                                    </tr>

                                    <tr v-for="(footRow, brIdx) in project?.schemeConfig?.FooterColumns || []"
                                        :key="brIdx"
                                        style="background: #f9f9f9;">
                                        <td :colspan="project?.schemeConfig?.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                            {{ footRow.label }}
                                            <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                        </td>

                                        <template v-if="footRow.label.includes('技术要求')">
                                            <td v-for="col in project?.schemeConfig?.ExtendColumns || []"
                                                :key="col.id"
                                                style="text-align: center; padding: 8px 12px;">
                                                <el-input v-model="project.reportData.techRequirement[col.id]"
                                                          size="small"
                                                          :disabled="isDetail"
                                                          style="text-align:center; border:none; background:transparent;" />
                                            </td>
                                        </template>

                                        <td v-else-if="footRow.label.includes('结论')"
                                            :colspan="(project?.schemeConfig?.ExtendColumns?.length || 0) + (isDetail ? 0 : 1)">
                                            <el-select v-model="project.reportData.conclusion" :disabled="isDetail" style="width:200px">
                                                <el-option label="符合 / Qualified" value="符合 / Qualified" />
                                                <el-option label="不符合 / Unqualified" value="不符合 / Unqualified" />
                                            </el-select>
                                        </td>

                                        <td v-else-if="footRow.label.includes('备注')"
                                            :colspan="(project?.schemeConfig?.ExtendColumns?.length || 0) + (isDetail ? 0 : 1)">
                                            <el-input v-model="project.reportData.note"
                                                      type="textarea"
                                                      :rows="2"
                                                      :disabled="isDetail"
                                                      style="width:100%; border:none; background:transparent;" />
                                        </td>

                                        <td v-else
                                            :colspan="(project?.schemeConfig?.ExtendColumns?.length || 0) + (isDetail ? 0 : 1)">
                                            <el-input v-model="project.reportData[footRow.field || '']"
                                                      :disabled="isDetail"
                                                      style="width:100%; border:none; background:transparent;" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="padding: 10px 20px; background: #fafafa;" v-if="!isDetail">
                                <el-button size="small" type="primary" @click="() => addTableRow(projectIndex)">
                                    + 新增数据行
                                </el-button>
                            </div>

                            <div v-if="project.showPhotoArea" style="margin: 20px;">
                                <div style="font-weight: 600; font-size: 16px; margin-bottom: 15px;">试验照片 / Test Photos</div>
                                <el-button v-if="!isDetail" type="primary" size="small" icon="el-icon-plus" @click="addPhotoRow(projectIndex)" style="margin-bottom:15px;">
                                    新增照片行（2张/行）
                                </el-button>
                                <div v-for="(row, idx) in project.reportData.photoRows" :key="idx" style="display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-end;">
                                    <div style="flex: 1;">
                                        <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa;">
                                            <img v-if="row.LeftUrl" :src="row.LeftUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                            <el-button v-else type="text" icon="el-icon-upload" @click="pickPhoto(projectIndex, idx, 1)" :disabled="isDetail">点击上传</el-button>
                                        </div>
                                        <el-input v-model="row.LeftDesc" :disabled="isDetail" placeholder="照片描述" style="margin-top: 8px;" />
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="border: 1px dashed #ccc; height: 240px; display: flex; align-items: center; justify-content: center; background: #fafafa;">
                                            <img v-if="row.RightUrl" :src="row.RightUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                                            <el-button v-else type="text" icon="el-icon-upload" @click="pickPhoto(projectIndex, idx, 2)" :disabled="isDetail">点击上传</el-button>
                                        </div>
                                        <el-input v-model="row.RightDesc" :disabled="isDetail" placeholder="照片描述" style="margin-top: 8px;" />
                                    </div>
                                    <el-button v-if="!isDetail" type="danger" icon="el-icon-delete" size="mini" @click="removePhotoRow(projectIndex, idx)" />
                                </div>
                            </div>

                            <div v-if="project?.schemeConfig?.ApprovalItems?.length > 0" style="margin: 20px; padding-bottom: 20px;">
                                <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                    <tbody>
                                        <tr>
                                            <td v-for="item in project.schemeConfig.ApprovalItems"
                                                :key="item.id"
                                                style="width: calc(100% / project.schemeConfig.ApprovalItems.length); text-align: center;">
                                                <div style="font-weight: 500; margin-bottom: 4px;">{{ item.label }}</div>
                                                <div style="font-size: 12px; color: #666;">{{ item.enLabel }}</div>
                                                <el-input v-model="project.reportData.approval[item.id]"
                                                          :disabled="isDetail"
                                                          size="small"
                                                          placeholder="请输入"
                                                          style="text-align: center;" />
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
            </el-tab-pane>
        </el-tabs>

        <div style="text-align: center; margin-top: 30px; gap:20px; display: flex; justify-content: center; flex-wrap: wrap;">
            <el-button @click="back">返回列表</el-button>
            <el-button type="primary" size="large" @click="submitReport" :disabled="isDetail || loading">保存报告</el-button>
            <el-button type="success" size="large" @click="exportToWord" :loading="exportLoading">导出Word报告</el-button>
        </div>
    </div>

    <el-dialog v-model="showInspectionDialog"
               title="选择报检单号"
               width="90%"
               :close-on-click-modal="false"
               destroy-on-close
               :append-to-body="true">
        <div style="display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; align-items: center;">
            <el-input v-model="searchForm.inspectionNo"
                      placeholder="报检单号"
                      style="width: 180px;"
                      clearable />
            <el-input v-model="searchForm.orderNo"
                      placeholder="委托单号"
                      style="width: 180px;"
                      clearable />
            <el-input v-model="searchForm.inspector"
                      placeholder="报检人"
                      style="width: 160px;"
                      clearable />
            <el-date-picker v-model="searchForm.dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            style="width: 280px;" />
            <el-button type="primary" @click="loadInspection">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="insList" border stripe style="width:100%;" @row-dblclick="selectInspection">
            <el-table-column label="报检单号" prop="报检单号" min-width="180" align="center" />
            <el-table-column label="报检人" prop="报检人" min-width="120" align="center" />
            <el-table-column label="报检日期" prop="报检日期" min-width="180" align="center" />
            <el-table-column label="委托单号" prop="委托单号" min-width="180" align="center" />
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <el-button type="primary" size="small" @click="selectInspection(row)">选择</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div style="display: flex; justify-content: flex-end; margin-top:15px;">
            <el-pagination v-model:current-page="insPage"
                           v-model:page-size="insSize"
                           :page-sizes="[10,20,50,100]"
                           :total="insTotal"
                           layout="total,sizes,prev,pager,next,jumper"
                           @size-change="loadInspection"
                           @current-change="loadInspection" />
        </div>

        <template #footer>
            <div style="display:flex; justify-content:center; gap:20px;">
                <el-button @click="showInspectionDialog = false">取消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick, watch } from 'vue'
    import { getInspectionList } from '@/api/yunbiaoAuth'
    import { ElMessage } from 'element-plus'
    import { useRouter, useRoute } from 'vue-router'
    import axios from 'axios'
    import { Document, Packer, Paragraph, AlignmentType, ImageRun } from 'docx'
    import { saveAs } from 'file-saver'
    import { computed } from 'vue'

    // 新增：过滤掉无效项目的计算属性
    const validTestProjects = computed(() => {
        return testProjects.value.filter(project => !!project)
    })

    const router = useRouter()
    const route = useRoute()

    const id = route.query.id
    const isDetail = !!route.query.detail
    const isEdit = !!id && !isDetail

    const loading = ref(false)
    const exportLoading = ref(false)
    const activeTab = ref('content')

    const fixedForm = reactive({
        sampleDesc: '',
        inspectionOrderNo: '',
        orderNo: '',
        materialSpec: '',
        sampleName: '',
        sampleMaterial: '',
        sampleSpec: '',
        additionalInfo: '',
        technicalCondition: '',
        clientName: '',
        clientAddress: '',
        testEnv: [{
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        }],
        testEquipment: [{ no: '', name: '', model: '', eqNo: '', validUntil: '' }]
    })

    const homeForm = reactive({
        reportNo: '',
        issueSpace: '',
        ClientName: '',
        ClientAddress: '',
        ReceiptDate: '',
        ReportDate: ''
    })

    const showInspectionDialog = ref(false)
    const insList = ref([])
    const insPage = ref(1)
    const insSize = ref(10)
    const insTotal = ref(0)
    const fullInsList = ref([])

    const searchForm = reactive({
        inspectionNo: '',
        orderNo: '',
        inspector: '',
        dateRange: []
    })

    const envList = ref([])
    const techSpecList = ref([])

    const testProjects = ref([{
        projectCode: '',
        techSpecCode: '',
        techSpecName: '',
        schemeConfig: null,
        showPhotoArea: false,
        reportData: {
            Header: { TestReference: '', TestReferenceEn: '' },
            testReference: '',
            tableData: [],
            techRequirement: {},
            conclusion: '符合 / Qualified',
            note: '',
            reviewer: '',
            approval: {},
            paramValues: {},
            photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
        }
    }])

    watch(
        [() => fixedForm.orderNo, () => fixedForm.inspectionOrderNo],
        async ([newOrderNo, newInspectionNo]) => {
            // 🔥 核心修复：编辑模式(isEdit) 禁止执行！否则会清空技术要求
            if (newOrderNo && !isDetail && !isEdit) {
                await new Promise(r => setTimeout(r, 300));
                await getInspectionListByOrderNo(newOrderNo, newInspectionNo);
                await getAgreementByOrderNo(newOrderNo);
            }
        },
        { immediate: false }
    )

    async function openInspectionDialog() {
        if (isDetail) {
            ElMessage.warning('详情页不可选择报检单')
            return
        }
        showInspectionDialog.value = true
        await nextTick()
        resetSearch()
    }

    async function loadInspection() {
        try {
            if (fullInsList.value.length === 0) {
                const res = await getInspectionList()
                fullInsList.value = res.list
                insTotal.value = res.total
            }

            let list = [...fullInsList.value]

            if (searchForm.inspectionNo)
                list = list.filter(x => (x['报检单号'] || '').includes(searchForm.inspectionNo))
            if (searchForm.orderNo)
                list = list.filter(x => (x['委托单号'] || '').includes(searchForm.orderNo))
            if (searchForm.inspector)
                list = list.filter(x => (x['报检人'] || '').includes(searchForm.inspector))

            if (searchForm.dateRange?.length === 2) {
                const start = searchForm.dateRange[0].getTime()
                const end = searchForm.dateRange[1].getTime()
                list = list.filter(x => {
                    if (!x['报检日期']) return false
                    const time = new Date(x['报检日期']).getTime()
                    return time >= start && time <= end
                })
            }

            insTotal.value = list.length
            const startIdx = (insPage.value - 1) * insSize.value
            const endIdx = startIdx + insSize.value
            insList.value = list.slice(startIdx, endIdx)
        } catch (err) {
            console.error(err)
        }
    }

    function resetSearch() {
        searchForm.inspectionNo = ''
        searchForm.orderNo = ''
        searchForm.inspector = ''
        searchForm.dateRange = []
        insPage.value = 1
        loadInspection()
    }

    function selectInspection(row) {
        fixedForm.inspectionOrderNo = row['报检单号'] || '';
        fixedForm.orderNo = row['委托单号'] || '';
        ElMessage.success('选择成功');
        showInspectionDialog.value = false;
    }

    async function getAgreementByOrderNo(orderNo) {
        try {
            if (!orderNo || orderNo.trim() === '') {
                ElMessage.warning('委托单号为空，无法查询')
                return
            }

            const res = await axios.post('/api/yunbiao/agreement-by-orderno', {
                orderNo: orderNo.trim()
            })

            console.log('委托协议接口返回数据：', res.data)

            if (!res.data || Object.keys(res.data).length === 0) {
                ElMessage.warning('未查询到该委托单号的协议信息')
                return
            }

            const data = res.data

            fixedForm.orderNo = data.委托单号 || ''
            fixedForm.materialSpec = data.技术条件 || ''
            fixedForm.sampleName = data.样品名称 || ''
            fixedForm.sampleMaterial = data.牌号 || ''
            fixedForm.sampleSpec = data.规格 || ''
            fixedForm.additionalInfo = data.其他信息 || ''

            const rawClientName = data.委托单位 || '';
            const clientNameParts = rawClientName.split(/\\r?\\n/).map(p => p.trim()).filter(Boolean);
            homeForm.ClientName = clientNameParts.join('\\n');

            const rawClientAddr = data.委托单位地址 || '';
            const addrParts = rawClientAddr.split(/\\r?\\n/).map(p => p.trim()).filter(Boolean);
            homeForm.ClientAddress = addrParts.join('\\n');

            ElMessage.success('已自动加载委托协议信息')
        } catch (err) {
            console.error('获取委托协议失败：', err)
            const errMsg = err.response?.data || err.message || '服务器异常'
            ElMessage.error('获取委托协议失败：' + (typeof errMsg === 'string' ? errMsg : '服务器内部错误'))
        }
    }

    async function getInspectionListByOrderNo(orderNo, inspectionNo) {
        try {
            if (!orderNo) return;

            const res = await axios.post('/api/yunbiao/inspection-items-by-orderno', {
                orderNo: orderNo,
                inspectionNo: inspectionNo || ""
            });

            const itemList = res.data || [];
            console.log("✅ 已报检项目完整数组：", itemList);

            if (itemList.length === 0) {
                ElMessage.info("未查询到报检项目");
                fixedForm.testEnv = [{
                    item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
                    projectCode: '', techSpecCode: '', techSpecName: ''
                }];
                testProjects.value = [{
                    projectCode: '',
                    techSpecCode: '',
                    techSpecName: '',
                    schemeConfig: null,
                    showPhotoArea: false,
                    reportData: {
                        Header: { TestReference: '', TestReferenceEn: '' },
                        testReference: '',
                        tableData: [],
                        techRequirement: {},
                        conclusion: '符合 / Qualified',
                        note: '',
                        reviewer: '',
                        approval: {},
                        paramValues: {},
                        photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
                    }
                }];
                return;
            }

            fixedForm.testEnv = itemList.map((item) => {
                const projectCode = item["项目编码"] || "";
                const fullName = item["项目名称"] || "";
                const chineseName = fullName.split("\n")[0]?.trim() || "";
                return {
                    item: chineseName,
                    reqTemp: item["温度要求"] || "",
                    testTemp: "",
                    reqHumidity: item["湿度要求"] || "",
                    testHumidity: "",
                    projectCode: projectCode,
                    techSpecCode: "",
                    techSpecName: ""
                };
            });

            testProjects.value = fixedForm.testEnv.map(() => ({
                projectCode: '',
                techSpecCode: '',
                techSpecName: '',
                schemeConfig: null,
                showPhotoArea: false,
                reportData: {
                    Header: { TestReference: '', TestReferenceEn: '' },
                    testReference: '',
                    tableData: [],
                    techRequirement: {},
                    conclusion: '符合 / Qualified',
                    note: '',
                    reviewer: '',
                    approval: {},
                    paramValues: {},
                    photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
                }
            }));

            ElMessage.success(`已自动加载 ${itemList.length} 个检测项目`);
        } catch (err) {
            console.error("接口请求失败：", err);
            ElMessage.error("查询已报检项目失败");
        }
    }

    const getTechSpecList = async () => {
        try {
            const res = await axios.get('/api/DetectionConfig/enable-tech-requirements')
            if (res.data.Success) techSpecList.value = res.data.Data
        } catch (err) { console.error('获取技术要求失败', err) }
    }

    const onProjectCodeChange = (rowIndex, envCode) => {
        const row = fixedForm.testEnv[rowIndex]
        const env = envList.value.find(item => item.EnvCode === envCode)
        if (env) {
            row.item = env.ProjectName
            row.reqTemp = env.RequiredTemperature
            row.reqHumidity = env.RequiredHumidity
        }
        matchSchemeAndLoadTemplate(rowIndex)
    }

    const onTechSpecChange = (rowIndex, val) => {
        const row = fixedForm.testEnv[rowIndex]
        const tech = techSpecList.value.find(t => t.Id === val)
        row.techSpecName = tech ? tech.Name : ''
        matchSchemeAndLoadTemplate(rowIndex)
    }

    const matchSchemeAndLoadTemplate = async (rowIndex) => {
        if (!fixedForm.testEnv[rowIndex] || !testProjects.value[rowIndex]) {
            console.warn("索引越界，跳过模板加载：", rowIndex);
            return;
        }

        const row = fixedForm.testEnv[rowIndex];
        const { projectCode, techSpecCode } = row;

        if (!projectCode || !techSpecCode) return;

        try {
            const res = await axios.get(`/api/DetectionConfig/scheme-by-code`, {
                params: { projectCode, techSpecCode }
            });

            if (res.data.Success && res.data.Data) {
                const schemeConfig = JSON.parse(res.data.Data.ConfigContent || "{}");

                if (!testProjects.value[rowIndex]) {
                    testProjects.value[rowIndex] = {
                        projectCode: "",
                        techSpecCode: "",
                        techSpecName: "",
                        schemeConfig: null,
                        showPhotoArea: false,
                        reportData: {},
                    };
                }

                testProjects.value[rowIndex] = {
                    ...testProjects.value[rowIndex],
                    projectCode: row.projectCode,
                    techSpecCode: techSpecCode,
                    techSpecName: row.techSpecName,
                    schemeConfig: schemeConfig,
                    showPhotoArea: schemeConfig.PhotoConfig?.enabled ?? false,
                    reportData: {
                        Header: { TestReference: "", TestReferenceEn: "" },
                        testReference: "",
                        tableData: [],
                        techRequirement: {},
                        conclusion: "符合 / Qualified",
                        note: "",
                        reviewer: "",
                        approval: {},
                        paramValues: {},
                        photoRows: [{ LeftUrl: "", LeftDesc: "", RightUrl: "", RightDesc: "" }],
                    },
                };

                ElMessage.success("模板加载成功");
            } else {
                ElMessage.warning("未匹配到对应配置模板");
            }
        } catch (err) {
            ElMessage.error("模板查询失败");
            console.error(err);
        }
    };

    const addPhotoRow = (idx) => {
        testProjects.value[idx].reportData.photoRows.push({ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' })
    }
    const removePhotoRow = (pIdx, rIdx) => {
        const rows = testProjects.value[pIdx].reportData.photoRows
        if (rows.length <= 1) return ElMessage.warning('至少保留一行')
        rows.splice(rIdx, 1)
    }
    const pickPhoto = (pIdx, rIdx, pos) => {
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/*'
        inp.onchange = e => {
            const file = e.target.files[0]
            if (!file) return
            const url = URL.createObjectURL(file)
            const row = testProjects.value[pIdx].reportData.photoRows[rIdx]
            if (pos === 1) row.LeftUrl = url
            if (pos === 2) row.RightUrl = url
        }
        inp.click()
    }

    const addTestEnvRow = () => {
        fixedForm.testEnv.push({
            item: '', reqTemp: '', testTemp: '', reqHumidity: '', testHumidity: '',
            projectCode: '', techSpecCode: '', techSpecName: ''
        })
        testProjects.value.push({
            projectCode: '',
            techSpecCode: '',
            techSpecName: '',
            schemeConfig: null,
            showPhotoArea: false,
            reportData: {
                Header: { TestReference: '', TestReferenceEn: '' },
                testReference: '',
                tableData: [],
                techRequirement: {},
                conclusion: '符合 / Qualified',
                note: '',
                reviewer: '',
                approval: {},
                paramValues: {},
                photoRows: [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
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
        [...(project.schemeConfig.BaseColumns || []), ...(project.schemeConfig.ExtendColumns || [])].forEach(col => row[col.id] = '')
        project.reportData.tableData.push(row)
    }
    const deleteTableRow = (pIndex, rIndex) => {
        if (testProjects.value[pIndex]) {
            testProjects.value[pIndex].reportData.tableData.splice(rIndex, 1)
        }
    }
    const back = () => router.push('/report/list')

    const submitReport = async () => {
        if (!fixedForm.inspectionOrderNo) { ElMessage.warning('请填写报检单号'); return }
        const emptyEnv = fixedForm.testEnv.some(t => !t.projectCode || !t.techSpecCode)
        if (emptyEnv) { ElMessage.warning('请完善所有检测环境'); return }

        loading.value = true
        const submitProjects = testProjects.value.map(p => {
            const data = JSON.parse(JSON.stringify(p))
            data.reportData.Header = {
                TestReference: data.reportData.testReference || '',
                TestReferenceEn: data.schemeConfig?.TestReferenceEn || ''
            }
            return data
        })

        const submitData = {
            HomeInfo: homeForm,
            FixedInfo: fixedForm,
            TestProjects: submitProjects
        }

        try {
            const res = isEdit
                ? await axios.put(`/api/DetectionReport/${id}`, submitData)
                : await axios.post('/api/DetectionReport', submitData)
            if (res.data.Success) { ElMessage.success('保存成功'); back() }
            else ElMessage.error(res.data.Message)
        } catch (err) {
            ElMessage.error('保存失败：' + (err.response?.data?.Message || ''))
            console.error(err)
        } finally { loading.value = false }
    }

    const exportToWord = async () => {
        exportLoading.value = true
        try {
            const children = []
            children.push(new Paragraph({
                text: '检测报告', alignment: AlignmentType.CENTER, spacing: { after: 200 }, run: { bold: true, fontSize: 28 }
            }))
            for (const project of testProjects.value) {
                if (!project?.schemeConfig) continue
                children.push(new Paragraph({
                    text: project.schemeConfig.ProjectTitle || '检测项目', spacing: { after: 200 }, run: { bold: true, fontSize: 24 }
                }))
                children.push(new Paragraph({
                    text: `检测依据：${project.reportData.testReference || ''}`, spacing: { after: 200 }
                }))
                if (project.reportData.photoRows?.length) {
                    children.push(new Paragraph({
                        text: '试验照片', spacing: { before: 200, after: 200 }, run: { bold: true }
                    }))
                    for (const r of project.reportData.photoRows) {
                        if (r.LeftUrl) {
                            const buf = await fetch(r.LeftUrl).then(x => x.arrayBuffer())
                            children.push(new Paragraph({
                                children: [new ImageRun({ data: buf, transformation: { width: 350 } })], alignment: AlignmentType.CENTER
                            }))
                            children.push(new Paragraph({
                                text: r.LeftDesc || '无描述', alignment: AlignmentType.CENTER, spacing: { after: 100 }
                            }))
                        }
                        if (r.RightUrl) {
                            const buf = await fetch(r.RightUrl).then(x => x.arrayBuffer())
                            children.push(new Paragraph({
                                children: [new ImageRun({ data: buf, transformation: { width: 350 } })], alignment: AlignmentType.CENTER
                            }))
                            children.push(new Paragraph({
                                text: r.RightDesc || '无描述', alignment: AlignmentType.CENTER, spacing: { after: 200 }
                            }))
                        }
                    }
                }
            }
            const doc = new Document({ sections: [{ properties: {}, children }] })
            const blob = await Packer.toBlob(doc)
            saveAs(blob, `检测报告_${new Date().toISOString().split('T')[0]}.docx`)
            ElMessage.success('导出成功')
        } catch (e) {
            console.error(e)
            ElMessage.error('导出失败')
        } finally { exportLoading.value = false }
    }

    const getDetail = async () => {
        try {
            const res = await axios.get(`/api/DetectionReport/${id}`)
            if (res.data.Success) {
                const data = res.data.Data
                if (data.HomeInfo) Object.assign(homeForm, data.HomeInfo)
                fixedForm.sampleDesc = data.FixedInfo?.sampleDesc || ''
                fixedForm.inspectionOrderNo = data.FixedInfo?.inspectionOrderNo || ''
                fixedForm.orderNo = data.FixedInfo?.orderNo || ''
                fixedForm.materialSpec = data.FixedInfo?.materialSpec || ''
                fixedForm.sampleName = data.FixedInfo?.sampleName || ''
                fixedForm.sampleMaterial = data.FixedInfo?.sampleMaterial || ''
                fixedForm.sampleSpec = data.FixedInfo?.sampleSpec || ''
                fixedForm.additionalInfo = data.FixedInfo?.additionalInfo || ''

                // 🔥 修复1：techSpecCode 转数字（和下拉框value类型匹配）
                fixedForm.testEnv = (data.FixedInfo?.testEnv || []).map(row => ({
                    ...row,
                    techSpecCode: row.techSpecCode ? Number(row.techSpecCode) : null
                }))
                fixedForm.testEquipment = data.FixedInfo?.testEquipment || []

                testProjects.value = []
                const projects = (data.TestProjects || [])
                for (let item of projects) {
                    if (typeof item.SchemeConfig === 'string') item.SchemeConfig = JSON.parse(item.SchemeConfig)
                    const rd = item.ReportData || {}
                    testProjects.value.push({
                        projectCode: item.projectCode || '',
                        techSpecCode: item.techSpecCode ? Number(item.techSpecCode) : null, // 🔥 修复2：转数字
                        techSpecName: item.techSpecName || '',
                        schemeConfig: item.SchemeConfig,
                        showPhotoArea: item.SchemeConfig?.PhotoConfig?.enabled ?? false,
                        reportData: {
                            Header: rd.Header || { TestReference: '', TestReferenceEn: '' },
                            testReference: rd.TestReference || '',
                            tableData: rd.TableData || [],
                            techRequirement: rd.TechRequirement || {},
                            conclusion: rd.Conclusion || '符合 / Qualified',
                            note: rd.Note || '',
                            reviewer: rd.Reviewer || '',
                            approval: rd.Approval || {},
                            paramValues: rd.ParamValues || {},
                            photoRows: rd.PhotoRows || [{ LeftUrl: '', LeftDesc: '', RightUrl: '', RightDesc: '' }]
                        }
                    })
                }

                // 🔥 修复3：编辑页自动加载检测项目模板（和查看页一致）
                await nextTick()
                testProjects.value.forEach((_, index) => {
                    matchSchemeAndLoadTemplate(index)
                })

                ElMessage.success('加载成功')
            }
        } catch (err) {
            ElMessage.error('加载失败')
            console.error(err)
        }
    }

    onMounted(async () => {
        // 1. 先加载技术要求列表（必须第一步，确保下拉框有选项）
        await getTechSpecList();
        // 2. 再加载环境项目列表
        const envRes = await axios.get('/api/DetectionConfig/env-project-list');
        if (envRes.data.Success) envList.value = envRes.data.Data;
        // 3. 最后加载详情（此时techSpecList已就绪，下拉框能正常选中）
        if (isEdit || isDetail) {
            await getDetail();
        }
    });
</script>
<style scoped>
    .report-container .el-form-item {
        margin-bottom: 15px;
    }

    :deep(.client-input .el-textarea__inner) {
        min-height: 80px !important;
        line-height: 1.8 !important;
        padding: 10px 12px !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        text-align: left !important;
        overflow-y: auto !important;
        &:nth-child(2)

    {
        min-height: 100px !important;
    }

    }

    :deep(.el-input__wrapper),
    :deep(.el-date-picker .el-input__wrapper) {
        min-height: 36px !important;
        display: flex;
        align-items: center;
        padding: 0 12px !important;
    }

    :deep(.el-descriptions__cell) {
        padding: 12px 16px !important;
        min-height: 48px !important;
    }

    :deep(.el-descriptions__label) {
        width: 220px !important;
        line-height: 36px !important;
    }

    :deep(.el-descriptions--column-2 .el-descriptions__label) {
        width: 180px !important;
    }

    /* 🔥 修复参数行输入框样式（解决scoped不生效问题） */
    :deep(.param-input .el-input__wrapper) {
        border: none !important;
        text-align: center !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
    }

    :deep(.param-input .el-input__inner) {
        text-align: center !important;
        padding: 0 !important;
    }
</style>