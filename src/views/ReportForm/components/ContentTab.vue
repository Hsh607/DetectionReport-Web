<template>
  <div>
    <!-- 固定信息区域 -->
    <div
      class="fixed-info-section"
      style="border: 1px solid #e6e6e6; padding: 10px; border-radius: 8px; background: #fafafa;"
    >
      <!-- 1、样品描述 -->
      <div
        class="fixed-section spacing-module"
        :style="{ marginTop: sampleDescMargin + 'mm' }"
      >
        <div
          v-if="!isDetail"
          class="spacing-input"
        >
          <span>间距(mm)</span>
          <el-input-number
            v-model="sampleDescMargin"
            :min="0"
            :max="240"
            :step="2"
            size="small"
            style="width: 80px;"
          />
        </div>
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          1、样品描述/Sample Description
        </h3>
        <el-input
          v-model="localFixedForm.sampleDesc"
          placeholder="请输入样品描述"
          clearable
          :disabled="isDetail"
        />
      </div>

      <!-- 2、客户提供信息 -->
      <div
        class="fixed-section spacing-module"
        :style="{ marginTop: clientInfoMargin + 'mm' }"
      >
        <div
          v-if="!isDetail"
          class="spacing-input"
        >
          <span>间距(mm)</span>
          <el-input-number
            v-model="clientInfoMargin"
            :min="0"
            :max="240"
            :step="2"
            size="small"
            style="width: 80px;"
          />
        </div>
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          2、客户提供信息/Information Provided by Client
        </h3>
        <el-form
          :model="localFixedForm"
          label-width="250px"
          label-position="left"
          style="display: grid; grid-template-columns: 1fr; gap: 15px;"
        >
          <el-form-item label="报检单号/Inspection Order No.">
            <el-input
              v-model="localFixedForm.inspectionOrderNo"
              placeholder="点击选择报检单号"
              clearable
              :disabled="isDetail"
              readonly
              style="cursor: pointer;"
              @click="emit('openInspectionDialog')"
            >
              <template #append>
                <el-button
                  icon="Search"
                  @click="emit('openInspectionDialog')"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="委托单号/Order No.">
            <el-input
              v-model="localFixedForm.orderNo"
              placeholder="请输入"
              clearable
              :disabled="isDetail"
            />
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
            <el-input
              v-model="localFixedForm.sampleName"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="请输入"
              clearable
              :disabled="isDetail"
            />
          </el-form-item>
          <el-form-item label="样品牌号/Sample Material">
            <el-input
              v-model="localFixedForm.sampleMaterial"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="请输入"
              clearable
              :disabled="isDetail"
            />
          </el-form-item>
          <el-form-item label="样品规格/Sample Specification">
            <el-input
              v-model="localFixedForm.sampleSpec"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="请输入"
              clearable
              :disabled="isDetail"
            />
          </el-form-item>
          <el-form-item label="样品信息/Sample Information">
            <el-input
              v-model="localFixedForm.sampleInfo"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="请选择报检单自动填充"
              clearable
              :disabled="isDetail"
              style="font-family: 'Courier New', monospace; font-size: 13px;"
            />
          </el-form-item>
          <el-form-item label="其余信息/Additional Information">
            <el-input
              v-model="localFixedForm.additionalInfo"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="请输入"
              clearable
              :disabled="isDetail"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 检测环境表格 -->
      <div
        class="spacing-module"
        :style="{ marginTop: testEnvMargin + 'mm' }"
      >
        <div
          v-if="!isDetail"
          class="spacing-input"
        >
          <span>间距(mm)</span>
          <el-input-number
            v-model="testEnvMargin"
            :min="0"
            :max="240"
            :step="2"
            size="small"
            style="width: 80px;"
          />
        </div>
        <TestEnvTable
          ref="testEnvTableRef"
          :test-env="localFixedForm.testEnv"
          :env-list="envList"
          :tech-spec-list="techSpecList"
          :is-detail="isDetail"
          :report-status="reportStatus"
          @add-row="emit('addTestEnvRow')"
          @delete-row="emit('deleteTestEnvRow', $event)"
          @project-code-change="emit('projectCodeChange', $event)"
          @tech-spec-change="emit('techSpecChange', $event)"
        />
      </div>

      <!-- 检测设备表格 -->
      <div
        class="spacing-module"
        :style="{ marginTop: testEquipmentMargin + 'mm' }"
      >
        <div
          v-if="!isDetail"
          class="spacing-input"
        >
          <span>间距(mm)</span>
          <el-input-number
            v-model="testEquipmentMargin"
            :min="0"
            :max="240"
            :step="2"
            size="small"
            style="width: 80px;"
          />
        </div>
        <TestEquipmentTable
          :test-equipment="localFixedForm.testEquipment"
          :is-detail="isDetail"
          @add-row="emit('addTestEquipmentRow')"
          @delete-row="emit('deleteTestEquipmentRow', $event)"
          @equipment-select="emit('equipmentSelect', $event)"
        />
      </div>
    </div>

    <!-- 动态检测项目列表 -->
    <div
      class="spacing-module"
      :style="{ marginTop: resultTitleMargin + 'mm' }"
    >
      <div
        v-if="!isDetail"
        class="spacing-input"
      >
        <span>间距(mm)</span>
        <el-input-number
          v-model="resultTitleMargin"
          :min="0"
          :max="240"
          :step="2"
          size="small"
          style="width: 80px;"
        />
      </div>
      <h3 style="font-size: 18px; font-weight: bold; color: #333; margin: 0; padding-bottom: 5px;">
        5、检测结果及检测依据/Test Results and Test Reference
      </h3>
    </div>

    <div
      v-for="(project, projectIndex) in validTestProjects"
      :key="projectIndex"
      :style="{ marginTop: projectMargins[projectIndex] + 'mm' }"
      class="project-spacing-wrapper"
    >
      <!-- 每个检测项目 独立间距输入框 -->
      <div
        v-if="!isDetail"
        class="project-spacing-module"
      >
        <div class="spacing-input project-input">
          <span>项目间距(mm)</span>
          <el-input-number
            v-model="projectMargins[projectIndex]"
            :min="0"
            :max="240"
            :step="2"
            size="small"
            style="width: 100px;"
          />
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
          <div v-if="!(project.reportData.isMetallographicGrouped && project.reportData.metallographicGroups?.length > 0)"
               style="padding: 12px 20px; border-bottom: 1px solid #e6e6e6; background: #fff;">
              <!-- 非外包项目：显示标签 + 输入框 -->
              <div v-if="!isOutsourcedProject(project)"
                   style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 500; font-size: 16px; color: #666; white-space: nowrap;">检测依据 / Test Reference：</span>
                  <el-input v-model="project.reportData.testReference"
                            :disabled="isDetail"
                            style="flex: 1;"
                            placeholder="请输入检测依据" />
              </div>
              <!-- 外包 -->
              <div v-else style="font-size: 16px; color: #333;  padding: 4px 0;">{{ (project.schemeConfig?.TestReference || '试验报告见附件。').trim() }}<span v-if="project.schemeConfig?.TestReferenceEn" class="en-num-font">/ {{ project.schemeConfig.TestReferenceEn.trim() }}</span></div>
          </div>

          <!-- 点腐蚀 / 晶间腐蚀：复制当前表格 -->
          <div v-if="!isDetail
               && (isPittingProject(project) || isIntergranularProject(project))
               && !(project.reportData.isCorrosionGrouped && project.reportData.corrosionGroups?.length>
              0)"
              style="padding: 10px 20px; background: #fafafa; border-top: 1px dashed #dcdfe6;">
              <el-button type="primary" size="small" plain
                         @click="emit('copyCorrosionTableAsGroup', projectIndex)">
                  复制当前表格
              </el-button>
          </div>

          <!-- 非金属夹杂物：单表复制 -->
          <div v-if="!isDetail && (project?.schemeConfig?.ProjectTitle?.includes('非金属夹杂物') || project?.projectCode === 'JCXMHJ-16')
               && !(project.reportData.isInclusionGrouped && project.reportData.inclusionGroups?.length>
              0)"
              style="padding: 10px 20px; background: #fafafa; border-top: 1px dashed #dcdfe6;">
              <el-button type="primary" size="small" plain @click="emit('copyInclusionTableAsGroup', projectIndex)">
                  复制当前表格
              </el-button>
          </div>

          <!-- 化学成分：单表复制 -->
          <div v-if="!isDetail && (project?.schemeConfig?.ProjectTitle?.includes('化学成分') || project?.projectCode ==='JCXMHJ-07' )
               && !(project.reportData.isChemGrouped && project.reportData.chemGroups?.length>
              0)"
              style="padding: 10px 20px; background: #fafafa; border-top: 1px dashed #dcdfe6;">
              <el-button type="primary" size="small" plain @click="emit('copyChemTableAsGroup', projectIndex)">
                  复制当前表格
              </el-button>
          </div>

          <!-- 金相检验：单表复制 -->
          <div v-if="!isDetail && (project?.schemeConfig?.ProjectTitle?.includes('金相') || project?.projectCode?.includes('金相') || project?.projectCode === 'JCXMHJ-09')
               && !(project.reportData.isMetallographicGrouped && project.reportData.metallographicGroups?.length>
              0)"
              style="padding: 10px 20px; background: #fafafa; border-top: 1px dashed #dcdfe6;">
              <el-button type="primary" size="small" plain @click="emit('copyMetallographicTableAsGroup', projectIndex)">
                  复制当前表格
              </el-button>
          </div>

          <!-- 参数行（非冲击/单组冲击使用，在循环外部） -->
          <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length >
              0
              && !(project.reportData.isImpactGrouped   && project.reportData.impactGroups?.length > 0)
              && !(project.reportData.isCorrosionGrouped && project.reportData.corrosionGroups?.length > 0)
              && !(project.reportData.isTensileGrouped  && project.reportData.tensileGroups?.length > 0)
              && !(project.reportData.isFerriteGrouped  && project.reportData.ferriteGroups?.length > 0)
              && !(project.reportData.isVickersGrouped  && project.reportData.vickersGroups?.length > 0)"
              style="margin: 0; padding: 0; width: 100%;">
              <table border="1"
                     cellpadding="8"
                     cellspacing="0"
                     style="width: calc(100% - 80px); border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                  <tbody>
                      <tr>
                          <template v-for="param in project.schemeConfig.ParamItems"
                                    :key="param.id">
                              <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                  <div>{{ param.label }}</div>
                                  <div style="font-size: 12px; color: #666;">
                                      {{ param.enLabel }}
                                  </div>
                              </td>
                              <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                  <el-input v-model="project.reportData.paramValues[param.id]"
                                            type="textarea"
                                            :autosize="{ minRows: 1, maxRows: 5 }"
                                            resize="none"
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

          <div v-if="project?.schemeConfig"
               style="padding: 0;">
              <!-- ========== 冲击多分组分支（冲击多个技术要求分不同表格显示） ========== -->
              <template v-if="project.reportData.isImpactGrouped && project.reportData.impactGroups?.length > 0 && project.projectCode === 'JCXMHJ-06'">
                  <!-- 循环每个分组 -->
                  <div v-for="(group, gIdx) in project.reportData.impactGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 分组间距输入框 -->
                      <div v-if="!isDetail"
                           class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop"
                                               :min="0"
                                               :max="240"
                                               :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>
                      <!-- 参数行：每个分组独立显示（位于表格上方） -->
                      <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0"
                           style="margin: 0; padding: 0; width: 100%;">
                          <table border="1"
                                 cellpadding="8"
                                 cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center; margin: 0; border-bottom: none; border-color: #dcdfe6;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems"
                                                :key="param.id">
                                          <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">
                                                  {{ param.enLabel }}
                                              </div>
                                          </td>
                                          <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                              <el-input :model-value="group.paramValues?.[param.id] ?? project.reportData.paramValues?.[param.id] ?? ''"
                                                        @update:model-value="(v) => {
        group.paramValues = group.paramValues || {}
        group.paramValues[param.id] = v
    }"
                                                        type="textarea"
                                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                                        resize="none"
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
                      <template v-for="gConfig in [getGroupConfig(project, group)]"
                                :key="gConfig.SchemeId">
                          {{ console.log('gConfig.ExtendColumns:', gConfig.ExtendColumns) }}

                          <table border="1"
                                 cellpadding="6"
                                 cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center;">
                              <thead>
                                  <tr>
                                      <th v-for="col in gConfig.BaseColumns || []"
                                          :key="col.id"
                                          :rowspan="2"
                                          style="background: #d9d9d9; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size: 12px; color: #666;">
                                              {{ col.enLabel }}
                                          </div>
                                      </th>
                                      <template v-for="col in gConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <th v-if="col.subColumns?.length > 0"
                                              :colspan="col.subColumns.length"
                                              style="background:#e6e6e6; white-space: pre-line;">
                                              <div>{{ col.label }}</div>
                                              <div style="font-size:12px;color:#666;">
                                                  {{ col.enLabel }}
                                              </div>
                                          </th>
                                          <th v-else
                                              :rowspan="2"
                                              style="background:#e6e6e6; white-space: pre-line;">
                                              <div>{{ col.label }}</div>
                                              <div style="font-size:12px;color:#666;">
                                                  {{ col.enLabel }}
                                              </div>
                                          </th>
                                      </template>
                                      <th v-if="!isDetail"
                                          :rowspan="2"
                                          style="background: #d9d9d9;">
                                          操作
                                      </th>
                                  </tr>
                                  <tr>
                                      <template v-for="col in gConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <th v-for="subCol in col.subColumns || []"
                                              :key="subCol.id"
                                              style="background:#f0f0f0; white-space: pre-line;">
                                              <template v-if="subCol.label && subCol.enLabel && subCol.label !== subCol.enLabel">
                                                  <div>{{ subCol.label }}</div>
                                                  <div style="font-size:12px;color:#666;">
                                                      {{ subCol.enLabel }}
                                                  </div>
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
                                  <tr v-for="(row, rowIndex) in group.tableData"
                                      :key="rowIndex">
                                      <td v-for="col in gConfig.BaseColumns || []"
                                          :key="col.id">
                                          <el-input v-model="row[col.id]"
                                                    size="small"
                                                    :disabled="isDetail"
                                                    style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                      <template v-for="col in gConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <template v-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns"
                                                  :key="subCol.id">
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
                                                  <el-option label="符合 / Pass"
                                                             value="符合 / Pass" />
                                                  <el-option label="不符合 / Fail"
                                                             value="不符合 / Fail" />
                                                  <el-option label="/"
                                                             value="/" />
                                              </el-select>
                                              <el-input v-else
                                                        v-model="row[col.id]"
                                                        size="small"
                                                        :disabled="isDetail"
                                                        style="text-align: center; border: none; background: transparent;" />
                                          </td>
                                      </template>
                                      <td v-if="!isDetail">
                                          <el-button type="link"
                                                     danger
                                                     size="small"
                                                     @click="emit('deleteImpactRow', projectIndex, gIdx, rowIndex)">
                                              删除
                                          </el-button>
                                      </td>
                                  </tr>

                                  <!-- 底部列组 -->
                                  <template v-if="gConfig.BottomColumns?.length > 0">
                                      <tr>
                                          <td :colspan="getTotalColSpan(gConfig)"
                                              style="padding: 0; border: none;">
                                              <table width="100%"
                                                     cellpadding="6"
                                                     cellspacing="0"
                                                     style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                                  <thead>
                                                      <tr style="background: #e6e6e6;">
                                                          <th v-for="col in gConfig.BottomColumns"
                                                              :key="col.id"
                                                              :colspan="col.subColumns?.length || getExtendTotalColSpan(gConfig.ExtendColumns) / gConfig.BottomColumns.length"
                                                              :style="{ width: (100 / gConfig.BottomColumns.length) + '%' }"
                                                              style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                              <div>{{ col.label }}</div>
                                                              <div style="font-size: 12px; color: #666;">
                                                                  {{ col.enLabel }}
                                                              </div>
                                                          </th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                      <tr style="background: #f0f0f0;">
                                                          <template v-for="col in gConfig.BottomColumns"
                                                                    :key="col.id">
                                                              <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(gConfig.ExtendColumns, gConfig.BottomColumns.length))"
                                                                  :key="idx"
                                                                  style="border: 1px solid #dcdfe6;">
                                                                  <div>{{ subCol.label }}</div>
                                                                  <div style="font-size: 12px; color: #666;">
                                                                      {{ subCol.enLabel }}
                                                                  </div>
                                                              </th>
                                                          </template>
                                                      </tr>
                                                      <tr style="background: #fff;">
                                                          <template v-for="col in gConfig.BottomColumns"
                                                                    :key="col.id">
                                                              <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(gConfig.ExtendColumns, gConfig.BottomColumns.length))"
                                                                  :key="idx"
                                                                  style="border: 1px solid #dcdfe6;">
                                                                  <el-input :model-value="getGroupBottomValue(group, subCol)"
                                                                            size="small"
                                                                            :disabled="isDetail"
                                                                            style="text-align: center; border: none; background: transparent;"
                                                                            @update:model-value="(val) => updateGroupBottomValue(group, subCol, val)" />
                                                              </td>
                                                          </template>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                  </template>

                                  <!-- 尾部行 -->
                                  <tr v-for="(footRow, brIdx) in gConfig.FooterColumns || []"
                                      :key="brIdx"
                                      style="background: #f9f9f9;">
                                      <td :colspan="gConfig.BaseColumns?.length || 0"
                                          style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                          {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                      </td>
                                      <template v-if="footRow.label.includes('技术要求')">
                                          <template v-for="col in gConfig.ExtendColumns || []"
                                                    :key="col.id">
                                              <template v-if="col.subColumns?.length > 0">
                                                  <td v-for="subCol in col.subColumns"
                                                      :key="subCol.id"
                                                      style="text-align: center; padding: 8px 12px;">
                                                      <el-input v-model="project.reportData.techRequirement[subCol.id]"
                                                                type="textarea"
                                                                :autosize="{ minRows: 1, maxRows: 5 }"
                                                                resize="none"
                                                                size="small"
                                                                :disabled="isDetail"
                                                                style="text-align:center; border:none; background:transparent;" />
                                                  </td>
                                              </template>
                                              <td v-else
                                                  style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="project.reportData.techRequirement[col.id]"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                      </template>
                                      <td v-else-if="footRow.label.includes('结论')"
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                          <el-select v-model="project.reportData.conclusion"
                                                     :disabled="isDetail"
                                                     style="width:200px"
                                                     placeholder="请选择">
                                              <el-option label="符合 / Pass"
                                                         value="符合 / Pass" />
                                              <el-option label="不符合 / Fail"
                                                         value="不符合 / Fail" />
                                              <el-option label="/"
                                                         value="/" />
                                          </el-select>
                                      </td>
                                      <td v-else-if="footRow.label.includes('备注')"
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                          <el-input v-model="group.note"
                                                    type="textarea"
                                                    :autosize="{ minRows: 2, maxRows: 8 }"
                                                    resize="none"
                                                    :disabled="isDetail"
                                                    style="width:100%; border:none; background:transparent;" />
                                      </td>
                                      <td v-else
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)">
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

              <!-- ========== 室温拉伸多分组分支 ========== -->
              <template v-else-if="project.reportData.isTensileGrouped && project.reportData.tensileGroups?.length > 0">
                  <div v-for="(group, gIdx) in project.reportData.tensileGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 分组间距输入框 -->
                      <div v-if="!isDetail"
                           class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop"
                                               :min="0"
                                               :max="240"
                                               :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 分组标题 + 复制/删除本组按钮 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <div v-if="!isDetail" style="display: flex; gap: 8px;">
                              <el-button type="primary"
                                         size="small"
                                         plain
                                         @click="emit('cloneTensileGroup', projectIndex, gIdx)">
                                  复制本组
                              </el-button>
                              <el-button type="danger"
                                         size="small"
                                         @click="emit('deleteTensileGroup', projectIndex, gIdx)">
                                  删除本组
                              </el-button>
                          </div>
                      </div>

                      <!-- 参数行（如果有 ParamItems） -->
                      <div v-if="project?.schemeConfig?.ParamItems?.length > 0"
                           style="margin: 0; padding: 0; width: 100%;">
                          <table border="1"
                                 cellpadding="8"
                                 cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none; border-color: #dcdfe6;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems"
                                                :key="param.id">
                                          <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">
                                                  {{ param.enLabel }}
                                              </div>
                                          </td>
                                          <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                              <el-input v-model="project.reportData.paramValues[param.id]"
                                                        type="textarea"
                                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                                        resize="none"
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

                      <!-- ========== 主表格（完整复用普通分支结构） ========== -->
                      <table border="1"
                             cellpadding="6"
                             cellspacing="0"
                             style="width: 100%; border-collapse: collapse; text-align: center;">
                          <thead>
                              <tr>
                                  <th v-for="col in project.schemeConfig.BaseColumns || []"
                                      :key="col.id"
                                      :rowspan="2"
                                      style="background: #d9d9d9; white-space: pre-line;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size: 12px; color: #666;">
                                          {{ col.enLabel }}
                                      </div>
                                  </th>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                            :key="col.id">
                                      <th v-if="col.subColumns?.length > 0"
                                          :colspan="col.subColumns.length"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">
                                              {{ col.enLabel }}
                                          </div>
                                      </th>
                                      <th v-else
                                          :rowspan="2"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">
                                              {{ col.enLabel }}
                                          </div>
                                      </th>
                                  </template>
                                  <th v-if="!isDetail"
                                      :rowspan="2"
                                      style="background: #d9d9d9;">
                                      操作
                                  </th>
                              </tr>
                              <tr>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                            :key="col.id">
                                      <th v-for="subCol in col.subColumns || []"
                                          :key="subCol.id"
                                          style="background:#f0f0f0; white-space: pre-line;">
                                          <template v-if="subCol.label && subCol.enLabel && subCol.label !== subCol.enLabel">
                                              <div>{{ subCol.label }}</div>
                                              <div style="font-size:12px;color:#666;">
                                                  {{ subCol.enLabel }}
                                              </div>
                                          </template>
                                          <template v-else>
                                              <div>{{ subCol.label || subCol.enLabel }}</div>
                                          </template>
                                      </th>
                                  </template>
                              </tr>
                          </thead>
                          <tbody>
                              <!-- 数据行：数据源为 group.tableData -->
                              <tr v-for="(row, rowIndex) in group.tableData"
                                  :key="rowIndex">
                                  <td v-for="col in project.schemeConfig.BaseColumns || []"
                                      :key="col.id">
                                      <el-input v-model="row[col.id]"
                                                size="small"
                                                :disabled="isDetail"
                                                style="text-align: center; border: none; background: transparent;" />
                                  </td>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                            :key="col.id">
                                      <template v-if="col.subColumns?.length > 0">
                                          <td v-for="subCol in col.subColumns"
                                              :key="subCol.id">
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
                                              <el-option label="符合 / Pass"
                                                         value="符合 / Pass" />
                                              <el-option label="不符合 / Fail"
                                                         value="不符合 / Fail" />
                                              <el-option label="/"
                                                         value="/" />
                                          </el-select>
                                          <el-input v-else
                                                    v-model="row[col.id]"
                                                    size="small"
                                                    :disabled="isDetail"
                                                    style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                  </template>
                                  <td v-if="!isDetail">
                                      <el-button type="link"
                                                 danger
                                                 size="small"
                                                 @click="emit('deleteTensileRow', projectIndex, gIdx, rowIndex)">
                                          删除
                                      </el-button>
                                  </td>
                              </tr>

                              <!-- 底部列组（BottomColumns） -->
                              <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                                  <tr>
                                      <td :colspan="getTotalColSpan(project.schemeConfig)"
                                          style="padding: 0; border: none;">
                                          <table width="100%"
                                                 cellpadding="6"
                                                 cellspacing="0"
                                                 style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                              <thead>
                                                  <tr style="background: #e6e6e6;">
                                                      <th v-for="col in project.schemeConfig.BottomColumns"
                                                          :key="col.id"
                                                          :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length"
                                                          :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }"
                                                          style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                          <div>{{ col.label }}</div>
                                                          <div style="font-size: 12px; color: #666;">
                                                              {{ col.enLabel }}
                                                          </div>
                                                      </th>
                                                  </tr>
                                              </thead>
                                              <tbody>
                                                  <tr style="background: #f0f0f0;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns"
                                                                :key="col.id">
                                                          <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx"
                                                              style="border: 1px solid #dcdfe6;">
                                                              <div>{{ subCol.label }}</div>
                                                              <div style="font-size: 12px; color: #666;">
                                                                  {{ subCol.enLabel }}
                                                              </div>
                                                          </th>
                                                      </template>
                                                  </tr>
                                                  <tr style="background: #fff;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns"
                                                                :key="col.id">
                                                          <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx"
                                                              style="border: 1px solid #dcdfe6;">
                                                              <!-- 每个分组独立存储 bottomRequirement -->
                                                              <el-input v-model="group.bottomRequirement[`${col.id}_${subCol.id}`]"
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

                              <!-- 尾部行（FooterColumns） -->
                              <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []"
                                  :key="brIdx"
                                  style="background: #f9f9f9;">
                                  <td :colspan="project.schemeConfig.BaseColumns?.length || 0"
                                      style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                      {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                  </td>

                                  <!-- 技术要求行：绑定 group.techRequirements -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <template v-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns"
                                                  :key="subCol.id"
                                                  style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="group.techRequirements[subCol.id || subCol.yunbiaoField]"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <td v-else
                                              style="text-align: center; padding: 8px 12px;">
                                              <el-input v-model="group.techRequirements[col.id || col.yunbiaoField]"
                                                        size="small"
                                                        :disabled="isDetail"
                                                        style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                  </template>

                                  <!-- 结论行：绑定 group.conclusion -->
                                  <td v-else-if="footRow.label.includes('结论')"
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                      <el-select v-model="group.conclusion"
                                                 :disabled="isDetail"
                                                 style="width:200px"
                                                 placeholder="请选择">
                                          <el-option label="符合 / Pass"
                                                     value="符合 / Pass" />
                                          <el-option label="不符合 / Fail"
                                                     value="不符合 / Fail" />
                                          <el-option label="/"
                                                     value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注行：绑定 group.note -->
                                  <td v-else-if="footRow.label.includes('备注')"
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                      <el-input v-model="group.note"
                                                type="textarea"
                                                :autosize="{ minRows: 2, maxRows: 8 }"
                                                resize="none"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他尾部行（如有） -->
                                  <td v-else
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                      <el-input v-model="group[footRow.field || '']"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <!-- 分组独立新增行按钮 -->
                      <div v-if="!isDetail"
                           style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small"
                                     type="primary"
                                     @click="emit('addTensileRow', projectIndex, gIdx)">
                              + 新增数据行
                          </el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 铁素体多分组分支 ========== -->

              <template v-else-if="project.reportData.isFerriteGrouped && project.reportData.ferriteGroups?.length > 0">
                  <div v-for="(group, fIdx) in project.reportData.ferriteGroups"
                       :key="fIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 分组间距输入框 -->
                      <div v-if="!isDetail"
                           class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop"
                                               :min="0"
                                               :max="240"
                                               :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 分组标题 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <el-button v-if="!isDetail"
                                     type="danger"
                                     size="small"
                                     @click="emit('deleteFerriteGroup', projectIndex, fIdx)">
                              删除本组
                          </el-button>
                      </div>

                      <!-- 参数行（如果有 ParamItems） -->
                      <div v-if="project?.schemeConfig?.ParamItems && project.schemeConfig.ParamItems.length > 0">
                          <!-- 复用原有的参数表格渲染 -->
                      </div>
                      <!-- 核心表格 -->
                      <table border="1"
                             cellpadding="6"
                             cellspacing="0"
                             style="width: 100%; border-collapse: collapse; text-align: center;">
                          <thead>
                              <tr>
                                  <th v-for="col in project.schemeConfig.BaseColumns || []"
                                      :key="col.id"
                                      :rowspan="2"
                                      style="background: #d9d9d9;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size: 12px; color: #666;">
                                          {{ col.enLabel }}
                                      </div>
                                  </th>
                                  <th v-for="col in project.schemeConfig.ExtendColumns || []"
                                      :key="col.id"
                                      :rowspan="2"
                                      style="background: #e6e6e6;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size: 12px; color: #666;">
                                          {{ col.enLabel }}
                                      </div>
                                  </th>
                                  <th v-if="!isDetail"
                                      :rowspan="2"
                                      style="background: #d9d9d9;">
                                      操作
                                  </th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(row, rowIndex) in group.tableData"
                                  :key="rowIndex">
                                  <!--  编辑模式：不合并，所有行都显示输入框 -->
                                  <template v-if="!isDetail">
                                      <!-- BaseColumns -->
                                      <td v-for="col in project.schemeConfig.BaseColumns || []"
                                          :key="col.id">
                                          <el-input v-model="row[col.id]"
                                                    size="small"
                                                    style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                      <!-- ExtendColumns -->
                                      <td v-for="col in project.schemeConfig.ExtendColumns || []"
                                          :key="col.id">
                                          <el-input v-model="row[col.id]"
                                                    size="small"
                                                    style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                      <!-- 操作列 -->
                                      <td v-if="!isDetail">
                                          <el-button type="link"
                                                     danger
                                                     size="small"
                                                     @click="emit('deleteFerriteRow', projectIndex, fIdx, rowIndex)">
                                              删除
                                          </el-button>
                                      </td>
                                  </template>
                                  <!-- 详情模式：合并 -->
                                  <template v-else>
                                      <!-- BaseColumns -->
                                      <template v-for="col in project.schemeConfig.BaseColumns || []"
                                                :key="col.id">
                                          <td v-if="isMergeColumn(col) && !shouldShowCell(rowIndex, col.id, group.tableData)"
                                              style="display: none;" />
                                          <td v-else-if="isMergeColumn(col) && shouldShowCell(rowIndex, col.id, group.tableData)"
                                              :rowspan="getRowSpan(rowIndex, col.id, group.tableData)"
                                              style="text-align: center; vertical-align: middle;">
                                              {{ row[col.id] }}
                                          </td>
                                          <td v-else>
                                              {{ row[col.id] }}
                                          </td>
                                      </template>

                                      <!-- ExtendColumns -->
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <td v-if="isMergeColumn(col) && !shouldShowCell(rowIndex, col.id, group.tableData)"
                                              style="display: none;" />
                                          <td v-else-if="isMergeColumn(col) && shouldShowCell(rowIndex, col.id, group.tableData)"
                                              :rowspan="getRowSpan(rowIndex, col.id, group.tableData)"
                                              style="text-align: center; vertical-align: middle;">
                                              {{ row[col.id] }}
                                          </td>
                                          <td v-else>
                                              {{ row[col.id] }}
                                          </td>
                                      </template>
                                  </template>
                              </tr>
                          </tbody>

                          <tfoot>
                              <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns"
                                  :key="brIdx"
                                  style="background: #f9f9f9;">
                                  <td :colspan="(project.schemeConfig.BaseColumns || []).length"
                                      style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                      {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                  </td>

                                  <!-- 技术要求：合并所有扩展列，单格输入 -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <td :colspan="(project.schemeConfig.ExtendColumns || []).length + (isDetail ? 0 : 1)"
                                          style="text-align: center; padding: 8px 12px;">
                                          <el-input v-model="group.techRequirement"
                                                    :disabled="isDetail"
                                                    style="text-align:center; border:none; background:transparent;" />
                                      </td>
                                  </template>

                                  <!-- 结论：下拉 -->
                                  <td v-else-if="footRow.label.includes('结论')"
                                      :colspan="(project.schemeConfig.ExtendColumns || []).length + (isDetail ? 0 : 1)">
                                      <el-select v-model="group.conclusion"
                                                 :disabled="isDetail"
                                                 style="width:200px"
                                                 placeholder="请选择">
                                          <el-option label="符合 / Pass" value="符合 / Pass" />
                                          <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                          <el-option label="/" value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注：textarea -->
                                  <td v-else-if="footRow.label.includes('备注')"
                                      :colspan="(project.schemeConfig.ExtendColumns || []).length + (isDetail ? 0 : 1)">
                                      <el-input v-model="group.note"
                                                type="textarea"
                                                :autosize="{ minRows: 2, maxRows: 8 }"
                                                resize="none"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他 -->
                                  <td v-else
                                      :colspan="(project.schemeConfig.ExtendColumns || []).length + (isDetail ? 0 : 1)">
                                      <el-input v-model="group[footRow.yunbiaoField || footRow.field || '']"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tfoot>
                      </table>

                      <!-- 独立新增行按钮（每个分组独立） -->
                      <div v-if="!isDetail"
                           style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small"
                                     type="primary"
                                     @click="addFerriteTableRow(projectIndex, fIdx)">
                              + 新增数据行
                          </el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 维氏硬度多分组分支 ========== -->
              <template v-else-if="project.reportData.isVickersGrouped && project.reportData.vickersGroups?.length > 0">
                  <div v-for="(group, gIdx) in project.reportData.vickersGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 分组间距输入框 -->
                      <div v-if="!isDetail"
                           class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop"
                                               :min="0"
                                               :max="240"
                                               :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 分组标题 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <span style="font-weight: bold;">试样 {{ group.groupLabel }}</span>
                          <el-button v-if="!isDetail"
                                     type="danger"
                                     size="small"
                                     @click="emit('deleteVickersGroup', projectIndex, gIdx)">
                              删除本组
                          </el-button>
                      </div>

                      <!-- 使用该组的独立配置（复制模板并替换动态列的子列） -->
                      <template v-for="gConfig in [getVickersGroupConfig(project, group)]"
                                :key="gConfig.SchemeId">
                          <!-- 参数行 -->
                          <div v-if="project?.schemeConfig?.ParamItems?.length > 0"
                               style="margin: 0; padding: 0; width: 100%;">
                              <table border="1"
                                     cellpadding="8"
                                     cellspacing="0"
                                     style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none;">
                                  <tbody>
                                      <tr>
                                          <template v-for="param in project.schemeConfig.ParamItems"
                                                    :key="param.id">
                                              <td style="background: #f5f7fa; font-weight: 60; border: 1px solid #dcdfe6;">
                                                  <div>{{ param.label }}</div>
                                                  <div style="font-size: 12px; color: #666;">
                                                      {{ param.enLabel }}
                                                  </div>
                                              </td>
                                              <td style="background: #fff; font-weight: 500; border: 1px solid #dcdfe6;">
                                                  <el-input v-model="project.reportData.paramValues[param.id]"
                                                            type="textarea"
                                                            :autosize="{ minRows: 1, maxRows: 5 }"
                                                            resize="none"
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

                          <!--  动态行模式：切行渲染  -->
                          <table v-if="isVickersDynamicRow(gConfig)"
                                 border="1"
                                 cellpadding="6"
                                 cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center; table-layout: fixed;">
                              <colgroup>
                                  <!-- BaseColumns：每列 10% -->
                                  <col v-for="col in gConfig.BaseColumns || []"
                                       :key="col.id"
                                       style="width: 10%;">
                                  <!-- 结果列：动态算剩余宽度 -->
                                  <col v-for="n in 8"
                                       :key="n"
                                       :style="{ width: getVickersResultColWidth(gConfig) + '%' }">
                              </colgroup>
                              <thead>
                                  <tr>
                                      <!-- ⭐ 循环 BaseColumns，配了什么显示什么（试样编号、检测位置...） -->
                                      <th v-for="col in gConfig.BaseColumns || []"
                                          :key="col.id"
                                          :rowspan="2"
                                          style="background: #d9d9d9;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">
                                              {{ col.enLabel }}
                                          </div>
                                      </th>
                                      <!-- 检测结果：colspan 仍写 8（每 chunk = 4 结果 × 2 列） -->
                                      <th :colspan="8"
                                          style="background: #e6e6e6;">
                                          检测结果<br><span style="font-size:12px;color:#666;">Test Results</span>
                                      </th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <template v-for="(row, rowIndex) in group.tableData"
                                            :key="rowIndex">
                                      <template v-for="(chunk, cIdx) in chunkSubColumns(getVickersResultColumns(group), 4)"
                                                :key="cIdx">
                                          <!-- ========== 数据行 ========== -->
                                          <tr>
                                              <!-- BaseColumns -->
                                              <template v-for="col in gConfig.BaseColumns || []"
                                                        :key="col.id">
                                                  <!-- 试样编号：整组只 rowspan 一次 -->
                                                  <template v-if="isSampleNoColumn(col)">
                                                      <td v-if="rowIndex === 0 && cIdx === 0"
                                                          :rowspan="getSampleRowSpan(group)"
                                                          style="text-align: center; vertical-align: middle; font-weight: 500;">
                                                          {{ row[col.id] }}
                                                      </td>
                                                      <!-- 其他位置不渲染 td -->
                                                  </template>
                                                  <!-- 其他 BaseColumn（检测位置等）：每个 chunk 都显示 -->
                                                  <template v-else>
                                                      <td style="text-align: center; vertical-align: middle;">
                                                          {{ row[col.id] }}
                                                      </td>
                                                  </template>
                                              </template>

                                              <!-- 结果列：序号 rowspan=倍数，原值在当前行 -->
                                              <template v-for="(sc, scIdx) in chunk"
                                                        :key="scIdx">
                                                  <template v-if="sc">
                                                      <td :rowspan="getVickersRowMultiplier(group)"
                                                          style="text-align: right; padding: 2px 4px; font-size: 12px;">
                                                          {{ sc.label }}
                                                      </td>
                                                      <td>
                                                          <el-input v-model="row[sc.id]"
                                                                    size="small"
                                                                    :disabled="isDetail"
                                                                    style="text-align: center; border: none; background: transparent;" />
                                                      </td>
                                                  </template>
                                                  <template v-else>
                                                      <td :rowspan="getVickersRowMultiplier(group)"
                                                          style="background: #fafafa;" />
                                                      <td style="background: #fafafa;" />
                                                  </template>
                                              </template>
                                          </tr>

                                          <!-- ========== 转换行（与数据行配对） ========== -->
                                          <tr v-if="group.enableConversion">
                                              <!-- BaseColumns -->
                                              <template v-for="col in gConfig.BaseColumns || []"
                                                        :key="col.id">
                                                  <!-- 试样编号被 rowspan 覆盖 不渲染 -->
                                                  <template v-if="isSampleNoColumn(col)" />
                                                  <!-- 检测位置：显示"转换值"标签 -->
                                                  <template v-else-if="isPositionColumn(col)">
                                                      <td style="text-align: center; vertical-align: middle; font-size: 12px; color: #666;">
                                                          转换值(HRC)<br>Conversion value
                                                      </td>
                                                  </template>
                                                  <!-- 其他列：留空 -->
                                                  <template v-else>
                                                      <td />
                                                  </template>
                                              </template>

                                              <!-- 转换值：序号被 rowspan 覆盖  只画值 -->
                                              <template v-for="(sc, scIdx) in chunk"
                                                        :key="scIdx">
                                                  <template v-if="sc">
                                                      <td>
                                                          <el-input v-model="row['conv_' + sc.id]"
                                                                    size="small"
                                                                    :disabled="isDetail"
                                                                    style="text-align: center; border: none; background: transparent;" />
                                                      </td>
                                                  </template>
                                                  <template v-else>
                                                      <td style="background: #fafafa;" />
                                                  </template>
                                              </template>
                                          </tr>
                                      </template>
                                  </template>

                                  <!-- ========== Footer 行（保持原样） ========== -->
                                  <tr v-for="(footRow, brIdx) in gConfig.FooterColumns || []"
                                      :key="brIdx"
                                      style="background: #f9f9f9;">
                                      <td style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                          {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                      </td>
                                      <template v-if="footRow.label.includes('技术要求')">
                                          <td :colspan="8"
                                              style="padding: 8px 12px;">
                                              <el-input v-model="group.techRequirement"
                                                        :disabled="isDetail"
                                                        style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                      <td v-else-if="footRow.label.includes('结论')"
                                          :colspan="8"
                                          style="padding: 8px 12px;">
                                          <el-select v-model="group.conclusion"
                                                     :disabled="isDetail"
                                                     style="width: 200px;"
                                                     placeholder="请选择">
                                              <el-option label="符合 / Pass"
                                                         value="符合 / Pass" />
                                              <el-option label="不符合 / Fail"
                                                         value="不符合 / Fail" />
                                              <el-option label="/"
                                                         value="/" />
                                          </el-select>
                                      </td>
                                      <td v-else-if="footRow.label.includes('备注')"
                                          :colspan="8"
                                          style="padding: 8px 12px;">
                                          <el-input v-model="group.note"
                                                    type="textarea"
                                                    :autosize="{ minRows: 2, maxRows: 8 }"
                                                    resize="none"
                                                    :disabled="isDetail"
                                                    style="width:100%; border:none; background:transparent;" />
                                      </td>
                                      <td v-else
                                          :colspan="8"
                                          style="padding: 8px 12px;">
                                          <el-input v-model="group[footRow.field || '']"
                                                    :disabled="isDetail"
                                                    style="width:100%; border:none; background:transparent;" />
                                      </td>
                                  </tr>
                              </tbody>
                          </table>

                          <table v-else
                                 border="1"
                                 cellpadding="6"
                                 cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center;">
                              <thead>
                                  <tr>
                                      <th v-for="col in gConfig.BaseColumns || []"
                                          :key="col.id"
                                          :rowspan="2"
                                          style="background: #d9d9d9; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size: 12px; color: #666;">
                                              {{ col.enLabel }}
                                          </div>
                                      </th>
                                      <template v-for="col in gConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <th v-if="col.subColumns?.length > 0"
                                              :colspan="col.subColumns.length"
                                              style="background:#e6e6e6; white-space: pre-line;">
                                              <div>{{ col.label }}</div>
                                              <div style="font-size:12px;color:#666;">
                                                  {{ col.enLabel }}
                                              </div>
                                          </th>
                                          <th v-else
                                              :rowspan="2"
                                              style="background:#e6e6e6; white-space: pre-line;">
                                              <div>{{ col.label }}</div>
                                              <div style="font-size:12px;color:#666;">
                                                  {{ col.enLabel }}
                                              </div>
                                          </th>
                                      </template>
                                      <th v-if="!isDetail"
                                          :rowspan="2"
                                          style="background: #d9d9d9;">
                                          操作
                                      </th>
                                  </tr>
                                  <tr>
                                      <template v-for="col in gConfig.ExtendColumns || []"
                                                :key="col.id">
                                          <th v-for="subCol in col.subColumns || []"
                                              :key="subCol.id"
                                              style="background:#f0f0f0; white-space: pre-line;">
                                              {{ subCol.label }}
                                          </th>
                                      </template>
                                  </tr>
                              </thead>
                              <tbody>
                                  <template v-for="(row, rowIndex) in group.tableData"
                                            :key="rowIndex">
                                      <!-- ========== 数据行 ========== -->
                                      <tr>
                                          <!-- BaseColumns -->
                                          <template v-for="col in gConfig.BaseColumns || []"
                                                    :key="col.id">
                                              <!-- 试样编号：有转换时 rowspan=2 -->
                                              <template v-if="isSampleNoColumn(col)">
                                                  <td :rowspan="getVickersRowMultiplier(group)"
                                                      style="text-align: center; vertical-align: middle; font-weight: 500;">
                                                      {{ row[col.id] }}
                                                  </td>
                                              </template>
                                              <!-- 其他 BaseColumn：正常输入框 -->
                                              <template v-else>
                                                  <td>
                                                      <el-input v-model="row[col.id]"
                                                                size="small"
                                                                :disabled="isDetail"
                                                                style="text-align: center; border: none; background: transparent;" />
                                                  </td>
                                              </template>
                                          </template>

                                          <!-- ExtendColumns -->
                                          <template v-for="col in gConfig.ExtendColumns || []"
                                                    :key="col.id">
                                              <template v-if="col.subColumns?.length > 0">
                                                  <td v-for="subCol in col.subColumns"
                                                      :key="subCol.id">
                                                      <el-input v-model="row[subCol.id]"
                                                                size="small"
                                                                :disabled="isDetail"
                                                                style="text-align: center; border: none; background: transparent;" />
                                                  </td>
                                              </template>
                                              <td v-else>
                                                  <el-select v-if="col.label && col.label.includes('结论')"
                                                             v-model="row[col.id]"
                                                             size="small"
                                                             :disabled="isDetail"
                                                             style="width: 160px; text-align: center;">
                                                      <el-option label="符合 / Pass"
                                                                 value="符合 / Pass" />
                                                      <el-option label="不符合 / Fail"
                                                                 value="不符合 / Fail" />
                                                      <el-option label="/"
                                                                 value="/" />
                                                  </el-select>
                                                  <el-input v-else
                                                            v-model="row[col.id]"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align: center; border: none; background: transparent;" />
                                              </td>
                                          </template>

                                          <td v-if="!isDetail">
                                              <el-button type="link"
                                                         danger
                                                         size="small"
                                                         @click="emit('deleteVickersRow', projectIndex, gIdx, rowIndex)">
                                                  删除
                                              </el-button>
                                          </td>
                                      </tr>

                                      <!-- ========== 转换行（配对渲染） ========== -->
                                      <tr v-if="group.enableConversion">
                                          <!-- BaseColumns：试样编号被 rowspan 覆盖 → 跳过；检测位置显示"转换值" -->
                                          <template v-for="col in gConfig.BaseColumns || []"
                                                    :key="col.id">
                                              <template v-if="isSampleNoColumn(col)" />
                                              <template v-else-if="isPositionColumn(col)">
                                                  <td style="text-align: center; vertical-align: middle; font-size: 12px; color: #666;">
                                                      转换值(HRC)<br>Conversion value
                                                  </td>
                                              </template>
                                              <template v-else>
                                                  <td />
                                              </template>
                                          </template>

                                          <!-- ExtendColumns：转换值输入框 -->
                                          <template v-for="col in gConfig.ExtendColumns || []"
                                                    :key="col.id">
                                              <template v-if="col.subColumns?.length > 0">
                                                  <td v-for="subCol in col.subColumns"
                                                      :key="subCol.id">
                                                      <el-input v-model="row['conv_' + subCol.id]"
                                                                size="small"
                                                                :disabled="isDetail"
                                                                style="text-align: center; border: none; background: transparent;" />
                                                  </td>
                                              </template>
                                              <td v-else>
                                                  <el-input v-model="row['conv_' + col.id]"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align: center; border: none; background: transparent;" />
                                              </td>
                                          </template>

                                          <!-- 操作列占位 -->
                                          <td v-if="!isDetail" />
                                      </tr>
                                  </template>
                                  <!-- 底部行：技术要求、结论 -->
                                  <!-- 尾部行：从 FooterColumns 读取配置 -->
                                  <tr v-for="(footRow, brIdx) in gConfig.FooterColumns || []"
                                      :key="brIdx"
                                      style="background: #f9f9f9;">
                                      <!-- 左侧标签（从配置读取） -->
                                      <td :colspan="gConfig.BaseColumns?.length || 0"
                                          style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                          {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                      </td>

                                      <!-- 技术要求：维氏特殊处理  合并所有列，只显示一个输入框 -->
                                      <template v-if="footRow.label.includes('技术要求')">
                                          <td :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                              style="padding: 8px 12px;">
                                              <el-input v-model="group.techRequirement"
                                                        :disabled="isDetail"
                                                        style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>

                                      <!-- 结论：合并所有列 -->
                                      <td v-else-if="footRow.label.includes('结论')"
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                          style="padding: 8px 12px;">
                                          <el-select v-model="group.conclusion"
                                                     :disabled="isDetail"
                                                     style="width: 200px;"
                                                     placeholder="请选择">
                                              <el-option label="符合 / Pass"
                                                         value="符合 / Pass" />
                                              <el-option label="不符合 / Fail"
                                                         value="不符合 / Fail" />
                                              <el-option label="/"
                                                         value="/" />
                                          </el-select>
                                      </td>

                                      <!-- 备注：合并所有列 -->
                                      <td v-else-if="footRow.label.includes('备注')"
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                          style="padding: 8px 12px;">
                                          <el-input v-model="group.note"
                                                    type="textarea"
                                                    :autosize="{ minRows: 2, maxRows: 8 }"
                                                    resize="none"
                                                    :disabled="isDetail"
                                                    style="width:100%; border:none; background:transparent;" />
                                      </td>

                                      <!-- 其他尾部字段：合并所有列 -->
                                      <td v-else
                                          :colspan="getExtendTotalColSpan(gConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                          style="padding: 8px 12px;">
                                          <el-input v-model="group[footRow.field || '']"
                                                    :disabled="isDetail"
                                                    style="width:100%; border:none; background:transparent;" />
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </template>

                      <!-- 新增行按钮（分组独立） -->
                      <div v-if="!isDetail"
                           style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small"
                                     type="primary"
                                     @click="emit('addVickersRow', projectIndex, gIdx)">
                              + 新增数据行
                          </el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 非金属夹杂物多分组分支 ========== -->
              <template v-else-if="project.reportData.isInclusionGrouped && project.reportData.inclusionGroups?.length > 0">
                  <div v-for="(group, gIdx) in project.reportData.inclusionGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 间距 -->
                      <div v-if="!isDetail" class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop" :min="0" :max="240" :step="2" size="small" style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 标题 + 复制/删除 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <div v-if="!isDetail" style="display: flex; gap: 8px;">
                              <el-button type="primary" size="small" plain @click="emit('cloneInclusionGroup', projectIndex, gIdx)">复制本组</el-button>
                              <el-button type="danger" size="small" @click="emit('deleteInclusionGroup', projectIndex, gIdx)">删除本组</el-button>
                          </div>
                      </div>

                      <!-- 参数行 -->
                      <div v-if="project?.schemeConfig?.ParamItems?.length > 0" style="margin: 0; padding: 0; width: 100%;">
                          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                          <td style="background: #f5f7fa; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                          </td>
                                          <td style="background: #fff; border: 1px solid #dcdfe6;">
                                              <el-input v-model="project.reportData.paramValues[param.id]" size="small" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" placeholder="/" :disabled="isDetail" class="param-input" />
                                          </td>
                                      </template>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      <!-- 主表 -->
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
                                          <div>{{ subCol.label || subCol.enLabel }}</div>
                                      </th>
                                  </template>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
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
                                          <el-input v-model="row[col.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                  </template>
                                  <td v-if="!isDetail">
                                      <el-button type="link" danger size="small" @click="emit('deleteInclusionRow', projectIndex, gIdx, rowIndex)">删除</el-button>
                                  </td>
                              </tr>

                              <!-- 底部列组 -->
                              <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                                  <tr>
                                      <td :colspan="getTotalColSpan(project.schemeConfig)" style="padding: 0; border: none;">
                                          <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                              <thead>
                                                  <tr style="background: #e6e6e6;">
                                                      <th v-for="col in project.schemeConfig.BottomColumns" :key="col.id"
                                                          :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length"
                                                          :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }"
                                                          style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                          <div>{{ col.label }}</div>
                                                          <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                      </th>
                                                  </tr>
                                              </thead>
                                              <tbody>
                                                  <tr style="background: #f0f0f0;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <div>{{ subCol.label }}</div>
                                                              <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                          </th>
                                                      </template>
                                                  </tr>
                                                  <tr style="background: #fff;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <el-input v-model="group.bottomRequirement[`${col.id}_${subCol.id}`]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                                          </td>
                                                      </template>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </template>

                              <!-- 尾部行：技术要求、结论、备注（绑定 group 级别） -->
                              <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                  <td :colspan="project.schemeConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                      {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                  </td>

                                  <!-- 技术要求：按扩展列展开 -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                          <template v-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="group.techRequirement[subCol.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <td v-else style="text-align: center; padding: 8px 12px;">
                                              <el-input v-model="group.techRequirement[col.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                  </template>

                                  <!-- 结论 -->
                                  <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-select v-model="group.conclusion" :disabled="isDetail" style="width:200px" placeholder="请选择">
                                          <el-option label="符合 / Pass" value="符合 / Pass" />
                                          <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                          <el-option label="/" value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注 -->
                                  <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group.note" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" resize="none" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他 -->
                                  <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group[footRow.field || footRow.id]" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <!-- 新增行 -->
                      <div v-if="!isDetail" style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small" type="primary" @click="emit('addInclusionRow', projectIndex, gIdx)">+ 新增数据行</el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 金相检验多分组分支 ========== -->
              <template v-else-if="(project.reportData.isMetallographicGrouped || project.reportData.metallographicGroups?.length > 0)">
                  <div v-for="(group, gIdx) in project.reportData.metallographicGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 间距 -->
                      <div v-if="!isDetail" class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop" :min="0" :max="240" :step="2" size="small" style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 标题 + 复制/删除本组 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <div v-if="!isDetail" style="display: flex; gap: 8px;">
                              <el-button type="primary" size="small" plain @click="emit('cloneMetallographicGroup', projectIndex, gIdx)">
                                  复制本组
                              </el-button>
                              <el-button type="danger" size="small" @click="emit('deleteMetallographicGroup', projectIndex, gIdx)">
                                  删除本组
                              </el-button>
                          </div>
                      </div>

                      <!-- ⭐ 新增：每组独立的检测依据 ⭐ -->
                      <div style="padding: 10px 20px; background: #fff; border-bottom: 1px solid #e6e6e6;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-weight: 500; font-size: 14px; color: #666; white-space: nowrap;">检测依据 / Test Reference：</span>
                              <el-input v-model="group.testReference"
                                        :disabled="isDetail"
                                        style="flex: 1;"
                                        placeholder="请输入检测依据" />
                          </div>
                      </div>

                      <!-- 参数行 -->
                      <div v-if="project?.schemeConfig?.ParamItems?.length > 0" style="margin: 0; padding: 0; width: 100%;">
                          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                          <td style="background: #f5f7fa; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                          </td>
                                          <td style="background: #fff; border: 1px solid #dcdfe6;">
                                              <el-input v-model="project.reportData.paramValues[param.id]" size="small" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" placeholder="/" :disabled="isDetail" class="param-input" />
                                          </td>
                                      </template>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      <!-- 主表 -->
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
                                          <div>{{ subCol.label || subCol.enLabel }}</div>
                                      </th>
                                  </template>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
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
                                          <el-input v-model="row[col.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                  </template>
                                  <td v-if="!isDetail">
                                      <el-button type="link" danger size="small" @click="emit('deleteMetallographicRow', projectIndex, gIdx, rowIndex)">删除</el-button>
                                  </td>
                              </tr>

                              <!-- 底部列组 -->
                              <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                                  <tr>
                                      <td :colspan="getTotalColSpan(project.schemeConfig)" style="padding: 0; border: none;">
                                          <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                              <thead>
                                                  <tr style="background: #e6e6e6;">
                                                      <th v-for="col in project.schemeConfig.BottomColumns" :key="col.id"
                                                          :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length"
                                                          :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }"
                                                          style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                          <div>{{ col.label }}</div>
                                                          <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                      </th>
                                                  </tr>
                                              </thead>
                                              <tbody>
                                                  <tr style="background: #f0f0f0;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <div>{{ subCol.label }}</div>
                                                              <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                          </th>
                                                      </template>
                                                  </tr>
                                                  <tr style="background: #fff;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <el-input v-model="group.bottomRequirement[`${col.id}_${subCol.id}`]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
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

                                  <!-- 技术要求 -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                          <template v-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="group.techRequirement[subCol.id]"
                                                            type="textarea"
                                                            :autosize="{ minRows: 1, maxRows: 5 }"
                                                            resize="none"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <td v-else style="text-align: center; padding: 8px 12px;">
                                              <el-input v-model="group.techRequirement[col.id]"
                                                        type="textarea"
                                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                                        resize="none"
                                                        size="small"
                                                        :disabled="isDetail"
                                                        style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                  </template>

                                  <!-- 结论 -->
                                  <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-select v-model="group.conclusion" :disabled="isDetail" style="width:200px" placeholder="请选择">
                                          <el-option label="符合 / Pass" value="符合 / Pass" />
                                          <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                          <el-option label="/" value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注 -->
                                  <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group.note" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" resize="none" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他 -->
                                  <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group[footRow.field || footRow.id]" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <!-- 新增行 -->
                      <div v-if="!isDetail" style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small" type="primary" @click="emit('addMetallographicRow', projectIndex, gIdx)">+ 新增数据行</el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 化学成分多分组分支 ========== -->
              <template v-else-if="project.reportData.isChemGrouped && project.reportData.chemGroups?.length > 0">
                  <div v-for="(group, gIdx) in project.reportData.chemGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">

                      <!-- 间距 -->
                      <div v-if="!isDetail" class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop" :min="0" :max="240" :step="2" size="small" style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 标题 + 复制/删除本组 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <div v-if="!isDetail" style="display: flex; gap: 8px;">
                              <el-button type="primary" size="small" plain @click="emit('cloneChemGroup', projectIndex, gIdx)">
                                  复制本组
                              </el-button>
                              <el-button type="danger" size="small" @click="emit('deleteChemGroup', projectIndex, gIdx)">
                                  删除本组
                              </el-button>
                          </div>
                      </div>

                      <!-- 参数行 -->
                      <div v-if="project?.schemeConfig?.ParamItems?.length > 0" style="margin: 0; padding: 0; width: 100%;">
                          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                          <td style="background: #f5f7fa; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                          </td>
                                          <td style="background: #fff; border: 1px solid #dcdfe6;">
                                              <el-input v-model="project.reportData.paramValues[param.id]" size="small" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" placeholder="/" :disabled="isDetail" class="param-input" />
                                          </td>
                                      </template>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      <!-- 主表 -->
                      <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                          <thead>
                              <tr>
                                  <!-- 基础列 -->
                                  <th v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id" :rowspan="2" style="background: #d9d9d9; white-space: pre-line;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                  </th>
                                  <!-- 扩展列 -->
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <th v-if="col.isDynamic"
                                          :colspan="group.dynamicSubColumns?.length || 1"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                      </th>
                                      <th v-else-if="col.subColumns?.length > 0"
                                          :colspan="col.subColumns.length"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                      </th>
                                      <th v-else :rowspan="2"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                      </th>
                                  </template>
                                  <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                              </tr>
                              <tr>
                                  <!-- 动态列的子列 -->
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <template v-if="col.isDynamic">
                                          <th v-for="subCol in (group.dynamicSubColumns || [])" :key="subCol.id" style="background:#f0f0f0; white-space: pre-line;">
                                              {{ subCol.label }}
                                          </th>
                                      </template>
                                      <template v-else-if="col.subColumns?.length > 0">
                                          <th v-for="subCol in col.subColumns" :key="subCol.id" style="background:#f0f0f0; white-space: pre-line;">
                                              {{ subCol.label }}
                                          </th>
                                      </template>
                                  </template>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
                                  <td v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id">
                                      <el-input v-model="row[col.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                  </td>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <template v-if="col.isDynamic">
                                          <td v-for="subCol in (group.dynamicSubColumns || [])" :key="subCol.id">
                                              <el-input v-model="row[subCol.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                          </td>
                                      </template>
                                      <template v-else-if="col.subColumns?.length > 0">
                                          <td v-for="subCol in col.subColumns" :key="subCol.id">
                                              <el-input v-model="row[subCol.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                          </td>
                                      </template>
                                      <td v-else>
                                          <el-select v-if="col.label.includes('结论')"
                                                     v-model="row[col.id]" size="small" :disabled="isDetail"
                                                     style="width: 160px; text-align: center;">
                                              <el-option label="符合 / Pass" value="符合 / Pass" />
                                              <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                              <el-option label="/" value="/" />
                                          </el-select>
                                          <el-input v-else v-model="row[col.id]" size="small" :disabled="isDetail" style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                  </template>
                                  <td v-if="!isDetail">
                                      <el-button type="link" danger size="small" @click="emit('deleteChemRow', projectIndex, gIdx, rowIndex)">
                                          删除
                                      </el-button>
                                  </td>
                              </tr>

                              <!-- 尾部行：技术要求 / 结论 / 备注，绑定本组字段 -->
                              <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []" :key="brIdx" style="background: #f9f9f9;">
                                  <td :colspan="project.schemeConfig.BaseColumns?.length || 0" style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                      {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                  </td>

                                  <!-- 技术要求：按扩展列（含动态子列）展开 -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                          <template v-if="col.isDynamic">
                                              <td v-for="subCol in (group.dynamicSubColumns || [])" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="group.techRequirement[subCol.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <template v-else-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns" :key="subCol.id" style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="group.techRequirement[subCol.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <td v-else style="text-align: center; padding: 8px 12px;">
                                              <el-input v-model="group.techRequirement[col.id]" size="small" :disabled="isDetail" style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                  </template>

                                  <!-- 结论 -->
                                  <td v-else-if="footRow.label.includes('结论')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-select v-model="group.conclusion" :disabled="isDetail" style="width:200px" placeholder="请选择">
                                          <el-option label="符合 / Pass" value="符合 / Pass" />
                                          <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                          <el-option label="/" value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注 -->
                                  <td v-else-if="footRow.label.includes('备注')" :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group.note" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" resize="none" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他 -->
                                  <td v-else :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)" style="padding: 8px 12px;">
                                      <el-input v-model="group[footRow.field || footRow.id]" :disabled="isDetail" style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <!-- 新增行 -->
                      <div v-if="!isDetail" style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small" type="primary" @click="emit('addChemRow', projectIndex, gIdx)">+ 新增数据行</el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 点腐蚀 / 晶间腐蚀多分组分支 ========== -->
              <template v-else-if="project.reportData.isCorrosionGrouped && project.reportData.corrosionGroups?.length > 0">
                  <div v-for="(group, gIdx) in project.reportData.corrosionGroups"
                       :key="gIdx"
                       :style="{ marginTop: (group.marginTop ?? 5) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 分组间距 -->
                      <div v-if="!isDetail" class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>分组间距(mm)</span>
                              <el-input-number v-model="group.marginTop"
                                               :min="0" :max="240" :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 分组标题 + 复制/删除本组 -->
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #ddd;">
                          <div v-if="!isDetail" style="display: flex; gap: 8px;">
                              <el-button type="primary" size="small" plain
                                         @click="emit('cloneCorrosionGroup', projectIndex, gIdx)">
                                  复制本组
                              </el-button>
                              <el-button type="danger" size="small"
                                         @click="emit('deleteCorrosionGroup', projectIndex, gIdx)">
                                  删除本组
                              </el-button>
                          </div>
                      </div>

                      <!-- 参数行 -->
                      <div v-if="project?.schemeConfig?.ParamItems?.length > 0"
                           style="margin: 0; padding: 0; width: 100%;">
                          <table border="1" cellpadding="8" cellspacing="0"
                                 style="width: 100%; border-collapse: collapse; text-align: center; border-bottom: none; border-color: #dcdfe6;">
                              <tbody>
                                  <tr>
                                      <template v-for="param in project.schemeConfig.ParamItems" :key="param.id">
                                          <td style="background: #f5f7fa; border: 1px solid #dcdfe6;">
                                              <div>{{ param.label }}</div>
                                              <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                          </td>
                                          <td style="background: #fff; border: 1px solid #dcdfe6;">
                                              <el-input v-model="project.reportData.paramValues[param.id]"
                                                        type="textarea"
                                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                                        resize="none"
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

                      <!-- 主表格 -->
                      <table border="1" cellpadding="6" cellspacing="0"
                             style="width: 100%; border-collapse: collapse; text-align: center;">
                          <thead>
                              <tr>
                                  <th v-for="col in project.schemeConfig.BaseColumns || []"
                                      :key="col.id" :rowspan="2"
                                      style="background: #d9d9d9; white-space: pre-line;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                  </th>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <th v-if="col.subColumns?.length > 0"
                                          :colspan="col.subColumns.length"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                      </th>
                                      <th v-else :rowspan="2"
                                          style="background:#e6e6e6; white-space: pre-line;">
                                          <div>{{ col.label }}</div>
                                          <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                      </th>
                                  </template>
                                  <th v-if="!isDetail" :rowspan="2" style="background: #d9d9d9;">操作</th>
                              </tr>
                              <tr>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <th v-for="subCol in col.subColumns || []" :key="subCol.id"
                                          style="background:#f0f0f0; white-space: pre-line;">
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
                              <tr v-for="(row, rowIndex) in group.tableData" :key="rowIndex">
                                  <td v-for="col in project.schemeConfig.BaseColumns || []" :key="col.id">
                                      <el-input v-model="row[col.id]" size="small" :disabled="isDetail"
                                                style="text-align: center; border: none; background: transparent;" />
                                  </td>
                                  <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                      <template v-if="col.subColumns?.length > 0">
                                          <td v-for="subCol in col.subColumns" :key="subCol.id">
                                              <el-input v-model="row[subCol.id]" size="small" :disabled="isDetail"
                                                        style="text-align: center; border: none; background: transparent;" />
                                          </td>
                                      </template>
                                      <td v-else>
                                          <el-select v-if="col.label.includes('结论')"
                                                     v-model="row[col.id]" size="small" :disabled="isDetail"
                                                     style="width: 160px; text-align: center;">
                                              <el-option label="符合 / Pass" value="符合 / Pass" />
                                              <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                              <el-option label="/" value="/" />
                                          </el-select>
                                          <el-input v-else v-model="row[col.id]" size="small" :disabled="isDetail"
                                                    style="text-align: center; border: none; background: transparent;" />
                                      </td>
                                  </template>
                                  <td v-if="!isDetail">
                                      <el-button type="link" danger size="small"
                                                 @click="emit('deleteCorrosionRow', projectIndex, gIdx, rowIndex)">
                                          删除
                                      </el-button>
                                  </td>
                              </tr>

                              <!-- 底部列组 -->
                              <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                                  <tr>
                                      <td :colspan="getTotalColSpan(project.schemeConfig)" style="padding: 0; border: none;">
                                          <table width="100%" cellpadding="6" cellspacing="0"
                                                 style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                              <thead>
                                                  <tr style="background: #e6e6e6;">
                                                      <th v-for="col in project.schemeConfig.BottomColumns"
                                                          :key="col.id"
                                                          :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length"
                                                          :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }"
                                                          style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                          <div>{{ col.label }}</div>
                                                          <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                      </th>
                                                  </tr>
                                              </thead>
                                              <tbody>
                                                  <tr style="background: #f0f0f0;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <div>{{ subCol.label }}</div>
                                                              <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                          </th>
                                                      </template>
                                                  </tr>
                                                  <tr style="background: #fff;">
                                                      <template v-for="col in project.schemeConfig.BottomColumns" :key="col.id">
                                                          <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                              :key="idx" style="border: 1px solid #dcdfe6;">
                                                              <el-input v-model="group.bottomRequirement[`${col.id}_${subCol.id}`]"
                                                                        size="small" :disabled="isDetail"
                                                                        style="text-align: center; border: none; background: transparent;" />
                                                          </td>
                                                      </template>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </template>

                              <!-- 尾部行：技术要求合并 / 结论 / 备注，绑定本组字段 -->
                              <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []"
                                  :key="brIdx" style="background: #f9f9f9;">
                                  <td :colspan="project.schemeConfig.BaseColumns?.length || 0"
                                      style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                      {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                                  </td>

                                  <!-- 技术要求：合并整行，绑定本组 techRequirement -->
                                  <template v-if="footRow.label.includes('技术要求')">
                                      <td :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                          style="padding: 8px 12px;">
                                          <el-input :model-value="typeof group.techRequirement === 'string' ? group.techRequirement : ''"
                                                    @update:model-value="(v) => group.techRequirement = v"
                                                    type="textarea"
                                                    :autosize="{ minRows: 1, maxRows: 5 }"
                                                    resize="none"
                                                    size="small"
                                                    :disabled="isDetail"
                                                    style="text-align:center; border:none; background:transparent;" />
                                      </td>
                                  </template>

                                  <!-- 结论 -->
                                  <td v-else-if="footRow.label.includes('结论')"
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                      style="padding: 8px 12px;">
                                      <el-select v-model="group.conclusion" :disabled="isDetail"
                                                 style="width:200px" placeholder="请选择">
                                          <el-option label="符合 / Pass" value="符合 / Pass" />
                                          <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                          <el-option label="/" value="/" />
                                      </el-select>
                                  </td>

                                  <!-- 备注 -->
                                  <td v-else-if="footRow.label.includes('备注')"
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                      style="padding: 8px 12px;">
                                      <el-input v-model="group.note"
                                                type="textarea"
                                                :autosize="{ minRows: 2, maxRows: 8 }"
                                                resize="none"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他 -->
                                  <td v-else
                                      :colspan="getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                      style="padding: 8px 12px;">
                                      <el-input v-model="group[footRow.field || footRow.id]"
                                                :disabled="isDetail"
                                                style="width:100%; border:none; background:transparent;" />
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <!-- 分组独立新增行 -->
                      <div v-if="!isDetail" style="padding: 10px 20px; background: #fafafa;">
                          <el-button size="small" type="primary"
                                     @click="emit('addCorrosionRow', projectIndex, gIdx)">
                              + 新增数据行
                          </el-button>
                      </div>
                  </div>
              </template>

              <!-- ========== 原有普通分支（非冲击 / 单组冲击） ========== -->
              <template v-else>
                  <!-- 室温拉伸单表格模式下：复制当前表格为分组 -->
                  <div v-if="!isDetail && isTensileProject(project)"
                       style="padding: 10px 20px; background: #fafafa; border-top: 1px dashed #dcdfe6;">
                      <el-button type="primary"
                                 size="small"
                                 plain
                                 @click="emit('copyTensileTableAsGroup', projectIndex)">
                          复制当前表格
                      </el-button>
                  </div>


                  <table border="1"
                         cellpadding="6"
                         cellspacing="0"
                         style="width: 100%; border-collapse: collapse; text-align: center;">
                      <thead>
                          <tr>
                              <th v-for="col in project.schemeConfig.BaseColumns || []"
                                  :key="col.id"
                                  :rowspan="2"
                                  style="background: #d9d9d9; white-space: pre-line;">
                                  <div>{{ col.label }}</div>
                                  <div style="font-size: 12px; color: #666;">
                                      {{ col.enLabel }}
                                  </div>
                              </th>
                              <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                        :key="col.id">
                                  <th v-if="col.subColumns?.length > 0"
                                      :colspan="col.subColumns.length"
                                      style="background:#e6e6e6; white-space: pre-line;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size:12px;color:#666;">
                                          {{ col.enLabel }}
                                      </div>
                                  </th>
                                  <th v-else
                                      :rowspan="2"
                                      style="background:#e6e6e6; white-space: pre-line;">
                                      <div>{{ col.label }}</div>
                                      <div style="font-size:12px;color:#666;">
                                          {{ col.enLabel }}
                                      </div>
                                  </th>
                              </template>
                              <th v-if="!isDetail"
                                  :rowspan="2"
                                  style="background: #d9d9d9;">
                                  操作
                              </th>
                          </tr>
                          <tr>
                              <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                        :key="col.id">
                                  <th v-for="subCol in col.subColumns || []"
                                      :key="subCol.id"
                                      style="background:#f0f0f0; white-space: pre-line;">
                                      <template v-if="subCol.label && subCol.enLabel && subCol.label !== subCol.enLabel">
                                          <div>{{ subCol.label }}</div>
                                          <div style="font-size:12px;color:#666;">
                                              {{ subCol.enLabel }}
                                          </div>
                                      </template>
                                      <template v-else>
                                          <div>{{ subCol.label || subCol.enLabel }}</div>
                                      </template>
                                  </th>
                              </template>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="(row, rowIndex) in project.reportData.tableData"
                              :key="rowIndex">
                              <td v-for="col in project.schemeConfig.BaseColumns || []"
                                  :key="col.id">
                                  <el-input v-model="row[col.id]" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" size="small" :disabled="isDetail" style="text-align: center; " />
                              </td>
                              <template v-for="col in project.schemeConfig.ExtendColumns || []"
                                        :key="col.id">
                                  <template v-if="col.subColumns?.length > 0">
                                      <td v-for="subCol in col.subColumns"
                                          :key="subCol.id">
                                          <el-input v-model="row[subCol.id]"
                                                    type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" size="small" :disabled="isDetail" style="text-align: center; " />
                                      </td>
                                  </template>
                                  <td v-else>
                                      <el-select v-if="col.label.includes('结论')"
                                                 v-model="row[col.id]"
                                                 size="small"
                                                 :disabled="isDetail"
                                                 style="width: 160px; text-align: center;">
                                          <el-option label="符合 / Pass"
                                                     value="符合 / Pass" />
                                          <el-option label="不符合 / Fail"
                                                     value="不符合 / Fail" />
                                          <el-option label="/"
                                                     value="/" />
                                      </el-select>
                                      <el-input v-else
                                                v-model="row[col.id]"
                                                type="textarea"
                                                :autosize="{ minRows: 1, maxRows: 5 }"
                                                resize="none"
                                                size="small"
                                                :disabled="isDetail"
                                                style="text-align: center;"
                                                @paste="handleCellPaste($event, project.reportData.tableData, rowIndex, col)" />
                                  </td>
                              </template>
                              <td v-if="!isDetail">
                                  <el-button type="link"
                                             danger
                                             size="small"
                                             @click="emit('deleteTableRow', projectIndex, rowIndex)">
                                      删除
                                  </el-button>
                              </td>
                          </tr>
                          <!-- 底部列组 -->
                          <template v-if="project.schemeConfig.BottomColumns?.length > 0">
                              <tr>
                                  <td :colspan="getTotalColSpan(project.schemeConfig)"
                                      style="padding: 0; border: none;">
                                      <table width="100%"
                                             cellpadding="6"
                                             cellspacing="0"
                                             style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                          <thead>
                                              <tr style="background: #e6e6e6;">
                                                  <th v-for="col in project.schemeConfig.BottomColumns"
                                                      :key="col.id"
                                                      :colspan="col.subColumns?.length || getExtendTotalColSpan(project.schemeConfig.ExtendColumns) / project.schemeConfig.BottomColumns.length"
                                                      :style="{ width: (100 / project.schemeConfig.BottomColumns.length) + '%' }"
                                                      style="border: 1px solid #dcdfe6; font-weight: 600;">
                                                      <div>{{ col.label }}</div>
                                                      <div style="font-size: 12px; color: #666;">
                                                          {{ col.enLabel }}
                                                      </div>
                                                  </th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              <tr style="background: #f0f0f0;">
                                                  <template v-for="col in project.schemeConfig.BottomColumns"
                                                            :key="col.id">
                                                      <th v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                          :key="idx"
                                                          style="border: 1px solid #dcdfe6;">
                                                          <div>{{ subCol.label }}</div>
                                                          <div style="font-size: 12px; color: #666;">
                                                              {{ subCol.enLabel }}
                                                          </div>
                                                      </th>
                                                  </template>
                                              </tr>
                                              <tr style="background: #fff;">
                                                  <template v-for="col in project.schemeConfig.BottomColumns"
                                                            :key="col.id">
                                                      <td v-for="(subCol, idx) in (col.subColumns || getSubColumnsByExtend(project.schemeConfig.ExtendColumns, project.schemeConfig.BottomColumns.length))"
                                                          :key="idx"
                                                          style="border: 1px solid #dcdfe6;">
                                                          <el-input v-model="project.reportData.bottomRequirement[`${col.id}_${subCol.id}`]"
                                                                    type="textarea"
                                                                    :autosize="{ minRows: 1, maxRows: 5 }"
                                                                    resize="none"
                                                                    size="small"
                                                                    :disabled="isDetail"
                                                                    style="text-align: center;" />
                                                      </td>
                                                  </template>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </template>

                          <!-- 尾部行 -->
                          <tr v-for="(footRow, brIdx) in project.schemeConfig.FooterColumns || []"
                              :key="brIdx"
                              style="background: #f9f9f9;">
                              <td :colspan="isBendProject(project) ? 2 : (project.schemeConfig.BaseColumns?.length || 0)"
                                  style="text-align: left; padding: 8px 12px; font-weight: 500;">
                                  {{ footRow.label }} <span v-if="footRow.enLabel">/ {{ footRow.enLabel }}</span>
                              </td>
                              <template v-if="footRow.label.includes('技术要求')">
                                  <!-- 点腐蚀 / 晶间腐蚀：合并为整行一个输入框，绑定单表格自己的字段 -->
                                  <td v-if="isCorrosionProject(project)|| isBendProject(project)"
                                      :colspan="isBendProject(project)
        ? (project.schemeConfig.BaseColumns?.length || 0)
          + getExtendTotalColSpan(project.schemeConfig.ExtendColumns)
          - 2
          + (isDetail ? 0 : 1)
        : getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)"
                                      style="text-align: center; padding: 8px 12px;">
                                      <el-input :model-value="typeof project.reportData.techRequirement === 'string'
        ? project.reportData.techRequirement
        : (project.reportData.techRequirement?.[project.schemeConfig?.ExtendColumns?.[0]?.id]
            || Object.values(project.reportData.techRequirement || {})[0]
            || '')"
                                                @update:model-value="(v) => project.reportData.techRequirement = v"
                                                type="textarea"
                                                :autosize="{ minRows: 1, maxRows: 5 }"
                                                resize="none"
                                                size="small"
                                                :disabled="isDetail"
                                                style="text-align:center; border:none; background:transparent;" />
                                  </td>

                                  <!-- 其他项目：沿用按扩展列拆分 -->
                                  <template v-else>
                                      <template v-for="col in project.schemeConfig.ExtendColumns || []" :key="col.id">
                                          <template v-if="col.subColumns?.length > 0">
                                              <td v-for="subCol in col.subColumns"
                                                  :key="subCol.id"
                                                  style="text-align: center; padding: 8px 12px;">
                                                  <el-input v-model="project.reportData.techRequirement[subCol.id]"
                                                            type="textarea"
                                                            :autosize="{ minRows: 1, maxRows: 5 }"
                                                            resize="none"
                                                            size="small"
                                                            :disabled="isDetail"
                                                            style="text-align:center; border:none; background:transparent;" />
                                              </td>
                                          </template>
                                          <td v-else
                                              style="text-align: center; padding: 8px 12px;">
                                              <el-input v-model="project.reportData.techRequirement[col.id]"
                                                        type="textarea"
                                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                                        resize="none"
                                                        size="small"
                                                        :disabled="isDetail"
                                                        style="text-align:center; border:none; background:transparent;" />
                                          </td>
                                      </template>
                                  </template>
                              </template>
                              <td v-else-if="footRow.label.includes('结论')"
                                  :colspan="isBendProject(project)
        ? (project.schemeConfig.BaseColumns?.length || 0)
          + getExtendTotalColSpan(project.schemeConfig.ExtendColumns)
          - 2
          + (isDetail ? 0 : 1)
        : getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                  <el-select v-model="project.reportData.conclusion"
                                             :disabled="isDetail"
                                             style="width:200px"
                                             placeholder="请选择">
                                      <el-option label="符合 / Pass" value="符合 / Pass" />
                                      <el-option label="不符合 / Fail" value="不符合 / Fail" />
                                      <el-option label="/" value="/" />
                                  </el-select>
                              </td>
                              <td v-else-if="footRow.label.includes('备注')"
                                  :colspan="isBendProject(project)
        ? (project.schemeConfig.BaseColumns?.length || 0)
          + getExtendTotalColSpan(project.schemeConfig.ExtendColumns)
          - 2
          + (isDetail ? 0 : 1)
        : getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                  <el-input v-model="project.reportData.note"
                                            type="textarea"
                                            :autosize="{ minRows: 2, maxRows: 8 }"
                                            resize="none"
                                            :disabled="isDetail"
                                            style="width:100%;" />
                              </td>
                              <td v-else
                                  :colspan="isBendProject(project)
        ? (project.schemeConfig.BaseColumns?.length || 0)
          + getExtendTotalColSpan(project.schemeConfig.ExtendColumns)
          - 2
          + (isDetail ? 0 : 1)
        : getExtendTotalColSpan(project.schemeConfig.ExtendColumns) + (isDetail ? 0 : 1)">
                                  <el-input v-model="project.reportData[footRow.field || footRow.id]"
                                            type="textarea"
                                            :autosize="{ minRows: 1, maxRows: 5 }"
                                            resize="none"
                                            :disabled="isDetail"
                                            style="width:100%;" />
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </template>

              <!-- ========== 公共区域：新增行、照片、审批（不论分组情况都显示） ========== -->
              <!-- 新增行按钮（仅非详情、且非任何分组时显示） -->
              <div v-if="!isDetail && !(project.reportData.isImpactGrouped && project.reportData.impactGroups?.length>
                  0)
                  && !(project.reportData.isCorrosionGrouped && project.reportData.corrosionGroups?.length > 0)
                  && !(project.reportData.isTensileGrouped   && project.reportData.tensileGroups?.length > 0)
                  && !(project.reportData.isFerriteGrouped   && project.reportData.ferriteGroups?.length > 0)
                  && !(project.reportData.isVickersGrouped   && project.reportData.vickersGroups?.length > 0)
                  && !(project.reportData.isInclusionGrouped && project.reportData.inclusionGroups?.length > 0)
                  && !(project.reportData.isChemGrouped && project.reportData.chemGroups?.length > 0)
                  && !(project.reportData.isMetallographicGrouped && project.reportData.metallographicGroups?.length > 0)"
                  style="padding: 10px 20px; background: #fafafa;">
                  <el-button size="small" type="primary" @click="emit('addTableRow', projectIndex)">
                      + 新增数据行
                  </el-button>
              </div>

              <!-- 照片区域 -->
              <div v-if="project.showPhotoArea"
                   style="margin: 20px;">
                  <div style="font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                      试验照片 / Test Photos
                  </div>
                  <el-button v-if="!isDetail"
                             type="primary"
                             size="small"
                             @click="emit('addPhotoRow', projectIndex)">
                      新增照片行（2张/行）
                  </el-button>
                  <div v-for="(row, idx) in project.reportData.photoRows"
                       :key="idx"
                       :style="{ marginTop: (row.marginTop ?? 2.65) + 'mm' }"
                       class="group-spacing-wrapper">
                      <!-- 间距输入框（hover 显示） -->
                      <div v-if="!isDetail" class="group-spacing-module">
                          <div class="spacing-input group-input">
                              <span>图片间距(mm)</span>
                              <el-input-number v-model="row.marginTop"
                                               :min="0"
                                               :max="240"
                                               :step="2"
                                               size="small"
                                               style="width: 100px;" />
                          </div>
                      </div>

                      <!-- 布局（左右图 + 删除按钮） -->
                      <div style="display: flex; gap: 20px; align-items: flex-end; position: relative;">
                          <!-- ===== 左图 ===== -->
                          <div style="flex: 1; position: relative;">
                              <div style="border: 1px dashed #ccc; height: 360px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;"
                                   :style="{
                     borderColor: isPhotoSlotActive(projectIndex, idx, 1) ? '#409EFF' : '#ccc',
                     borderWidth: isPhotoSlotActive(projectIndex, idx, 1) ? '2px' : '1px'
                 }"
                                   @mouseenter="focusPhotoSlot(projectIndex, idx, 1)"
                                   @mouseleave="blurPhotoSlot">
                                  <img v-if="row.LeftUrl"
                                       :src="convertImageUrl(row.LeftUrl)"
                                       style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                  <div v-else style="text-align: center;">
                                      <input :ref="el => setUploadRef(el, projectIndex, idx, 1)"
                                             type="file"
                                             accept="image/*"
                                             style="display:none"
                                             @change="uploadPhoto($event, projectIndex, idx, 1)">
                                      <el-button type="text"
                                                 icon="Upload"
                                                 :disabled="isDetail"
                                                 @click="triggerUpload(projectIndex, idx, 1)">
                                          点击上传
                                      </el-button>
                                      <div v-if="!isDetail" style="font-size: 12px; color: #999; margin-top: 4px;">
                                          或按 Ctrl+V 粘贴图片
                                      </div>
                                  </div>
                              </div>
                              <el-button v-if="row.LeftUrl && !isDetail"
                                         type="danger"
                                         circle
                                         size="small"
                                         icon="Close"
                                         style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
                                         @click="deleteSinglePhoto(projectIndex, idx, 1)" />
                              <el-input v-model="row.LeftDesc"
                                        :disabled="isDetail"
                                        placeholder="照片描述"
                                        style="margin-top: 8px;" />
                          </div>

                          <!-- ===== 右图 ===== -->
                          <div style="flex: 1; position: relative;">
                              <div style="border: 1px dashed #ccc; height: 360px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px;"
                                   :style="{
                     borderColor: isPhotoSlotActive(projectIndex, idx, 2) ? '#409EFF' : '#ccc',
                     borderWidth: isPhotoSlotActive(projectIndex, idx, 2) ? '2px' : '1px'
                 }"
                                   @mouseenter="focusPhotoSlot(projectIndex, idx, 2)"
                                   @mouseleave="blurPhotoSlot">
                                  <img v-if="row.RightUrl"
                                       :src="convertImageUrl(row.RightUrl)"
                                       style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                  <div v-else style="text-align: center;">
                                      <input :ref="el => setUploadRef(el, projectIndex, idx, 2)"
                                             type="file"
                                             accept="image/*"
                                             style="display:none"
                                             @change="uploadPhoto($event, projectIndex, idx, 2)">
                                      <el-button type="text"
                                                 icon="Upload"
                                                 :disabled="isDetail"
                                                 @click="triggerUpload(projectIndex, idx, 2)">
                                          点击上传
                                      </el-button>
                                      <div v-if="!isDetail" style="font-size: 12px; color: #999; margin-top: 4px;">
                                          或按 Ctrl+V 粘贴图片
                                      </div>
                                  </div>
                              </div>
                              <el-button v-if="row.RightUrl && !isDetail"
                                         type="danger"
                                         circle
                                         size="small"
                                         icon="Close"
                                         style="position: absolute; top: 5px; right: 5px; z-index: 10; background-color: #ff4d4f; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
                                         @click="deleteSinglePhoto(projectIndex, idx, 2)" />
                              <el-input v-model="row.RightDesc"
                                        :disabled="isDetail"
                                        placeholder="照片描述"
                                        style="margin-top: 8px;" />
                          </div>

                          <el-button v-if="!isDetail"
                                     type="danger"
                                     icon="Delete"
                                     size="small"
                                     style="align-self: center;"
                                     @click="emit('removePhotoRow', projectIndex, idx)">
                              删除此行
                          </el-button>
                      </div>
                  </div>
              </div>
              <!-- ========== 审批区域 ========== -->
              <div style="margin: 20px 0 10px 0;">
                  <!-- ===== 审批控制条（每个区块独立卡片） ===== -->
                  <template v-if="project.reportData.signatureItems?.length > 0">
                      <div v-for="(block, bIdx) in (project.reportData.signatureBlocks || project.reportData.SignatureBlocks || [])"
                           :key="bIdx"
                           style="border: 1px solid #e6e6e6; border-radius: 6px; padding: 10px 16px; background: #f5f7fa; margin-bottom: 12px;">
                          <!-- 区块标题 -->
                          <div style="font-weight: 600; font-size: 13px; color: #333; margin-bottom: 8px;">
                              审批项目：{{ getBlockProjectNames(projectIndex, bIdx) }}
                          </div>

                          <!-- 审核行 -->
                          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 6px 0; border-top: 1px dashed #ddd;">
                              <div style="display: flex; align-items: center; gap: 6px;">
                                  <span style="font-size: 13px; color: #666;">
                                      审核
                                      <template v-if="block.reviewer || block.Reviewer">
                                          （{{ block.reviewer || block.Reviewer }}）
                                      </template>：
                                  </span>
                                  <el-tag :type="blockReviewType(block)"
                                          size="small">
                                      {{ blockReviewLabel(block) }}
                                  </el-tag>
                              </div>

                              <span style="font-size: 13px; color: #333;">
                                  意见：{{ getBlockReviewOpinion(block) || '--' }}
                              </span>

                              <template v-if="canReviewBlock(block)">
                                  <el-button size="small"
                                             type="success"
                                             @click="handleApproveReview(projectIndex, bIdx)">
                                      审核通过
                                  </el-button>
                                  <el-button size="small"
                                             type="danger"
                                             @click="handleRejectReview(projectIndex, bIdx)">
                                      审核驳回
                                  </el-button>
                                  <el-button size="small"
                                             type="warning"
                                             @click="handleTransfer(projectIndex, bIdx, 'review')">
                                      审核转办
                                  </el-button>
                              </template>
                          </div>

                          <!-- 批准行 -->
                          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 6px 0; border-top: 1px dashed #ddd;">
                              <div style="display: flex; align-items: center; gap: 6px;">
                                  <span style="font-size: 13px; color: #666;">
                                      批准
                                      <template v-if="block.approver || block.Approver">
                                          （{{ block.approver || block.Approver }}）
                                      </template>：
                                  </span>
                                  <el-tag :type="blockApprovalType(block)"
                                          size="small">
                                      {{ blockApprovalLabel(block) }}
                                  </el-tag>
                              </div>

                              <span style="font-size: 13px; color: #333;">
                                  意见：{{ getBlockApprovalOpinion(block) || '--' }}
                              </span>

                              <template v-if="canApproveBlock(block)">
                                  <el-button size="small"
                                             type="success"
                                             @click="handleApproveApproval(projectIndex, bIdx)">
                                      批准通过
                                  </el-button>
                                  <el-button size="small"
                                             type="danger"
                                             @click="handleRejectApproval(projectIndex, bIdx)">
                                      批准驳回
                                  </el-button>
                                  <el-button size="small"
                                             type="warning"
                                             @click="handleTransfer(projectIndex, bIdx, 'approval')">
                                      批准转办
                                  </el-button>
                              </template>
                          </div>
                      </div>
                  </template>

                  <!-- ===== 三列签名显示区（只显示签名图片） ===== -->
                  <div v-if="project.reportData.signatureItems?.length > 0"
                       style="border: 1px solid #e6e6e6; border-radius: 6px; padding: 10px 20px; background: #fafafa;">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                          <!-- ===== 编制列 ===== -->
                          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
                              <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.3; min-width: 60px;">
                                  <span style="font-weight: 500; font-size: 14px; color: #333;">编制</span>
                                  <span style="font-size: 11px; color: #999;">Compiled by</span>
                              </div>

                              <!-- 编制签名图片（从 signatureItems 读取） -->
                              <div v-if="getSignatureUrl(project, '编制')"
                                   style="display: flex; align-items: center; gap: 4px;">
                                  <img :src="convertImageUrl(getSignatureUrl(project, '编制'))"
                                       style="height: 28px; max-width: 60px; object-fit: contain; border: 1px solid #ddd; border-radius: 3px; padding: 2px; background: #fff;">
                                  <el-button v-if="false"
                                             size="small"
                                             type="text"
                                             style="color: #f56c6c; padding: 0 4px; font-size: 12px;"
                                             @click="removeSignatureFromItem(projectIndex, '编制')">
                                      取消签名
                                  </el-button>
                              </div>
                              <span v-else
                                    style="font-size: 13px; color: #bbb; min-width: 60px;">（未签名）</span>

                              <el-button v-if="false"
                                         size="small"
                                         type="primary"
                                         plain
                                         style="padding: 4px 10px; font-size: 12px;"
                                         @click="loadSignature(projectIndex, '编制')">
                                  签名
                              </el-button>
                          </div>

                          <!-- ===== 审核列 ===== -->
                          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
                              <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.3; min-width: 60px;">
                                  <span style="font-weight: 500; font-size: 14px; color: #333;">审核</span>
                                  <span style="font-size: 11px; color: #999;">Reviewed by</span>
                              </div>

                              <!-- 审核签名图片（从 signatureItems 读取） -->
                              <div v-if="getSignatureUrl(project, '审核')"
                                   style="display: flex; align-items: center; gap: 4px;">
                                  <img :src="convertImageUrl(getSignatureUrl(project, '审核'))"
                                       style="height: 28px; max-width: 60px; object-fit: contain; border: 1px solid #ddd; border-radius: 3px; padding: 2px; background: #fff;">
                                  <el-button v-if="false"
                                             size="small"
                                             type="text"
                                             style="color: #f56c6c; padding: 0 4px; font-size: 12px;"
                                             @click="removeSignatureFromItem(projectIndex, '审核')">
                                      取消签名
                                  </el-button>
                              </div>
                              <span v-else
                                    style="font-size: 13px; color: #bbb; min-width: 60px;">（未签名）</span>

                              <el-button v-if="false"
                                         size="small"
                                         type="primary"
                                         plain
                                         style="padding: 4px 10px; font-size: 12px;"
                                         @click="loadSignature(projectIndex, '审核')">
                                  签名
                              </el-button>
                          </div>

                          <!-- ===== 批准列 ===== -->
                          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
                              <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.3; min-width: 60px;">
                                  <span style="font-weight: 500; font-size: 14px; color: #333;">批准</span>
                                  <span style="font-size: 11px; color: #999;">Approved by</span>
                              </div>

                              <!-- 批准签名图片（从 signatureItems 读取） -->
                              <div v-if="getSignatureUrl(project, '批准')"
                                   style="display: flex; align-items: center; gap: 4px;">
                                  <img :src="convertImageUrl(getSignatureUrl(project, '批准'))"
                                       style="height: 28px; max-width: 60px; object-fit: contain; border: 1px solid #ddd; border-radius: 3px; padding: 2px; background: #fff;">
                                  <el-button v-if="false"
                                             size="small"
                                             type="text"
                                             style="color: #f56c6c; padding: 0 4px; font-size: 12px;"
                                             @click="removeSignatureFromItem(projectIndex, '批准')">
                                      取消签名
                                  </el-button>
                              </div>
                              <span v-else
                                    style="font-size: 13px; color: #bbb; min-width: 60px;">（未签名）</span>

                              <el-button v-if="false"
                                         size="small"
                                         type="primary"
                                         plain
                                         style="padding: 4px 10px; font-size: 12px;"
                                         @click="loadSignature(projectIndex, '批准')">
                                  签名
                              </el-button>
                          </div>

                          <!-- 删除整个审批区域（仅 draft / rejected 状态可见） -->
                          <el-button v-if="reportStatus === 'draft' || reportStatus === 'rejected'"
                                     size="small"
                                     type="danger"
                                     plain
                                     style="flex-shrink: 0;"
                                     @click="removeSignatureGroup(projectIndex)">
                              删除
                          </el-button>
                      </div>
                  </div>

                  <!-- 无签名项时显示“插入审批区域”按钮 -->
                  <div v-else>
                      <el-button v-if="reportStatus === 'draft' || reportStatus === 'rejected'"
                                 size="small"
                                 type="primary"
                                 plain
                                 @click="openAddForm(projectIndex)">
                          + 插入审批区域
                      </el-button>

                      <!-- 行内添加表单 -->
                      <div v-if="showAddForm && addingProjectIndex === projectIndex"
                           style="border: 1px solid #409EFF; border-radius: 6px; padding: 12px 16px; background: #f0f7ff; margin-top: 8px;">
                          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                              <span style="font-weight: 500; font-size: 13px; color: #333;">添加审批区域</span>

                              <div style="display: flex; align-items: center; gap: 6px;">
                                  <span style="font-size: 13px; color: #666;">审核人：</span>
                                  <el-select v-model="tempReviewer"
                                             placeholder="选择审核人"
                                             size="small"
                                             style="width: 120px;">
                                      <el-option label="张霞"
                                                 value="张霞" />
                                      <el-option label="姜莹"
                                                 value="姜莹" />
                                      <el-option label="彭广君"
                                                 value="彭广君" />
                                      <el-option label="蔡连英"
                                                 value="蔡连英" />
                                  </el-select>
                              </div>

                              <div style="display: flex; align-items: center; gap: 6px;">
                                  <span style="font-size: 13px; color: #666;">批准人：</span>
                                  <el-select v-model="tempApprover"
                                             placeholder="选择批准人"
                                             size="small"
                                             style="width: 120px;">
                                      <el-option label="王桩波"
                                                 value="王桩波" />
                                      <el-option label="陈欣"
                                                 value="陈欣" />
                                  </el-select>
                              </div>

                              <div style="display: flex; gap: 8px;">
                                  <el-button size="small"
                                             type="primary"
                                             @click="confirmAddForm(projectIndex)">
                                      确认添加
                                  </el-button>
                                  <el-button size="small"
                                             @click="closeAddForm">
                                      取消
                                  </el-button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div v-else
               style="color: #999; padding: 30px; text-align: center;">
              请在检测环境中选择 检测项目编码 + 技术要求编码，自动加载模板
          </div>
      </div>
    </div>

    <!-- ===== 报告级批量审批快捷条 ===== -->
    <div
      v-if="false"
      style="margin: 20px 0; border: 1px solid #f0c674; border-radius: 6px; padding: 12px 20px; background: #fffbe6; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;"
    >
      <span style="font-size: 13px; color: #666; font-weight: 500;">快捷操作：</span>
      <el-button
        v-if="myPendingReviewCountAll() > 1"
        size="small"
        type="success"
        @click="batchApproveReview()"
      >
        一键通过我负责的全部审核区块（{{ myPendingReviewCountAll() }}）
      </el-button>
      <el-button
        v-if="myPendingApprovalCountAll() > 1"
        size="small"
        type="success"
        @click="batchApproveApproval()"
      >
        一键批准我负责的全部批准区块（{{ myPendingApprovalCountAll() }}）
      </el-button>
    </div>
  </div>
</template>

<script setup>
    /* eslint-disable vue/no-mutating-props */

    import { defineProps, defineEmits, computed, nextTick, ref, watch, onMounted, onUnmounted, defineExpose, h } from 'vue'
    import { ElMessage, ElMessageBox, ElSelect, ElOption } from 'element-plus'
    import axios from 'axios'
    import TestEnvTable from './TestEnvTable.vue'
    import TestEquipmentTable from './TestEquipmentTable.vue'
    import { getExtendTotalColSpan, getTotalColSpan, getSubColumnsByExtend } from '../utils/reportMapper'
    import { useUserStore } from '@/stores/user'


        const testEnvTableRef = ref(null)
    const userStore = useUserStore()


    /** 判断是否是室温拉伸项目 */
    function isTensileProject(project) {
        if (!project?.schemeConfig) return false
        const title = project.schemeConfig.ProjectTitle || ''
        return title.includes('拉伸') || title.toLowerCase().includes('tensile')
    }

    /** 判断是否是点腐蚀项目 */
    function isPittingProject(project) {
        if (!project?.schemeConfig) return false
        const title = project.schemeConfig.ProjectTitle || ''
        return title.includes('点腐蚀') || title.toLowerCase().includes('pitting')
    }

    /** 判断是否是晶间腐蚀项目 */
    function isIntergranularProject(project) {
        if (!project?.schemeConfig) return false
        const title = project.schemeConfig.ProjectTitle || ''
        return title.includes('晶间腐蚀') || title.toLowerCase().includes('intergranular')
    }

    /** 腐蚀类项目（点腐蚀 / 晶间腐蚀） */
    function isCorrosionProject(project) {
        return isPittingProject(project) || isIntergranularProject(project)
    }

    function isBendProject(project) {
    if (!project?.schemeConfig) return false
    return (project.schemeConfig.ProjectTitle || '').includes('弯曲')
}

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

    /** 判断该维氏分组是否走动态行渲染 */
    function isVickersDynamicRow(gConfig) {
        return gConfig.ExtendColumns?.some(c => c.isDynamicRow === true)
    }

    /** 把结果按每行 size 个切分，不足补 null 占位 */
    function chunkSubColumns(subColumns, size = 4) {
        const list = subColumns || []
        const chunks = []
        for (let i = 0; i < list.length; i += size) {
            const chunk = list.slice(i, i + size)
            while (chunk.length < size) chunk.push(null)
            chunks.push(chunk)
        }
        return chunks
    }

    /** 是否试样编号列（整组 rowspan 合并） */
    function isSampleNoColumn(col) {
        const label = (col.label || '').trim();
        const field = (col.yunbiaoField || '').trim();
        return label.includes('试样编号') || label.includes('Sample No') || field === '试样编号';
    }

    /** 是否检测位置列（转换行显示"转换值"标签） */
    function isPositionColumn(col) {
        const label = (col.label || '').trim();
        const field = (col.yunbiaoField || '').trim();
        return label.includes('检测位置') || label.includes('Position') || field === '检测位置';
    }

    /** 该 group 的 chunk 数（每 chunk = 4 结果点） */
    function getVickersChunkCount(group) {
        return chunkSubColumns(getVickersResultColumns(group), 4).length;
    }

    /** 转换倍数：开转换 = 2（数据行 + 转换行），否则 = 1 */
    function getVickersRowMultiplier(group) {
        return group.enableConversion ? 2 : 1;
    }

    /** 试样编号的 rowspan：位置数 × chunk数 × 倍数 */
    function getSampleRowSpan(group) {
        return Math.max(1, group.tableData.length)
            * getVickersChunkCount(group)
            * getVickersRowMultiplier(group);
    }

    /** 动态行表格：结果列每列宽（%） */
    function getVickersResultColWidth(gConfig) {
        const baseCount = (gConfig.BaseColumns || []).length;
        const BASE_WIDTH = 10;      // 每个 BaseColumn 占 10%
        const RESULT_COUNT = 8;     // 一个 chunk = 4 组 × 2 列（序号 + 值）
        const remain = 100 - baseCount * BASE_WIDTH;
        return Math.max(remain / RESULT_COUNT, 5);  // 最低 5%，避免极端情况太窄
    }

    /** 从维氏分组提取结果列：优先 subColumns；否则从 tableData 推断（任意行有值就保留） */
    function getVickersResultColumns(group) {
        // 1. 优先 group.subColumns
        if (group.subColumns?.length > 0) return group.subColumns

        // 2. 兼容 tableData 是字符串
        let tableData = group.tableData || []
        if (typeof tableData === 'string') {
            try { tableData = JSON.parse(tableData) } catch { tableData = [] }
        }
        if (!Array.isArray(tableData) || tableData.length === 0) return []

        // 3. 收集所有行的 key
        const validKeys = new Set()
        tableData.forEach(row => {
            if (!row || typeof row !== 'object') return
            Object.keys(row).forEach(key => {
                // 只保留"结果N"格式的 key
                if (!/^结果\d+$/.test(key)) return
                const val = row[key]
                if (val !== null && val !== undefined && val !== '') {
                    validKeys.add(key)
                }
            })
        })

        //  调试：如果没匹配到，打印真实 key
        if (validKeys.size === 0 && tableData[0]) {
            console.log('❌ 没匹配到结果N字段，真实 keys:', Object.keys(tableData[0]))
        }

        if (validKeys.size === 0) return []

        const cols = [...validKeys].map(key => ({
            id: key,
            label: key.replace('结果', '')
        }))
        cols.sort((a, b) => parseInt(a.label, 10) - parseInt(b.label, 10))
        return cols
    }

    function getVickersGroupConfig(project, group) {
        const config = JSON.parse(JSON.stringify(project.schemeConfig));
        const dynamicCol = config.ExtendColumns?.find(col =>
            col.isDynamic === true || col.isDynamicRow === true       // 兼容动态行
        );
        if (dynamicCol) {
            dynamicCol.subColumns = getVickersResultColumns(group);   // 从数据推断
            dynamicCol.label = '检测结果';
            dynamicCol.enLabel = 'Test Results';
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


    // 新增铁素体分组数据行
    function addFerriteTableRow(projectIndex, fIdx) {
        const group = props.testProjects[projectIndex]?.reportData?.ferriteGroups?.[fIdx]
        if (!group) return

        const project = props.testProjects[projectIndex]
        const allColumns = [
            ...(project.schemeConfig.BaseColumns || []),
            ...(project.schemeConfig.ExtendColumns || [])
        ]
        const row = {}
        allColumns.forEach(col => row[col.id] = '')
        group.tableData.push(row)
    }

    const props = defineProps({
        fixedForm: Object,
        testProjects: Array,
        isDetail: Boolean,
        envList: Array,
        techSpecList: Array,
        reportId: Number,      // 新增
        reportStatus: String   // 新增：draft / pending_review / pending_approval / approved / rejected
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
        'deleteFerriteGroup',
        'addTensileRow',
        'deleteTensileRow',
        'deleteTensileGroup',
        'addVickersRow',
        'deleteVickersRow',
        'deleteVickersGroup',
        'refreshReport',
        'cloneTensileGroup',
        'copyTensileTableAsGroup',
        'copyCorrosionTableAsGroup',
        'cloneCorrosionGroup',
        'deleteCorrosionGroup',
        'addCorrosionRow',
        'deleteCorrosionRow',
        'copyInclusionTableAsGroup',
        'cloneInclusionGroup',
        'deleteInclusionGroup',
        'addInclusionRow',
        'deleteInclusionRow',
        'copyChemTableAsGroup',
        'cloneChemGroup',
        'deleteChemGroup',
        'addChemRow',
        'deleteChemRow',
        'copyMetallographicTableAsGroup',
        'cloneMetallographicGroup',
        'deleteMetallographicGroup',
        'addMetallographicRow',
        'deleteMetallographicRow'
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
            resultTitleMargin.value = props.fixedForm.MarginSettings.resultTitle ?? 5   

        }
        //  只在数量不匹配时才重建（新增/删除项目时）
        if (props.testProjects?.length &&
            projectMargins.value.length !== props.testProjects.length) {
            projectMargins.value = props.testProjects.map(item => item.ProjectMargin ?? 5)
        }
    }
    // 用户改固定间距 → 同步回 MarginSettings
    watch(
        [sampleDescMargin, clientInfoMargin, testEnvMargin, testEquipmentMargin, resultTitleMargin],
        () => {
            if (!props.fixedForm) return
            // eslint-disable-next-line vue/no-mutating-props
            if (!props.fixedForm.MarginSettings) {
                props.fixedForm.MarginSettings = {}
            }
            props.fixedForm.MarginSettings.sampleDesc = sampleDescMargin.value
            props.fixedForm.MarginSettings.clientInfo = clientInfoMargin.value
            props.fixedForm.MarginSettings.testEnv = testEnvMargin.value
            props.fixedForm.MarginSettings.testEquipment = testEquipmentMargin.value
            props.fixedForm.MarginSettings.resultTitle = resultTitleMargin.value
        }
    )


    // 用户改间距 → 同步回 testProjects
    watch(projectMargins, (newVal) => {
        newVal.forEach((margin, i) => {
            if (props.testProjects?.[i]) {
                // eslint-disable-next-line vue/no-mutating-props
                props.testProjects[i].ProjectMargin = margin
            }
        })
    }, { deep: true })

    const isOutsourcedProject = (project) => {
        if (!project) return false
        const title = project?.schemeConfig?.ProjectTitle || project?.techSpecName || ''
        return title.includes('外包项目')
    }


    // 1. 从 userStore 获取用户信息
    const currentUser = userStore.userName  // 或 userStore.userInfo?.UserName

    // 审批人员池（和"添加审批区域"下拉框保持一致）
    const REVIEWER_OPTIONS = ['张霞', '姜莹', '彭广君']
    const APPROVER_OPTIONS = ['陈欣', '王桩波']

    // ==================== 审批权限判断 ====================

    // 从 signatureItems 中获取指定角色的签名 URL
    function getSignatureUrl(project, role) {
        if (!project || !project.reportData) return ''

        //  1. 优先从 signatureItems 读取（打印用的三栏签名）
        const items = project.reportData.signatureItems || project.reportData.SignatureItems || []
        const item = items.find(s => (s.role || s.Role) === role)
        const itemUrl = item?.signatureUrl || item?.SignatureUrl
        if (itemUrl) return itemUrl

        //  2. 回退：审核/批准 从 signatureBlocks 读（历史数据兼容）
        const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
        for (const block of blocks) {
            if (role === '审核') {
                const url = block.ReviewSignatureUrl || block.review_signature_url
                if (url) return url
            }
            if (role === '批准') {
                const url = block.ApprovalSignatureUrl || block.approval_signature_url
                if (url) return url
            }
           
        }

        return ''
    }



    // ========== 行内添加表单状态 ==========
    // ===== 行内添加表单状态 =====
    const showAddForm = ref(false)
    const tempReviewer = ref('')
    const tempApprover = ref('')
    const addingProjectIndex = ref(null)

    function openAddForm(projectIndex) {
        addingProjectIndex.value = projectIndex
        tempReviewer.value = ''
        tempApprover.value = ''
        showAddForm.value = true
    }

    function closeAddForm() {
        showAddForm.value = false
        addingProjectIndex.value = null
        tempReviewer.value = ''
        tempApprover.value = ''
    }

    function confirmAddForm(projectIndex) {
        if (!tempReviewer.value) {
            ElMessage.warning('请选择审核人')
            return
        }
        if (!tempApprover.value) {
            ElMessage.warning('请选择批准人')
            return
        }

        // 调用统一函数
        addSignatureGroupWithNames(projectIndex, tempReviewer.value, tempApprover.value)
    }

    function addSignatureGroupWithNames(projectIndex, reviewerName, approverName) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        // 确保 reportData 存在
        if (!project.reportData) {
            project.reportData = {}
        }

        // 1.  写入 signatureBlocks（新格式，供审批流程使用）
        project.reportData.signatureBlocks = [
            {
                Category: project.schemeConfig?.ProjectTitle || project.techSpecName || '检测项目',
                Reviewer: reviewerName,
                ReviewStatus: 'pending',
                ReviewTime: null,
                ReviewOpinion: null,
                ReviewSignatureUrl: null,
                Approver: approverName,
                ApprovalStatus: 'pending',
                ApprovalTime: null,
                ApprovalOpinion: null,
                ApprovalSignatureUrl: null
            }
        ]

        // 2. 写入 reviewer/approver（旧格式，兼容现有显示逻辑）
        project.reportData.reviewer = reviewerName
        project.reportData.reviewStatus = 'pending'
        project.reportData.approver = approverName
        project.reportData.approvalStatus = 'pending'

        // 3. 写入 signatureItems（用于打印）
        project.reportData.signatureItems = [
            { role: '编制', enLabel: 'Compiled by', name: currentUser || '', signatureUrl: '' },
            { role: '审核', enLabel: 'Reviewed by', name: reviewerName, signatureUrl: '' },
            { role: '批准', enLabel: 'Approved by', name: approverName, signatureUrl: '' }
        ]

        ElMessage.success('已添加审批区域')
        closeAddForm()

        if (currentUser) {
            nextTick(() => {
                loadSignature(projectIndex, '编制')
            })
        }
    }

    // 同步 reviewer/approver 到 signatureItems（下拉变化时）
    function updateSignatureName(projectIndex, role, value) {
        const project = props.testProjects[projectIndex]
        if (!project) return
        const items = project.reportData.signatureItems || []
        const target = items.find(sig => sig.role === role)
        if (target) {
            target.name = value || ''
        }
    }

    /** 当前用户是否能审核该区块 */
    function canReview(block) {
        if (!block || !block.reviewer) return false
        return currentUser === block.reviewer &&
            block.review_status === 'pending' &&
            props.reportStatus === 'pending_review'
    }

    /** 当前用户是否能批准该区块 */
    function canApprove(block) {
        if (!block || !block.approver) return false
        return currentUser === block.approver &&
            block.approval_status === 'pending' &&
            props.reportStatus === 'pending_approval'
    }

    // ==================== 审核/批准状态判断（基于当前项目） ====================

    /** 获取审核状态类型 */
    function getReviewStatusType(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        if (!blocks.length) return 'warning'

        const statuses = blocks.map(b => b.ReviewStatus || b.review_status || 'pending')
        if (statuses.some(s => s === 'rejected')) return 'danger'
        if (statuses.every(s => s === 'done')) return 'success'
        return 'warning'
    }

    /** 获取审核状态标签 */
    function getReviewStatusLabel(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        if (!blocks.length) return '待审核'

        const statuses = blocks.map(b => b.ReviewStatus || b.review_status || 'pending')
        if (statuses.some(s => s === 'rejected')) return '已驳回'
        if (statuses.every(s => s === 'done')) return '已审核'
        return '待审核'
    }

    /** 获取审核人姓名（优先 signatureItems，回退 signatureBlocks / 旧字段） */
    function getReviewerName(project) {
        if (!project?.reportData) return ''

        // 1. 三栏签名项（最新数据源）
        const items = project.reportData.signatureItems || project.reportData.SignatureItems || []
        const item = items.find(s => (s.role || s.Role) === '审核')
        if (item?.name || item?.Name) return item.name || item.Name

        // 2. signatureBlocks
        const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
        for (const b of blocks) {
            const name = b.Reviewer || b.reviewer
            if (name) return name
        }

        // 3. 旧字段
        return project.reportData.reviewer || ''
    }

    /** 获取批准人姓名 */
    function getApproverName(project) {
        if (!project?.reportData) return ''

        const items = project.reportData.signatureItems || project.reportData.SignatureItems || []
        const item = items.find(s => (s.role || s.Role) === '批准')
        if (item?.name || item?.Name) return item.name || item.Name

        const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
        for (const b of blocks) {
            const name = b.Approver || b.approver
            if (name) return name
        }

        return project.reportData.approver || ''
    }

    /** 获取批准状态类型 */
    function getApprovalStatusType(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        if (!blocks.length) return 'warning'

        const statuses = blocks.map(b => b.ApprovalStatus || b.approval_status || 'pending')
        if (statuses.some(s => s === 'rejected')) return 'danger'
        if (statuses.every(s => s === 'done')) return 'success'
        return 'warning'
    }

    /** 获取批准状态标签 */
    function getApprovalStatusLabel(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        if (!blocks.length) return '待批准'

        const statuses = blocks.map(b => b.ApprovalStatus || b.approval_status || 'pending')
        if (statuses.some(s => s === 'rejected')) return '已驳回'
        if (statuses.every(s => s === 'done')) return '已批准'
        return '待批准'
    }

    /** 获取当前用户待审核的区块索引 */
    function getPendingReviewBlockIndex(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i]
            const reviewer = block.Reviewer || block.reviewer || ''
            const status = block.ReviewStatus || block.review_status || 'pending'
            if (reviewer === currentUser && status === 'pending') {
                return i
            }
        }
        return -1
    }

    /** 获取当前用户待批准的区块索引 */
    function getPendingApprovalBlockIndex(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i]
            const approver = block.Approver || block.approver || ''
            const status = block.ApprovalStatus || block.approval_status || 'pending'
            if (approver === currentUser && status === 'pending') {
                return i
            }
        }
        return -1
    }

    /** 当前用户是否能审核该项目 */
    function canReviewProject(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        for (const block of blocks) {
            const reviewer = block.Reviewer || block.reviewer || ''
            const reviewStatus = block.ReviewStatus || block.review_status || 'pending'
            if (reviewer === currentUser && reviewStatus === 'pending') {
                return true                       // ← 只看区块自己的状态
            }
        }
        const reviewer = project.reportData?.reviewer
        const status = project.reportData?.reviewStatus || 'pending'
        return currentUser === reviewer && status === 'pending'
    }

    /** 当前用户是否能批准该项目 */
    function canApproveProject(project) {
        const blocks = project.reportData?.signatureBlocks || project.reportData?.SignatureBlocks || []
        for (const block of blocks) {
            const approver = block.Approver || block.approver || ''
            const approvalStatus = block.ApprovalStatus || block.approval_status || 'pending'
            if (approver === currentUser && approvalStatus === 'pending') {
                return true
            }
        }
        const approver = project.reportData?.approver
        const status = project.reportData?.approvalStatus || 'pending'
        return currentUser === approver && status === 'pending'
    }

    // ============ 区块级辅助函数 ============

    /** 当前用户能否审核该区块 */
    function canReviewBlock(block) {
        // 只有报告处于"待审核"阶段才允许
        if (props.reportStatus !== 'pending_review') return false

        const reviewer = (block.Reviewer || block.reviewer || '').trim()
        const status = block.ReviewStatus || block.review_status || 'pending'
        return reviewer === (currentUser || '').trim() && status === 'pending'
    }

    /** 当前用户能否批准该区块 */
    function canApproveBlock(block) {
        // 只有报告处于"待批准"阶段才允许
        if (props.reportStatus !== 'pending_approval') return false

        const approver = (block.Approver || block.approver || '').trim()
        const status = block.ApprovalStatus || block.approval_status || 'pending'
        return approver === (currentUser || '').trim() && status === 'pending'
    }

    function blockReviewLabel(block) {
        const s = block.ReviewStatus || block.review_status || 'pending'
        return s === 'done' ? '已审核' : s === 'rejected' ? '已驳回' : '待审核'
    }
    function blockReviewType(block) {
        const s = block.ReviewStatus || block.review_status || 'pending'
        return s === 'done' ? 'success' : s === 'rejected' ? 'danger' : 'warning'
    }
    function blockApprovalLabel(block) {
        const s = block.ApprovalStatus || block.approval_status || 'pending'
        return s === 'done' ? '已批准' : s === 'rejected' ? '已驳回' : '待批准'
    }
    function blockApprovalType(block) {
        const s = block.ApprovalStatus || block.approval_status || 'pending'
        return s === 'done' ? 'success' : s === 'rejected' ? 'danger' : 'warning'
    }

    function getBlockReviewOpinion(block) {
        return block.review_opinion || block.ReviewOpinion || ''
    }
    function getBlockApprovalOpinion(block) {
        return block.approval_opinion || block.ApprovalOpinion || ''
    }

    /** 全报告内当前用户待审核区块数 */
    function myPendingReviewCountAll() {
        return (props.testProjects || []).reduce((sum, p) => {
            const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
            return sum + blocks.filter(canReviewBlock).length
        }, 0)
    }

    /** 全报告内当前用户待批准区块数 */
    function myPendingApprovalCountAll() {
        return (props.testProjects || []).reduce((sum, p) => {
            const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
            return sum + blocks.filter(canApproveBlock).length
        }, 0)
    }

    /** 报告是否存在任何审批区块 */
    function hasAnyApprovalBlocks() {
        return (props.testProjects || []).some(p => {
            const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
            return blocks.length > 0
        })
    }

    async function loadSignature(projectIndex, role) {
        const project = props.testProjects[projectIndex]
        if (!project) return
        if (!currentUser) {
            ElMessage.warning('请先登录')
            return
        }

        try {
            const res = await axios.get('/api/user/signature')
            if (res.data.success && res.data.data) {
                const sigUrl = res.data.data.signatureUrl

                //  1. 更新 signatureItems（三栏签名都写这里）
                const item = project.reportData.signatureItems?.find(s => s.role === role)
                if (item) item.signatureUrl = sigUrl

                //  2. 只有"审核"和"批准"才写 signatureBlocks
                //    "编制"只写 signatureItems 和 compiledSignatureUrl
                if (role === '编制') {
                    project.reportData.compiledSignatureUrl = sigUrl
                } else if (role === '审核') {
                    const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
                    for (const block of blocks) {
                        if ('ReviewSignatureUrl' in block) block.ReviewSignatureUrl = sigUrl
                        else block.review_signature_url = sigUrl
                    }
                    project.reportData.reviewSignatureUrl = sigUrl
                } else if (role === '批准') {
                    const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
                    for (const block of blocks) {
                        if ('ApprovalSignatureUrl' in block) block.ApprovalSignatureUrl = sigUrl
                        else block.approval_signature_url = sigUrl
                    }
                    project.reportData.approvalSignatureUrl = sigUrl
                }

                ElMessage.success(`已加载 ${role} 签名`)
            } else {
                ElMessage.warning('您还未上传签名，请先到个人中心上传')
            }
        } catch (err) {
            console.error('加载签名失败', err)
            ElMessage.error('加载签名失败，请检查网络')
        }
    }

    // ==================== 插入/删除区块 ====================

    /** 插入审批区块 */
    function addSignatureBlock(projectIndex) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        ElMessageBox.prompt('请输入审核人姓名', '添加审批区块', {
            confirmButtonText: '下一步',
            cancelButtonText: '取消',
            inputPlaceholder: '例如：张霞'
        }).then(({ value: reviewer }) => {
            if (!reviewer) return
            ElMessageBox.prompt('请输入批准人姓名', '添加审批区块', {
                confirmButtonText: '确认添加',
                cancelButtonText: '取消',
                inputPlaceholder: '例如：王桩波'
            }).then(({ value: approver }) => {
                if (!approver) return

                if (!project.reportData.signatureBlocks) {
                    project.reportData.signatureBlocks = []
                }
                project.reportData.signatureBlocks.push({
                    Category: project.schemeConfig?.ProjectTitle || project.techSpecName || '检测项目',
                    Reviewer: reviewer.trim(),
                    ReviewStatus: 'pending',
                    ReviewTime: null,
                    ReviewOpinion: null,
                    ReviewSignatureUrl: null,
                    Approver: approver.trim(),
                    ApprovalStatus: 'pending',
                    ApprovalTime: null,
                    ApprovalOpinion: null,
                    ApprovalSignatureUrl: null
                })
                ElMessage.success('已添加审批区块')
            }).catch(() => { })
        }).catch(() => { })
    }

    /** 删除审批区块 */
    function removeSignatureBlock(projectIndex, blockIndex) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        ElMessageBox.confirm('确认删除该审批区块？', '提示', { type: 'warning' })
            .then(() => {
                project.reportData.signatureBlocks.splice(blockIndex, 1)
                ElMessage.success('已删除')
            })
            .catch(() => { })
    }

    // ==================== 审批操作 ====================

    /** 审核通过 */
    async function handleApproveReview(projectIndex, blockIndex) {
        try {
            await ElMessageBox.confirm('确认审核通过？', '提示', {
                confirmButtonText: '确认通过',
                cancelButtonText: '取消',
                type: 'warning'
            })
        } catch {
            return   
        }

        try {
            const res = await axios.post('/api/Approval/ApproveReview', {
                reportId: props.reportId,
                projectIndex: projectIndex,
                blockIndex: blockIndex,
                opinion: ''                          
            })
            if (res.data.Success) {
                ElMessage.success('审核通过')
                emit('refreshReport')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('操作失败')
        }
    }

    /** 审核驳回 */
    async function handleRejectReview(projectIndex, blockIndex) {
        try {
            const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回', {
                confirmButtonText: '确认驳回',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputPlaceholder: '请说明驳回原因'
            })
            const res = await axios.post('/api/Approval/RejectReview', {
                reportId: props.reportId,
                projectIndex: projectIndex,
                blockIndex: blockIndex,
                reason: reason
            })
            if (res.data.Success) {
                ElMessage.success('已驳回')
                emit('refreshReport')
            } else {
                ElMessage.error(res.data.message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.info('已取消')
        }
    }

    /** 批准通过 */
    async function handleApproveApproval(projectIndex, blockIndex) {
        try {
            await ElMessageBox.confirm('确认批准通过？', '提示', {
                confirmButtonText: '确认批准',
                cancelButtonText: '取消',
                type: 'warning'
            })
        } catch {
            return
        }

        try {
            const res = await axios.post('/api/Approval/ApproveApproval', {
                reportId: props.reportId,
                projectIndex: projectIndex,
                blockIndex: blockIndex,
                opinion: ''
            })
            if (res.data.Success) {
                ElMessage.success('批准通过')
                emit('refreshReport')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('操作失败')
        }
    }

    /** 一键通过当前用户负责的所有审核区块 */
    async function batchApproveReview() {
        // 收集当前用户负责的所有待审核区块
        const tasks = []
            ; (props.testProjects || []).forEach((p, pi) => {
                const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
                blocks.forEach((b, bi) => {
                    if (canReviewBlock(b)) {
                        tasks.push({ pi, bi })
                    }
                })
            })

        if (!tasks.length) {
            ElMessage.warning('没有待您审核的区块')
            return
        }

        // 确认弹窗
        try {
            await ElMessageBox.confirm(
                `确认一键通过您负责的 ${tasks.length} 个审核区块？`,
                '提示',
                { confirmButtonText: '确认通过', cancelButtonText: '取消', type: 'warning' }
            )
        } catch {
            return
        }

        // 循环提交
        let ok = 0
        for (const { pi, bi } of tasks) {
            try {
                const res = await axios.post('/api/Approval/ApproveReview', {
                    reportId: props.reportId,
                    projectIndex: pi,
                    blockIndex: bi,
                    opinion: ''
                })
                if (res.data.Success) ok++
            } catch { /* 单块失败不阻断 */ }
        }

        ElMessage.success(`已通过 ${ok} / ${tasks.length} 个区块`)
        emit('refreshReport')
    }

    /** 一键批准当前用户负责的所有批准区块 */
    async function batchApproveApproval() {
        // 收集当前用户负责的所有待批准区块
        const tasks = []
            ; (props.testProjects || []).forEach((p, pi) => {
                const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
                blocks.forEach((b, bi) => {
                    if (canApproveBlock(b)) {
                        tasks.push({ pi, bi })
                    }
                })
            })

        if (!tasks.length) {
            ElMessage.warning('没有待您批准的区块')
            return
        }

        // 确认弹窗
        try {
            await ElMessageBox.confirm(
                `确认一键批准您负责的 ${tasks.length} 个批准区块？`,
                '提示',
                { confirmButtonText: '确认批准', cancelButtonText: '取消', type: 'warning' }
            )
        } catch {
            return
        }

        // 循环提交
        let ok = 0
        for (const { pi, bi } of tasks) {
            try {
                const res = await axios.post('/api/Approval/ApproveApproval', {
                    reportId: props.reportId,
                    projectIndex: pi,
                    blockIndex: bi,
                    opinion: ''
                })
                if (res.data.Success) ok++
            } catch { /* 单块失败不阻断 */ }
        }

        ElMessage.success(`已批准 ${ok} / ${tasks.length} 个区块`)
        emit('refreshReport')
    }

    /** 批准驳回 */
    async function handleRejectApproval(projectIndex, blockIndex) {
        try {
            const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回', {
                confirmButtonText: '确认驳回',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputPlaceholder: '请说明驳回原因'
            })
            const res = await axios.post('/api/Approval/RejectApproval', {
                reportId: props.reportId,
                projectIndex: projectIndex,
                blockIndex: blockIndex,
                reason: reason
            })
            if (res.data.Success) {
                ElMessage.success('已驳回')
                emit('refreshReport')
            } else {
                ElMessage.error(res.data.Message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.info('已取消')
        }
    }

    /** 转办 */
    async function handleTransfer(projectIndex, blockIndex, nodeType) {
        const isReview = nodeType === 'review'
        const options = isReview ? REVIEWER_OPTIONS : APPROVER_OPTIONS
        const roleName = isReview ? '审核人' : '批准人'

        // 用一个 ref 接住下拉框选中值
        const selected = ref('')

        try {
            await ElMessageBox({
                title: '转办',
                message: () => h('div', [
                    h('div', { style: 'margin-bottom: 12px; font-size: 13px; color: #666;' },
                        `当前${roleName}：${currentUser}`),
                    h(ElSelect, {
                        modelValue: selected.value,
                        'onUpdate:modelValue': (v) => { selected.value = v },
                        placeholder: `请选择转办目标${roleName}`,
                        style: 'width: 100%',
                        size: 'default',
                        clearable: true
                    }, () => options.map(opt =>
                        h(ElOption, { key: opt, label: opt, value: opt })
                    ))
                ]),
                showCancelButton: true,
                confirmButtonText: '确认转办',
                cancelButtonText: '取消',
                closeOnClickModal: false
            })

            const targetUser = (selected.value || '').trim()

            if (!targetUser) {
                ElMessage.warning('请选择转办目标人')
                return
            }
            if (targetUser === currentUser) {
                ElMessage.warning('不能转办给自己')
                return
            }

            const res = await axios.post('/api/Approval/Transfer', {
                reportId: props.reportId,
                projectIndex: projectIndex,
                blockIndex: blockIndex,
                targetUser: targetUser
            })
            if (res.data.Success) {
                ElMessage.success(`已转办给 ${targetUser}`)
                emit('refreshReport')
            } else {
                ElMessage.error(res.data.message || '操作失败')
            }
        } catch (e) {
            if (e !== 'cancel') ElMessage.info('已取消')
        }
    }

    // ============================================================
    // 审批签名功能
    // ============================================================

    // 1. 插入审批区域
    function addSignatureGroup(projectIndex) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        // 初始化 reportData 的审批字段
        project.reportData.reviewer = ''
        project.reportData.reviewStatus = 'pending'
        project.reportData.reviewSignatureUrl = ''
        project.reportData.approver = ''
        project.reportData.approvalStatus = 'pending'
        project.reportData.approvalSignatureUrl = ''

        // 保留 signatureItems 用于打印（自动从上述字段生成）
        project.reportData.signatureItems = [
            { role: '编制', enLabel: 'Compiled by', name: currentUser || '', signatureUrl: '' },
            { role: '审核', enLabel: 'Reviewed by', name: project.reportData.reviewer, signatureUrl: project.reportData.reviewSignatureUrl },
            { role: '批准', enLabel: 'Approved by', name: project.reportData.approver, signatureUrl: project.reportData.approvalSignatureUrl }
        ]
    }

    // 2. 删除审批区域
    function removeSignatureGroup(projectIndex) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        // 清空所有审批相关数据
        project.reportData.signatureItems = []
        project.reportData.signatureBlocks = [] 
        project.reportData.reviewer = ''
        project.reportData.reviewStatus = 'pending'
        project.reportData.reviewSignatureUrl = ''
        project.reportData.approver = ''
        project.reportData.approvalStatus = 'pending'
        project.reportData.approvalSignatureUrl = ''
        project.reportData.compiledSignatureUrl = ''

        ElMessage.success('已删除审批区域')
    }

    // 3. 加载签名到指定角色
    async function loadSignatureToItem(projectIndex, role) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        const sig = project.reportData.signatureItems.find(s => s.role === role)
        if (!sig) return

        if (!currentUser) {
            ElMessage.warning('请先登录')
            return
        }

        try {
            const res = await axios.get('/api/user/signature')

            if (res.data.success && res.data.data) {
                const sigUrl = res.data.data.signatureUrl

                // 1. 更新 signatureItems
                sig.signatureUrl = sigUrl
                sig.name = currentUser

                // 2. 同时更新 reportData 中的对应字段（确保预览时数据一致）
                if (role === '编制') {
                    project.reportData.compiledSignatureUrl = sigUrl
                } else if (role === '审核') {
                    project.reportData.reviewSignatureUrl = sigUrl
                } else if (role === '批准') {
                    project.reportData.approvalSignatureUrl = sigUrl
                }

                ElMessage.success(`已加载 ${role} 签名`)
            } else {
                ElMessage.warning('您还未上传签名，请先到个人中心上传')
            }
        } catch (err) {
            console.error('加载签名失败', err)
            ElMessage.error('加载签名失败，请检查网络')
        }
    }

    // 4. 移除单个角色的签名（只清除显示，不删除个人中心图片）
    function removeSignatureFromItem(projectIndex, role) {
        const project = props.testProjects[projectIndex]
        if (!project) return

        const sig = project.reportData.signatureItems?.find(s => s.role === role)
        if (sig) {
            sig.signatureUrl = ''
            sig.name = ''
        }

        // 编制只清 compiledSignatureUrl，不动 blocks
        if (role === '编制') {
            project.reportData.compiledSignatureUrl = ''
        } else if (role === '审核') {
            project.reportData.reviewSignatureUrl = ''
            const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
            for (const block of blocks) {
                if ('ReviewSignatureUrl' in block) block.ReviewSignatureUrl = null
                else block.review_signature_url = null
            }
        } else if (role === '批准') {
            project.reportData.approvalSignatureUrl = ''
            const blocks = project.reportData.signatureBlocks || project.reportData.SignatureBlocks || []
            for (const block of blocks) {
                if ('ApprovalSignatureUrl' in block) block.ApprovalSignatureUrl = null
                else block.approval_signature_url = null
            }
        }

        ElMessage.success(`已取消 ${role} 签名`)
    }

    watch(() => props.testProjects, (newVal) => {
        console.log(' ContentTab testProjects 更新:', newVal);
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
        document.addEventListener('paste', handleGlobalPaste)
    })
    onUnmounted(() => {
        document.removeEventListener('paste', handleGlobalPaste)
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

    function handleCellPaste(event, tableData, rowIndex, col) {
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return

        const lines = text.split(/\r?\n/).filter(l => l !== '')

        // 单值 走浏览器默认（只填当前格）
        if (lines.length <= 1) return

        // 多行  拦截默认，从当前行往下分发
        event.preventDefault()

        let filled = 0
        lines.forEach((raw, i) => {
            const targetIdx = rowIndex + i
            if (!tableData[targetIdx]) return
            const val = raw.split('\t')[0].trim()
            tableData[targetIdx][col.id] = val
            filled++
        })

        if (filled < lines.length) {
            ElMessage.warning(`表格行数不足，仅填入 ${filled} 行（剪贴板共 ${lines.length} 行）`)
        } else {
            ElMessage.success(`已粘贴 ${filled} 行`)
        }
    }

    // ===== 照片上传相关 =====
    const uploadRefs = ref({})

    const setUploadRef = (el, projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        if (el) uploadRefs.value[key] = el
    }

    const triggerUpload = (projectIndex, rowIndex, type) => {
        const key = `${projectIndex}_${rowIndex}_${type}`
        uploadRefs.value[key]?.click()
    }

    // 抽出的核心上传逻辑（点击上传、粘贴上传共用）
    async function doUploadFile(file, projectIndex, rowIndex, type) {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            ElMessage.error('仅支持图片')
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            ElMessage.error('最大20MB')
            return
        }
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post('/api/upload/image', formData)
            if (res.data.success) {
                const row = props.testProjects[projectIndex].reportData.photoRows[rowIndex]
                let url = res.data.url
                if (url && url.includes('/api/upload/image/')) {
                    url = url.replace('/api/upload/image/', '/uploads/')
                }
                type === 1 ? (row.LeftUrl = url) : (row.RightUrl = url)
                ElMessage.success('上传成功')
            } else {
                ElMessage.error(res.data.message || '上传失败')
            }
        } catch (err) {
            ElMessage.error('上传失败')
        }
    }

    // 点击上传  复用 doUploadFile
    const uploadPhoto = async (e, projectIndex, rowIndex, type) => {
        const file = e.target.files[0]
        if (!file) return
        await doUploadFile(file, projectIndex, rowIndex, type)
        e.target.value = ''   // 清空，允许上传同一个文件
    }

    // ===== 照片粘贴功能 =====
    const activePhotoSlot = ref(null)   // { projectIndex, rowIndex, type } | null

    function focusPhotoSlot(projectIndex, rowIndex, type) {
        if (props.isDetail) return
        activePhotoSlot.value = { projectIndex, rowIndex, type }
    }

    function blurPhotoSlot() {
        activePhotoSlot.value = null
    }

    function isPhotoSlotActive(projectIndex, rowIndex, type) {
        const s = activePhotoSlot.value
        return !!s && s.projectIndex === projectIndex && s.rowIndex === rowIndex && s.type === type
    }

    // 找第一个空位：按项目顺序 / 行顺序 / 左图优先
    function findFirstEmptyPhotoSlot() {
        const projects = props.testProjects || []
        for (let pi = 0; pi < projects.length; pi++) {
            const rows = projects[pi].reportData?.photoRows || []
            for (let ri = 0; ri < rows.length; ri++) {
                if (!rows[ri].LeftUrl) return { projectIndex: pi, rowIndex: ri, type: 1 }
                if (!rows[ri].RightUrl) return { projectIndex: pi, rowIndex: ri, type: 2 }
            }
        }
        return null
    }

    // 全局 paste 监听：悬停优先，其次第一个空位
    async function handleGlobalPaste(e) {
        if (props.isDetail) return

        // 输入框里粘贴不拦截（让用户正常粘贴文本）
        const tag = (e.target?.tagName || '').toLowerCase()
        if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return

        // 从剪贴板里找图片
        const items = e.clipboardData?.items || []
        let file = null
        for (const item of items) {
            if (item.type && item.type.startsWith('image/')) {
                file = item.getAsFile()
                if (file) break
            }
        }
        if (!file) return

        e.preventDefault()

        // 悬停优先，否则找第一个空位
        let slot = activePhotoSlot.value
        if (!slot) slot = findFirstEmptyPhotoSlot()
        if (!slot) {
            ElMessage.warning('照片区已满，请先新增照片行')
            return
        }

        await doUploadFile(file, slot.projectIndex, slot.rowIndex, slot.type)
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
        if (type === 1) {
            row.LeftUrl = ''
        } else {
            row.RightUrl = ''
        }
        ElMessage.success('已删除图片（描述保留）')
    }

    const validTestProjects = computed(() => {
    const valid = props.testProjects?.filter(Boolean) || []
    console.log(' validTestProjects 长度:', valid.length)
    valid.forEach((p, i) => {
        console.log(`项目 ${i}:`, p.projectCode, p.schemeConfig?.ProjectTitle, 'impactGroups 长度:', p.reportData?.impactGroups?.length)
    })
    return valid
    })

    /**
 * 获取某个审批区块覆盖的所有项目名称
 * @param {number} projectIndex - 当前区块所在项目在 validTestProjects 里的下标
 * @param {number} blockIndex - 当前项目下的区块下标
 */
    function getBlockProjectNames(projectIndex, blockIndex) {
        const projects = validTestProjects.value || []

        // 1. 收集所有区块的位置（按项目顺序）
        const positions = []
        projects.forEach((p, pi) => {
            const blocks = p?.reportData?.signatureBlocks || p?.reportData?.SignatureBlocks || []
            blocks.forEach((b, bi) => {
                positions.push({ pi, bi })
            })
        })

        // 2. 找当前区块在列表里的位置
        const idx = positions.findIndex(x => x.pi === projectIndex && x.bi === blockIndex)
        if (idx === -1) {
            // 找不到就只返回当前项目
            const p = projects[projectIndex]
            return p?.schemeConfig?.ProjectTitle || p?.techSpecName || '检测项目'
        }

        // 3. 起始项目 = 上一个区块结束位置 + 1（若无上一个则为 0）
        const startPi = idx === 0 ? 0 : positions[idx - 1].pi + 1

        // 4. 结束项目 = 当前项目
        const endPi = projectIndex

        // 5. 拼名字
        return projects
            .slice(startPi, endPi + 1)
            .map(p => p?.schemeConfig?.ProjectTitle || p?.techSpecName || '检测项目')
            .filter(Boolean)
            .join('、')
    }

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

    /* 分组间距控制 */
    .group-spacing-wrapper {
        position: relative;
    }

    .group-spacing-module {
        position: absolute;
        top: -35px;
        right: 0;
        z-index: 99;
    }

    .group-input {
        opacity: 0;
        pointer-events: none;
    }

    .group-spacing-wrapper:hover .group-input {
        opacity: 1;
        pointer-events: all;
    }

    /* textarea 版的 param-input 样式 */
.param-input :deep(.el-textarea__inner) {
    border: none !important;
    text-align: center !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    resize: none !important;
    min-height: auto !important;
}


</style>