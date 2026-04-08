<template>
    <div class="config-container" style="padding: 20px;">
        <h2>检测项目模板配置</h2>

        <!-- 选择检测项目下拉框 → 云表实时项目 -->
        <el-select v-model="selectedProjectCode"
                   placeholder="请选择检测项目"
                   @change="loadSchemes"
                   style="width: 300px; margin-bottom: 20px;"
                   clearable>
            <el-option v-for="p in projects"
                       :key="p.EnvCode || p.projectCode"
                       :label="p.ProjectName || p.projectName"
                       :value="p.EnvCode || p.projectCode" />
        </el-select>

        <!-- 配置方案列表 -->
        <div class="scheme-list" v-if="selectedProjectCode">
            <el-button type="primary" @click="showAddDialog">+ 新增配置方案</el-button>
            <el-table :data="schemes"
                      border
                      style="margin-top: 10px; width: 100%;"
                      stripe>
                <el-table-column label="技术要求" prop="SchemeName" width="200" />
                <el-table-column label="版本" prop="ConfigVersion" width="80" />

                <!--
                             <el-table-column label="状态">
                <template #default="{ row }">
                    <el-tag :type="row.IsActive ? 'success' : 'info'" size="small">
                        {{ row.IsActive ? '激活' : '未激活' }}
                    </el-tag>
                </template>
            </el-table-column>
            -->

                <el-table-column label="创建人" prop="createName" width="120" />
                <el-table-column label="创建时间" prop="CreateTime" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.CreateTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="修改人" prop="updateName" width="120" />
                <el-table-column label="修改时间" prop="UpdateTime" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.UpdateTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button type="text" size="small" @click="editScheme(row)">编辑</el-button>
                        <!--

                    <el-button type="text"
                               size="small"
                               @click="activateScheme(row.SchemeId)"
                               :disabled="row.IsActive">
                        激活
                    </el-button>-->
                        <el-button type="text" size="small" color="danger" @click="deleteScheme(row.SchemeId)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 新增/编辑弹窗（核心配置区域） -->
        <el-dialog v-model="dialogVisible"
                   width="98%"
                   append-to-body
                   :close-on-click-modal="false">
            <template #header>
                <div style="width: 100%; text-align: center; font-size: 18px; font-weight: 600; padding: 10px 0;">
                    {{ isEdit ? '编辑方案' : '新增配置方案' }}
                </div>
            </template>

            <el-form :model="form" label-width="120px" style="margin-bottom: 20px;">
                <el-form-item label="技术要求" required>
                    <el-select v-model="form.techSpec_code"
                               placeholder="请选择技术要求"
                               style="width: 400px;"
                               clearable
                               filterable
                               :loading="techLoading">
                        <el-option v-for="item in techList"
                                   :key="item.Id"
                                   :label="item.Name"
                                   :value="item.Id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="项目标题（中英文）" label-width="140px">
                    <div style="display: flex; gap: 10px;">
                        <el-input v-model="form.ProjectTitle"
                                  placeholder="中文标题（如：室温拉伸试验）"
                                  style="width: 200px;"
                                  size="small" />
                        <el-input v-model="form.ProjectEnTitle"
                                  placeholder="英文标题（如：Tensile Test at Room Temperature）"
                                  style="width: 250px;"
                                  size="small" />
                    </div>
                </el-form-item>
                <el-form-item label="检测依据（中英文）" label-width="140px">
                    <div style="display: flex; gap: 10px;">
                        <el-input v-model="form.TestReference"
                                  placeholder="中文（如：ASTM A370-24）"
                                  style="width: 200px;"
                                  size="small" />
                        <el-input v-model="form.TestReferenceEn"
                                  placeholder="英文（如：Test Reference）"
                                  style="width: 250px;"
                                  size="small" />
                    </div>
                </el-form-item>
                <el-form-item label-width="140px">
                    <el-button type="success" size="small" @click="showPreviewDialog">📊 表格可视化预览</el-button>
                </el-form-item>
            </el-form>

            <!-- 左边：参数配置 + 右边：表头分组 → 左右并排布局 -->
            <div style="margin-bottom: 15px; display: flex; gap: 15px;">
                <!-- 左侧：尺寸/温度/缺口 参数配置（中英文双输入框） -->
                <div style="width: 38%; min-width: 400px;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">试样参数（尺寸/温度/缺口）</h4>
                                <el-button type="primary" size="small" @click="addParamItem">+ 新增</el-button>
                            </div>
                        </template>

                        <div ref="paramRef"
                             class="param-list"
                             style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; background: #fff;">
                            <div v-for="(param, index) in form.ParamItems"
                                 :key="param.id"
                                 style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <!-- 中文名称 -->
                                    <el-input v-model="param.label" placeholder="中文名称（如：尺寸类型）" style="width: 150px;" size="small" />
                                    <!-- 英文名称 -->
                                    <el-input v-model="param.enLabel" placeholder="英文名称（如：Dimension Type）" style="width: 180px;" size="small" />
                                </div>
                                <el-button type="text" color="danger" size="small" @click="deleteParamItem(index)">删除</el-button>
                            </div>

                            <div v-if="form.ParamItems.length === 0" style="text-align: center; color: #999; padding: 10px;">
                                请添加：尺寸类型、测试温度、缺口类型（支持中英文）
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 右侧：表头分组配置 -->
                <div style="width: 62%;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">表头分组配置（检测位置/试样编号）</h4>
                                <el-button type="primary" size="small" @click="addGroupHeader">+ 新增分组</el-button>
                            </div>
                        </template>

                        <div ref="groupHeaderRef"
                             style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; background: #fff;">
                            <div v-for="(group, index) in form.GroupHeaders"
                                 :key="group.id"
                                 style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <el-input v-model="group.label" placeholder="标题" style="width: 150px;" size="small" />
                                    <el-input v-model="group.enLabel" placeholder="英文" style="width: 180px;" size="small" />
                                    <el-input v-model="group.colSpan" placeholder="合并列数" type="number" style="width: 100px;" size="small" />
                                </div>
                                <el-button type="text" color="danger" size="small" @click="deleteGroupHeader(index)">删除</el-button>
                            </div>

                            <div v-if="form.GroupHeaders.length === 0" style="text-align: center; color: #999; padding: 10px;">
                                用于配置：检测位置、试样编号
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 左→右水平布局：基础列 → 扩展列 → 尾部/特殊模块 -->
            <div class="config-main" style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
                <!-- 左侧：基础列（左侧表头） -->
                <div class="config-panel" style="width: 28%; min-width: 380px;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">基础列（左侧固定列）</h4>
                                <div>
                                    <el-button type="primary" size="small" @click="addColumn('base')">+ 新增</el-button>
                                    <el-button type="warning"
                                               size="small"
                                               @click="resetColumns('base')"
                                               style="margin-left: 8px;">
                                        清空
                                    </el-button>
                                </div>
                            </div>
                        </template>
                        <div ref="baseColumnRef"
                             class="column-list"
                             style="border: 1px solid #e6e6e6; padding: 10px; min-height: 350px; max-height: 500px; overflow-y: auto; background: #fff;">
                            <div v-for="(col, index) in form.BaseColumns"
                                 :key="col.id"
                                 class="column-item"
                                 style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <el-input v-model="col.label"
                                              placeholder="中文列名（如：试样编号）"
                                              style="width: 150px;"
                                              size="small" />
                                    <el-input v-model="col.enLabel"
                                              placeholder="英文列名（如：Sample No.）"
                                              style="width: 180px;"
                                              size="small" />
                                    <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                        <el-option label="文本" value="text" />
                                        <el-option label="数字" value="number" />
                                    </el-select>
                                </div>
                                <el-button type="text"
                                           color="danger"
                                           size="small"
                                           @click="deleteColumn(index, 'base')">
                                    删除
                                </el-button>
                            </div>
                            <div v-if="form.BaseColumns.length === 0" style="text-align: center; color: #999; padding: 15px;">
                                暂无基础列，点击「新增」添加
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 中间：扩展列（右侧检测列，支持子列） -->
                <div class="config-panel" style="width: 38%; min-width: 500px;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">扩展列（右侧检测列，支持子列）</h4>
                                <div>
                                    <el-button type="primary" size="small" @click="addColumn('extend')">+ 新增</el-button>
                                    <el-button type="warning"
                                               size="small"
                                               @click="resetColumns('extend')"
                                               style="margin-left: 8px;">
                                        清空
                                    </el-button>
                                </div>
                            </div>
                        </template>
                        <div ref="extendColumnRef"
                             class="column-list"
                             style="border: 1px solid #e6e6e6; padding: 10px; min-height: 350px; max-height: 500px; overflow-y: auto; background: #fff;">
                            <div v-for="(col, index) in form.ExtendColumns"
                                 :key="col.id"
                                 class="column-item"
                                 style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <el-input v-model="col.label"
                                              placeholder="中文列名（如：抗拉强度）"
                                              style="width: 150px;"
                                              size="small" />
                                    <el-input v-model="col.enLabel"
                                              placeholder="英文列名（如：Tensile Strength(MPa)）"
                                              style="width: 200px;"
                                              size="small" />
                                    <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                        <el-option label="文本" value="text" />
                                        <el-option label="数字" value="number" />
                                    </el-select>
                                    <el-input v-model="col.requirement"
                                              placeholder="技术要求"
                                              style="width: 120px;"
                                              size="small" />
                                    <el-button type="primary" size="small" @click="toggleSubColumns(col)">子列</el-button>
                                </div>
                                <el-button type="text"
                                           color="danger"
                                           size="small"
                                           @click="deleteColumn(index, 'extend')">
                                    删除
                                </el-button>
                            </div>
                            <div v-if="form.ExtendColumns.length === 0" style="text-align: center; color: #999; padding: 15px;">
                                暂无扩展列，点击「新增」添加
                            </div>

                            <!-- 子列配置弹窗 -->
                            <el-dialog v-model="subColumnDialogVisible"
                                       width="60%"
                                       title="子列配置"
                                       :close-on-click-modal="false">
                                <div style="margin-bottom:10px;">
                                    <el-button type="primary" size="small" @click="addSubColumn">+ 新增子列</el-button>
                                </div>
                                <div v-for="(subCol, subIndex) in currentSubColumns"
                                     :key="subCol.id"
                                     class="column-item"
                                     style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                    <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                    <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                        <el-input v-model="subCol.label"
                                                  placeholder="中文子列名（如：平均）"
                                                  style="width: 150px;"
                                                  size="small" />
                                        <el-input v-model="subCol.enLabel"
                                                  placeholder="英文子列名"
                                                  style="width: 180px;"
                                                  size="small" />
                                        <el-select v-model="subCol.type" placeholder="数据类型" style="width: 120px;" size="small">
                                            <el-option label="文本" value="text" />
                                            <el-option label="数字" value="number" />
                                        </el-select>
                                    </div>
                                    <el-button type="text"
                                               color="danger"
                                               size="small"
                                               @click="deleteSubColumn(subIndex)">
                                        删除
                                    </el-button>
                                </div>
                                <template #footer>
                                    <div style="display: flex; justify-content: center; gap: 20px;">
                                        <el-button @click="subColumnDialogVisible = false">取消</el-button>
                                        <el-button type="primary" @click="saveSubColumns">保存</el-button>
                                    </div>
                                </template>
                            </el-dialog>
                        </div>
                    </el-card>
                </div>

                <!-- 右侧：尾部配置 + 特殊模块 -->
                <div class="config-panel" style="width: 34%; min-width: 400px;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">尾部/特殊模块配置</h4>
                                <div>
                                    <el-button type="primary" size="small" @click="addColumn('footer')">+ 新增尾部字段</el-button>
                                    <el-button type="warning"
                                               size="small"
                                               @click="resetColumns('footer')"
                                               style="margin-left: 8px;">
                                        清空
                                    </el-button>
                                </div>
                            </div>
                        </template>
                        <div style="margin-bottom: 15px;">
                            <div style="color: #67c23a; font-weight: 500; margin-bottom: 10px;">尾部字段（自动合并行）</div>
                            <div ref="footerColumnRef"
                                 class="column-list"
                                 style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; max-height: 200px; overflow-y: auto; background: #fff;">
                                <div v-for="(col, index) in form.FooterColumns"
                                     :key="col.id"
                                     class="column-item"
                                     style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                    <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                    <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                        <el-input v-model="col.label"
                                                  placeholder="中文名称（如：结论）"
                                                  style="width: 150px;"
                                                  size="small" />
                                        <el-input v-model="col.enLabel"
                                                  placeholder="英文名称（如：Conclusion）"
                                                  style="width: 180px;"
                                                  size="small" />
                                        <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                            <el-option label="文本" value="text" />
                                            <el-option label="数字" value="number" />
                                        </el-select>
                                    </div>
                                    <el-button type="text"
                                               color="danger"
                                               size="small"
                                               @click="deleteColumn(index, 'footer')">
                                        删除
                                    </el-button>
                                </div>
                                <div v-if="form.FooterColumns.length === 0" style="text-align: center; color: #999; padding: 15px;">
                                    暂无尾部字段，点击「新增字段」添加（自动合并行）
                                </div>
                            </div>
                        </div>
                        <div style="margin-bottom:15px;">
                            <div style="color: #e6a23c; font-weight: 500; margin-bottom: 10px;">照片配置</div>
                            <div style="border: 1px solid #e6e6e6; padding: 15px; border-radius: 4px; background: #fff;">
                                <el-form-item label="启用照片模块" label-width="120px">
                                    <el-switch v-model="form.PhotoConfig.enabled" />
                                </el-form-item>
                                <el-form-item label="模块标题" label-width="120px">
                                    <el-input v-model="form.PhotoConfig.title"
                                              placeholder="如：腐蚀照片/晶粒度照片"
                                              style="width: 80%;"
                                              :disabled="!form.PhotoConfig.enabled"
                                              size="small" />
                                </el-form-item>
                                <div style="color: #999; font-size: 12px; margin-top: 8px; line-height: 1.5;">
                                    💡 启用后，在报告录入时可自由添加任意数量照片<br />
                                    💡 每插入一张照片，自动生成对应描述输入框
                                </div>
                            </div>
                        </div>

                        <!-- 审批列配置 -->
                        <div>
                            <div style="color: #409eff; font-weight: 500; margin-bottom: 10px;">审批列配置</div>
                            <div style="border: 1px solid #e6e6e6; padding: 15px; border-radius: 4px; background: #fff;">
                                <div style="margin-bottom:10px;">
                                    <el-button type="primary" size="small" @click="addApprovalItem">+ 新增审批项</el-button>
                                    <el-button type="warning" size="small" @click="clearApprovalItems" style="margin-left:8px;">清空</el-button>
                                </div>
                                <div ref="approvalRef" class="column-list" style="max-height:180px;overflow-y:auto;">
                                    <div v-for="(item, idx) in form.ApprovalItems" :key="item.id"
                                         style="display:flex;align-items:center;padding:6px;background:#f9f9f9;border-radius:4px;margin-bottom:6px;">
                                        <i class="el-icon-menu" style="margin-right:8px;cursor:move;color:#999;"></i>
                                        <el-input v-model="item.label" placeholder="如：审核" size="small" style="width:120px;"></el-input>
                                        <el-input v-model="item.enLabel" placeholder="英文" size="small" style="width:120px;"></el-input>
                                        <el-button type="text" color="danger" size="small" @click="deleteApprovalItem(idx)">删除</el-button>
                                    </div>
                                    <div v-if="form.ApprovalItems.length===0" style="text-align:center;color:#999;padding:10px;">
                                        暂无审批项
                                    </div>
                                </div>
                                <div style="font-size:12px;color:#999;margin-top:8px;">
                                    💡 预览时自动平摊宽度，占满整个表格
                                </div>
                            </div>
                        </div>

                    </el-card>
                </div>
            </div>

            <template #footer>
                <div style="width: 100%; display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveScheme">保存配置</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 表格可视化预览弹窗 -->
        <el-dialog v-model="previewDialogVisible"
                   width="95%"
                   title="表格可视化预览（1:1还原报告样式）"
                   :close-on-click-modal="false"
                   append-to-body>
            <div style="padding: 20px; background: #fff; border-radius: 8px;">
                <!-- 项目标题 -->
                <div style="background: #fff3cd; padding: 8px 12px; font-size: 16px; font-weight: 600; margin-bottom: 10px;">
                    {{ form.ProjectTitle || '项目标题' }}/{{ form.ProjectEnTitle || 'Project Title' }}
                </div>

                <!-- 检测依据 -->
                <div style="padding: 8px 12px; border-bottom: 1px solid #e6e6e6; margin-bottom: 10px;">
                    <span style="font-weight: 500;">
                        {{ form.TestReference || '检测依据' }} / {{ form.TestReferenceEn || 'Test Reference' }}
                    </span>
                </div>

                <!-- 🔥 【修复版】顶部试样参数栏（带参数值，1:1还原纸质报告，不影响原功能） -->
                <!-- 🔥 【最终绝对正确版】试样参数行（只显示当前模板有值的参数，无配置则不显示） -->
                <div v-if="form.ParamItems && form.ParamItems.length > 0">
                    <table border="1" cellpadding="6" cellspacing="0"
                           style="width: 100%; border-collapse: collapse; text-align: center;">
                        <tbody>
                            <tr>
                                <template v-for="param in form.ParamItems" :key="param.id">
                                    <td style="background: #d9d9d9; font-weight: 600;">
                                        <div>{{ param.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                    </td>
                                    <td style="background: #fff; font-weight: 500;">
                                        {{ param.value || '/' }}
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 表格主体 -->
                <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead>
                        <tr>
                            <!-- 基础列（中英文双行显示） -->
                            <th v-for="col in form.BaseColumns" :key="col.id" :rowspan="2" style="background: #d9d9d9;">
                                <div>{{ col.label }}</div>
                                <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                            </th>
                            <!-- 一级表头分组（中英文双行显示） -->
                            <template v-for="group in form.GroupHeaders.filter(g => !g.parentId)" :key="group.id">
                                <th :colspan="group.colSpan" style="background: #d9d9d9;">
                                    <div>{{ group.label }}</div>
                                    <div style="font-size: 12px; color: #666;">{{ group.enLabel }}</div>
                                </th>
                            </template>
                        </tr>
                        <tr>
                            <!-- 扩展列（二级表头，中英文双行显示） -->
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <th :colspan="col.subColumns?.length || 1" style="background: #e6e6e6;">
                                    <div>{{ col.label }}</div>
                                    <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                </th>
                            </template>
                        </tr>
                        <!-- 三级表头（子列，中英文双行显示） -->
                        <tr v-if="hasSubColumns">
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <template v-if="col.subColumns && col.subColumns.length > 0">
                                    <th v-for="subCol in col.subColumns" :key="subCol.id" style="background: #f0f0f0;">
                                        <div>{{ subCol.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                    </th>
                                </template>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 示例数据行 -->
                        <tr>
                            <td v-for="col in form.BaseColumns" :key="col.id">/</td>
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <template v-if="col.subColumns && col.subColumns.length > 0">
                                    <td v-for="subCol in col.subColumns" :key="subCol.id">/</td>
                                </template>
                                <td v-else>/</td>
                            </template>
                        </tr>

                        <!-- 技术要求行 -->
                        <!-- 技术要求行：仅当尾部配置中存在“技术要求”时才显示 -->
                        <tr v-if="form.FooterColumns.some(f => f.label === '技术要求')">
                            <td :colspan="baseTotalColSpan" style="background: #f9f9f9; text-align: left; font-weight: 500;">
                                {{ getFooterLabel('技术要求') }}
                            </td>
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <td v-if="!col.subColumns || col.subColumns.length === 0" style="background: #f9f9f9;">{{ col.requirement || '/' }}</td>
                            </template>
                        </tr>

                        <!-- 动态尾部行 -->
                        <tr v-for="footer in form.FooterColumns.filter(f => f.label !== '技术要求')" :key="footer.id" style="background: #f9f9f9;">
                            <td :colspan="baseTotalColSpan" style="text-align: left; font-weight: 500;">
                                {{ footer.label }} / {{ footer.enLabel || footer.label }}
                            </td>
                            <td :colspan="extendColSpan" style="font-weight: 500;">
                                {{ footer.label === '结论' ? '符合 / Qualified' : '/' }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- 照片模块预览 -->
                <div v-if="form.PhotoConfig.enabled" style="margin-top: 20px;">
                    <div style="font-weight: 600; margin-bottom: 10px;">{{ form.PhotoConfig.title }}</div>
                    <div style="border: 1px solid #e6e6e6; padding: 20px; text-align: center; color: #999;">
                        照片区域（录入时可添加多张照片）
                    </div>
                </div>

                <!-- 审批栏预览 -->
                <div v-if="form.ApprovalItems.length > 0" style="margin-top:20px;">
                    <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
                        <tbody>
                            <tr>
                                <td v-for="item in form.ApprovalItems"
                                    :key="item.id"
                                    style="width:calc(100% / {{form.ApprovalItems.length}});text-align:center;">
                                    <div style="font-weight:500;">{{ item.label }}</div>
                                    <div style="font-size:12px;color:#666;">{{ item.enLabel }}</div>
                                    <div style="height:30px;border-bottom:1px solid #ccc;margin-top:4px;"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <template #footer>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <el-button @click="previewDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick, computed } from 'vue'
    import Sortable from 'sortablejs'
    import axios from 'axios'
    import { ElMessage, ElMessageBox } from 'element-plus'

    // 时间格式化
    const formatDate = (time) => {
        if (!time) return "-";
        return new Date(time).toLocaleString("zh-CN");
    };

    // ========== 核心变量 ==========
    const selectedProjectCode = ref(null)
    const projects = ref([])
    const schemes = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)

    const techList = ref([])
    const techLoading = ref(false)

    // 子列
    const subColumnDialogVisible = ref(false)
    const currentSubColumns = ref([])
    const currentCol = ref(null)

    // 预览
    const previewDialogVisible = ref(false)

    // 拖拽
    const baseColumnRef = ref(null)
    const extendColumnRef = ref(null)
    const footerColumnRef = ref(null)
    const groupHeaderRef = ref(null)
    const approvalRef = ref(null)

    let sortableBase = null
    let sortableExtend = null
    let sortableFooter = null
    let sortableGroupHeader = null
    let sortableApproval = null

    // ========== 表单 ==========
    const form = reactive({
        SchemeId: 0,
        SchemeName: '',
        techSpec_code: null,
        ProjectTitle: '',
        ProjectEnTitle: '',
        TestReference: '',
        TestReferenceEn: '',
        GroupHeaders: [],
        BaseColumns: [],
        ExtendColumns: [],
        FooterColumns: [],
        PhotoConfig: { enabled: false, title: '照片' },
        ApprovalItems: [],
        ConfigVersion: 1,
        IsActive: false,
        ParamItems: []  

    })

    // ========== 计算属性 ==========
    const hasSubColumns = computed(() => {
        return form.ExtendColumns.some(col => col.subColumns && col.subColumns.length > 0)
    })

    const baseTotalColSpan = computed(() => form.BaseColumns.length || 1)
    const extendColSpan = computed(() => form.ExtendColumns.reduce((sum, col) => sum + (col.subColumns?.length || 1), 0) || 1)

    const getFooterLabel = (label) => {
        const col = form.FooterColumns.find(c => c.label === label)
        // 修复点：如果找不到，返回空字符串或者返回 '/'，而不是强制显示 '技术要求'
        return col ? (col.enLabel ? `${col.label}/${col.enLabel}` : col.label) : '';
        // 或者如果你希望找不到时也显示"/"，则改为 return col ? ... : '/'
    };


    const paramRef = ref(null)
    let sortableParam = null

    // ======================
    // 试样参数（尺寸/温度/缺口）

    const addParamItem = () => {
        form.ParamItems.push({
            id: Date.now(),
            label: '参数名称',
            enLabel: ''
        })
        nextTick(initAllSortable)
    }


    const deleteParamItem = (idx) => {
        form.ParamItems.splice(idx, 1)
    }

    // ========== 接口 ==========
    // ========== 加载云表检测项目环境（下拉框） ==========
    const loadProjects = async () => {
        try {
            // 调用云表接口
            const res = await axios.post('/api/yunbiao/project-env-list')

            projects.value = res.data.map(item => ({
                EnvCode: item.编码,          
                ProjectName: item.项目简称   
            }))
        } catch (err) {
            console.error('加载项目失败详情：', err)
            ElMessage.error('加载项目失败：' + (err.response?.data?.message || err.message))
        }
    }

    // 根据 projectCode 加载方案
    const loadSchemes = async () => {
        if (!selectedProjectCode.value) return
        try {
            const res = await axios.get(`/api/DetectionConfig/schemes-by-code/${selectedProjectCode.value}`)
            if (res.data.Success) {
                schemes.value = res.data.Data
            } else {
                ElMessage.error('加载方案失败：' + res.data.Message)
            }
        } catch (err) {
            ElMessage.error('加载配置方案失败')
        }
    }

    // 技术要求
    const getTechList = async () => {
        techLoading.value = true
        try {
            const res = await axios.get('/api/DetectionConfig/enable-tech-requirements')
            if (res.data.Success) techList.value = res.data.Data
        } catch {
            ElMessage.error('获取技术要求失败')
        } finally {
            techLoading.value = false
        }
    }

    // ========== 拖拽 ==========
    const initAllSortable = () => {
        const opt = { handle: '.el-icon-menu', animation: 150, ghostClass: 'sortable-ghost' }
        nextTick(() => {
            if (baseColumnRef.value) { if (sortableBase) sortableBase.destroy(); sortableBase = Sortable.create(baseColumnRef.value, opt) }
            if (extendColumnRef.value) { if (sortableExtend) sortableExtend.destroy(); sortableExtend = Sortable.create(extendColumnRef.value, opt) }
            if (footerColumnRef.value) { if (sortableFooter) sortableFooter.destroy(); sortableFooter = Sortable.create(footerColumnRef.value, opt) }
            if (groupHeaderRef.value) { if (sortableGroupHeader) sortableGroupHeader.destroy(); sortableGroupHeader = Sortable.create(groupHeaderRef.value, opt) }
            if (approvalRef.value) { if (sortableApproval) sortableApproval.destroy(); sortableApproval = Sortable.create(approvalRef.value, opt) }
            if (paramRef.value) {
                if (sortableParam) sortableParam.destroy()
                sortableParam = Sortable.create(paramRef.value, opt)
            }
        })
    }

    // ========== 列操作 ==========
    const addColumn = (type) => {
        const list = type === 'base' ? form.BaseColumns : type === 'extend' ? form.ExtendColumns : form.FooterColumns
        list.push({ id: Date.now(), label: `${type}列${list.length + 1}`, enLabel: '', type: 'text', requirement: type === 'extend' ? '' : '', subColumns: [] })
        nextTick(initAllSortable)
    }
    const addGroupHeader = () => { form.GroupHeaders.push({ id: Date.now(), label: '分组标题', enLabel: '', colSpan: 1, parentId: null }); nextTick(initAllSortable) }
    const deleteGroupHeader = idx => form.GroupHeaders.splice(idx, 1)
    const deleteColumn = (idx, type) => {
        const list = type === 'base' ? form.BaseColumns : type === 'extend' ? form.ExtendColumns : form.FooterColumns
        list.splice(idx, 1)
    }
    const resetColumns = type => {
        if (type === 'base') form.BaseColumns = []
        else if (type === 'extend') form.ExtendColumns = []
        else form.FooterColumns = []
    }

    // ========== 子列 ==========
    const toggleSubColumns = col => {
        currentCol.value = col
        currentSubColumns.value = JSON.parse(JSON.stringify(col.subColumns || []))
        subColumnDialogVisible.value = true
    }
    const addSubColumn = () => currentSubColumns.value.push({ id: Date.now(), label: '子列', enLabel: '', type: 'text' })
    const saveSubColumns = () => {
        if (currentCol.value) currentCol.value.subColumns = currentSubColumns.value
        subColumnDialogVisible.value = false
    }
    const deleteSubColumn = idx => currentSubColumns.value.splice(idx, 1)

    // ========== 审批 ==========
    const addApprovalItem = () => {
        form.ApprovalItems.push({ id: Date.now(), label: '审批', enLabel: '' })
        nextTick(initAllSortable)
    }
    const deleteApprovalItem = idx => form.ApprovalItems.splice(idx, 1)
    const clearApprovalItems = () => { form.ApprovalItems = [] }

    // ========== 弹窗 ==========
    const showAddDialog = () => {
        isEdit.value = false
        Object.assign(form, {
            SchemeId: 0, SchemeName: '', techSpec_code: null,
            ProjectTitle: '', ProjectEnTitle: '', TestReference: '', TestReferenceEn: '',
            GroupHeaders: [], BaseColumns: [], ExtendColumns: [], FooterColumns: [],
            PhotoConfig: { enabled: false, title: '照片' }, ApprovalItems: [],
            ConfigVersion: 1, IsActive: false,
            ParamItems: [] 
        })
        dialogVisible.value = true
        nextTick(initAllSortable)
    }

    const editScheme = row => {
        isEdit.value = true
        const cfg = JSON.parse(row.ConfigContent || '{}')
        Object.assign(form, {
            SchemeId: row.SchemeId,
            SchemeName: row.SchemeName,
            techSpec_code: row.TechSpecCode || null,
            ProjectTitle: cfg.ProjectTitle || '',
            ProjectEnTitle: cfg.ProjectEnTitle || '',
            TestReference: cfg.TestReference || '',
            TestReferenceEn: cfg.TestReferenceEn || '',
            GroupHeaders: cfg.GroupHeaders || [],
            BaseColumns: cfg.BaseColumns || [],
            ExtendColumns: cfg.ExtendColumns || [],
            FooterColumns: cfg.FooterColumns || [],
            PhotoConfig: cfg.PhotoConfig || { enabled: false, title: '照片' },
            ApprovalItems: cfg.ApprovalItems || [],
            ConfigVersion: row.ConfigVersion || 1,
            IsActive: row.IsActive || false,
            ParamItems: cfg.ParamItems || []  

        })
        dialogVisible.value = true
        nextTick(initAllSortable)
    }

    const showPreviewDialog = () => previewDialogVisible.value = true

    // ========== 保存 ==========
    const saveScheme = async () => {
        if (!selectedProjectCode.value) return ElMessage.warning('请选择检测项目')
        if (!form.techSpec_code) return ElMessage.warning('请选择技术要求')

        const tech = techList.value.find(t => t.Id === form.techSpec_code)
        if (tech) form.SchemeName = tech.Name

        const userName = localStorage.getItem('username') || '管理员'
        const now = new Date().toISOString()

        const data = {
            SchemeId: form.SchemeId,
            ProjectCode: selectedProjectCode.value,
            SchemeName: form.SchemeName,
            TechSpecCode: form.techSpec_code,
            ConfigContent: JSON.stringify(form),
            ConfigVersion: isEdit.value ? form.ConfigVersion : 1,
            IsActive: isEdit.value ? form.IsActive : false,
            createName: userName,
            updateName: userName,
            CreateTime: isEdit.value ? form.CreateTime : now,
            UpdateTime: now
        }

        try {
            if (isEdit.value) {
                await axios.put(`/api/DetectionConfig/scheme/${form.SchemeId}`, data)
            } else {
                await axios.post('/api/DetectionConfig/scheme', data)
            }
            ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
            dialogVisible.value = false
            loadSchemes()
        } catch (e) {
            ElMessage.error('保存失败：' + (e.response?.data?.Message || e.message))
        }
    }

    /** 
    // 激活/删除
    const activateScheme = async (id) => {
        await axios.post(`/api/DetectionConfig/scheme/${id}/activate`)
        ElMessage.success('激活成功')
        loadSchemes()
    }
    */
    const deleteScheme = async (id) => {
        await ElMessageBox.confirm('确定删除该配置？', '警告', { type: 'warning' })
        await axios.delete(`/api/DetectionConfig/scheme/${id}`)
        ElMessage.success('删除成功')
        loadSchemes()
    }

    onMounted(() => {
        loadProjects()
        getTechList()
    })
</script>

<style scoped>
    .config-main {
        display: flex;
        gap: 15px;
        overflow-x: auto;
        padding-bottom: 10px
    }

    .config-panel {
        flex: 1;
        min-width: 400px
    }

    .column-item:hover {
        background: #f0f9ff !important
    }

    .sortable-ghost {
        opacity: .5;
        background: #e6e6e6 !important
    }

    table {
        width: 100%;
        border-collapse: collapse
    }

    th, td {
        border: 1px solid #ccc;
        padding: 6px;
        text-align: center
    }

    th {
        background: #d9d9d9;
        font-weight: 600
    }
</style>