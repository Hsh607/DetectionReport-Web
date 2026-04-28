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

            <!-- 试样参数配置 -->
            <div style="margin-bottom: 15px;">
                <div style="width: 100%;">
                    <el-card shadow="hover">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">试样参数（尺寸/温度/缺口）</h4>
                                <el-button type="primary" size="small" @click="addParamItem">+ 新增</el-button>
                            </div>
                        </template>
                        <div ref="paramRef" class="param-list" style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; background: #fff;">
                            <div v-for="(param, index) in form.ParamItems" :key="param.id" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <el-input v-model="param.label" placeholder="中文名称" style="width: 150px;" size="small" />
                                    <el-input v-model="param.enLabel" placeholder="英文名称" style="width: 180px;" size="small" />
                                    <el-select v-model="param.yunbiaoField"
                                               placeholder="绑定云表字段"
                                               style="width: 160px;"
                                               size="small"
                                               clearable>
                                        <el-option v-for="field in yunbiaoFields"
                                                   :key="field.FieldName"
                                                   :label="`${field.FieldAlias} (${field.FieldName})`"
                                                   :value="field.FieldAlias" />
                                    </el-select>
                                </div>
                                <el-button type="text" color="danger" size="small" @click="deleteParamItem(index)">删除</el-button>
                            </div>
                            <div v-if="form.ParamItems.length === 0" style="text-align: center; color: #999; padding: 10px;">
                                请添加：尺寸类型、测试温度、缺口类型（支持中英文）
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 左→右水平布局：基础列 → 扩展列 → 尾部/特殊模块 -->
            <div class="config-main" style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
                <!-- 左侧：基础列（左侧固定列） -->
                <div class="config-panel" style="width: 28%; min-width: 380px;">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">基础列（左侧固定列）</h4>
                                <div>
                                    <el-button type="primary" size="small" @click="addColumn('base')">+ 新增</el-button>
                                    <el-button type="warning" size="small" @click="resetColumns('base')" style="margin-left: 8px;">清空</el-button>
                                </div>
                            </div>
                        </template>
                        <div ref="baseColumnRef" class="column-list" style="border: 1px solid #e6e6e6; padding: 10px; min-height: 350px; max-height: 500px; overflow-y: auto; background: #fff;">
                            <div v-for="(col, index) in form.BaseColumns" :key="col.id" class="column-item" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                    <el-input v-model="col.label" placeholder="中文列名" style="width: 150px;" size="small" />
                                    <el-input v-model="col.enLabel" placeholder="英文列名" style="width: 180px;" size="small" />
                                    <el-select v-model="col.yunbiaoField"
                                               placeholder="绑定云表字段"
                                               style="width: 160px;"
                                               size="small"
                                               clearable>
                                        <el-option v-for="field in yunbiaoFields"
                                                   :key="field.FieldName"
                                                   :label="`${field.FieldAlias} (${field.FieldName})`"
                                                   :value="field.FieldAlias" />
                                    </el-select>
                                    <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                        <el-option label="文本" value="text" />
                                        <el-option label="数字" value="number" />
                                    </el-select>
                                </div>
                                <el-button type="text" color="danger" size="small" @click="deleteColumn(index, 'base')">删除</el-button>
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
                                    <el-button type="warning" size="small" @click="resetColumns('extend')" style="margin-left: 8px;">清空</el-button>
                                </div>
                            </div>
                        </template>
                        <div ref="extendColumnRef" class="column-list" style="border: 1px solid #e6e6e6; padding: 10px; min-height: 350px; max-height: 500px; overflow-y: auto; background: #fff;">
                            <div v-for="(col, index) in form.ExtendColumns" :key="col.id" class="column-item" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                                    <el-input v-model="col.label" placeholder="中文列名" style="width: 150px;" size="small" />
                                    <el-input v-model="col.enLabel" placeholder="英文列名" style="width: 200px;" size="small" />
                                    <el-select v-model="col.yunbiaoField"
                                               placeholder="绑定云表字段"
                                               style="width: 160px;"
                                               size="small"
                                               clearable>
                                        <el-option v-for="field in yunbiaoFields"
                                                   :key="field.FieldName"
                                                   :label="`${field.FieldAlias} (${field.FieldName})`"
                                                   :value="field.FieldAlias" />
                                    </el-select>
                                    <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                        <el-option label="文本" value="text" />
                                        <el-option label="数字" value="number" />
                                    </el-select>

                                    <!-- 动态列开关 + 切换事件 -->
                                    <el-switch v-model="col.isDynamic"
                                               active-text="动态列"
                                               inactive-text="固定列"
                                               size="small"
                                               @change="handleDynamicChange(col)" />

                                    <!-- 仅固定列显示手动子列按钮 -->
                                    <el-button type="primary"
                                               size="small"
                                               @click="toggleSubColumns(col)"
                                               v-if="!col.isDynamic">
                                        子列
                                    </el-button>

                                    <!-- 动态列提示 -->
                                    <span v-if="col.isDynamic" style="color: #409eff; font-size: 12px;">（自动生成试样子列）</span>
                                </div>
                                <el-button type="text" color="danger" size="small" @click="deleteColumn(index, 'extend')">删除</el-button>
                            </div>
                            <div v-if="form.ExtendColumns.length === 0" style="text-align: center; color: #999; padding: 15px;">
                                暂无扩展列，点击「新增」添加
                            </div>

                            <!-- 子列配置弹窗 -->
                            <el-dialog v-model="subColumnDialogVisible" width="60%" title="子列配置" :close-on-click-modal="false">
                                <div style="margin-bottom:10px;">
                                    <el-button type="primary" size="small" @click="addSubColumn">+ 新增子列</el-button>
                                </div>
                                <div v-for="(subCol, subIndex) in currentSubColumns" :key="subCol.id" class="column-item" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                    <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                    <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                        <el-input v-model="subCol.label" placeholder="中文子列名" style="width: 150px;" size="small" />
                                        <el-input v-model="subCol.enLabel" placeholder="英文子列名" style="width: 180px;" size="small" />
                                        <el-select v-model="subCol.yunbiaoField"
                                                   placeholder="绑定云表字段"
                                                   style="width: 160px;"
                                                   size="small"
                                                   clearable>
                                            <el-option v-for="field in yunbiaoFields"
                                                       :key="field.FieldName"
                                                       :label="`${field.FieldAlias} (${field.FieldName})`"
                                                       :value="field.FieldAlias" />
                                        </el-select>
                                        <el-select v-model="subCol.type" placeholder="数据类型" style="width: 120px;" size="small">
                                            <el-option label="文本" value="text" />
                                            <el-option label="数字" value="number" />
                                        </el-select>
                                    </div>
                                    <el-button type="text" color="danger" size="small" @click="deleteSubColumn(subIndex)">删除</el-button>
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

                            <!-- 新增：底部列组配置 -->
                            <div style="margin-bottom: 15px;">
                                <div style="color: #1890ff; font-weight: 500; margin-bottom: 10px;">底部列组（列模式，数据行下方渲染）</div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <el-button type="primary" size="small" @click="addColumn('bottom')">+ 新增</el-button>
                                    <el-button type="warning" size="small" @click="resetColumns('bottom')">清空</el-button>
                                </div>
                                <div ref="bottomColumnRef" class="column-list" style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; max-height: 300px; overflow-y: auto; background: #fff;">
                                    <div v-for="(col, index) in form.BottomColumns" :key="col.id" class="column-item" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                        <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                        <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                                            <el-input v-model="col.label" placeholder="中文列名" style="width: 150px;" size="small" />
                                            <el-input v-model="col.enLabel" placeholder="英文列名" style="width: 200px;" size="small" />
                                            <el-select v-model="col.yunbiaoField"
                                                       placeholder="绑定云表字段"
                                                       style="width: 160px;"
                                                       size="small"
                                                       clearable>
                                                <el-option v-for="field in yunbiaoFields"
                                                           :key="field.FieldName"
                                                           :label="`${field.FieldAlias} (${field.FieldName})`"
                                                           :value="field.FieldAlias" />
                                            </el-select>
                                            <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                                <el-option label="文本" value="text" />
                                                <el-option label="数字" value="number" />
                                            </el-select>

                                            <!-- 动态列开关（复用扩展列逻辑） -->
                                            <el-switch v-model="col.isDynamic"
                                                       active-text="动态列"
                                                       inactive-text="固定列"
                                                       size="small"
                                                       @change="handleDynamicChange(col)" />

                                            <!-- 固定列子列按钮 -->
                                            <el-button type="primary"
                                                       size="small"
                                                       @click="toggleSubColumns(col)"
                                                       v-if="!col.isDynamic">
                                                子列
                                            </el-button>

                                            <span v-if="col.isDynamic" style="color: #409eff; font-size: 12px;">（自动生成试样子列）</span>
                                        </div>
                                        <el-button type="text" color="danger" size="small" @click="deleteColumn(index, 'bottom')">删除</el-button>
                                    </div>
                                    <div v-if="form.BottomColumns.length === 0" style="text-align: center; color: #999; padding: 15px;">
                                        暂无底部列组，点击「新增」添加（支持一级列+子列，渲染在数据行下方）
                                    </div>
                                </div>
                                <div style="color: #999; font-size: 12px; margin-top: 8px;">
                                    💡 配置逻辑与「扩展列」完全一致，支持固定列/动态列、子列配置、拖拽排序<br />
                                    💡 渲染位置：核心表格数据行下方，尾部行（技术要求/备注）上方
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0;">尾部/特殊模块配置</h4>
                                <div>
                                    <el-button type="primary" size="small" @click="addColumn('footer')">+ 新增尾部字段</el-button>
                                    <el-button type="warning" size="small" @click="resetColumns('footer')" style="margin-left: 8px;">清空</el-button>
                                </div>
                            </div>
                        </template>
                        <div style="margin-bottom: 15px;">
                            <div style="color: #67c23a; font-weight: 500; margin-bottom: 10px;">尾部字段（自动合并行）</div>
                            <div ref="footerColumnRef" class="column-list" style="border: 1px solid #e6e6e6; padding: 10px; min-height: 150px; max-height: 200px; overflow-y: auto; background: #fff;">
                                <div v-for="(col, index) in form.FooterColumns" :key="col.id" class="column-item" style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 4px;">
                                    <i class="el-icon-menu" style="cursor: move; margin-right: 10px; color: #999;"></i>
                                    <div style="flex: 1; display: flex; gap: 10px; flex-wrap: wrap;">
                                        <el-input v-model="col.label" placeholder="中文名称" style="width: 150px;" size="small" />
                                        <el-input v-model="col.enLabel" placeholder="英文名称" style="width: 180px;" size="small" />
                                        <el-select v-model="col.type" placeholder="数据类型" style="width: 120px;" size="small">
                                            <el-option label="文本" value="text" />
                                            <el-option label="数字" value="number" />
                                        </el-select>
                                    </div>
                                    <el-button type="text" color="danger" size="small" @click="deleteColumn(index, 'footer')">删除</el-button>
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
                                    <el-input v-model="form.PhotoConfig.title" placeholder="如：腐蚀照片" style="width: 80%;" :disabled="!form.PhotoConfig.enabled" size="small" />
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
                                    <div v-for="(item, idx) in form.ApprovalItems" :key="item.id" style="display:flex;align-items:center;padding:6px;background:#f9f9f9;border-radius:4px;margin-bottom:6px;">
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
        <el-dialog v-model="previewDialogVisible" width="95%" title="表格可视化预览（1:1还原报告样式）" :close-on-click-modal="false" append-to-body>
            <div style="padding: 20px; background: #fff; border-radius: 8px;">
                <div style="background: #fff3cd; padding: 8px 12px; font-size: 16px; font-weight: 600; margin-bottom: 10px;">
                    {{ form.ProjectTitle || '项目标题' }}/{{ form.ProjectEnTitle || 'Project Title' }}
                </div>
                <div style="padding: 8px 12px; border-bottom: 1px solid #e6e6e6; margin-bottom: 10px;">
                    <span style="font-weight: 500;">{{ form.TestReference || '检测依据' }} / {{ form.TestReferenceEn || 'Test Reference' }}</span>
                </div>

                <!-- 试样参数栏 -->
                <div v-if="form.ParamItems && form.ParamItems.length > 0">
                    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center;">
                        <tbody>
                            <tr>
                                <template v-for="param in form.ParamItems" :key="param.id">
                                    <td style="background: #d9d9d9; font-weight: 600;">
                                        <div>{{ param.label }}</div><div style="font-size: 12px; color: #666;">{{ param.enLabel }}</div>
                                    </td>
                                    <td style="background: #fff; font-weight: 500;">{{ param.value || '/' }}</td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 核心表格：完全对齐报告实际渲染 -->
                <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: center; margin-top:10px;">
                    <thead>
                        <!-- 第一行：基础列 + 扩展列（含子列合并） -->
                        <tr>
                            <th v-for="col in form.BaseColumns" :key="col.id" rowspan="2" style="background: #d9d9d9;">
                                <div>{{ col.label }}</div>
                                <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                            </th>
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <th v-if="col.subColumns?.length > 0" :colspan="col.subColumns.length" style="background:#e6e6e6;">
                                    <div>{{ col.label }}</div>
                                    <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                </th>
                                <th v-else rowspan="2" style="background:#e6e6e6;">
                                    <div>{{ col.label }}</div>
                                    <div style="font-size:12px;color:#666;">{{ col.enLabel }}</div>
                                </th>
                            </template>
                        </tr>
                        <!-- 第二行：扩展列的子列头 -->
                        <tr>
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <th v-for="subCol in col.subColumns || []" :key="subCol.id" style="background:#f0f0f0;">
                                    <div>{{ subCol.label }}</div>
                                    <div style="font-size:12px;color:#666;">{{ subCol.enLabel }}</div>
                                </th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 模拟数据行 -->
                        <tr>
                            <td v-for="col in form.BaseColumns" :key="col.id">/</td>
                            <template v-for="col in form.ExtendColumns" :key="col.id">
                                <template v-if="col.subColumns?.length > 0">
                                    <td v-for="subCol in col.subColumns" :key="subCol.id">/</td>
                                </template>
                                <td v-else>/</td>
                            </template>
                        </tr>

                        <!-- 底部列组（BottomColumns） - 占据整行，内部嵌套表格 -->
                        <template v-if="form.BottomColumns.length > 0">
                            <tr>
                                <td :colspan="totalTableCols" style="padding: 0; border: none;">
                                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; text-align: center; table-layout: fixed;">
                                        <thead>
                                            <tr style="background: #e6e6e6;">
                                                <th v-for="col in form.BottomColumns" :key="col.id" :colspan="col.subColumns?.length || 1" style="border: 1px solid #ccc; font-weight: 600;" :style="{ width: (100 / form.BottomColumns.length) + '%' }">
                                                    <div>{{ col.label }}</div>
                                                    <div style="font-size: 12px; color: #666;">{{ col.enLabel }}</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style="background: #f0f0f0;">
                                                <template v-for="col in form.BottomColumns" :key="col.id">
                                                    <th v-for="(subCol, idx) in (col.subColumns?.length ? col.subColumns : [{ label: col.label, enLabel: col.enLabel }])" :key="idx" style="border: 1px solid #ccc;">
                                                        <div>{{ subCol.label }}</div>
                                                        <div style="font-size: 12px; color: #666;">{{ subCol.enLabel }}</div>
                                                    </th>
                                                </template>
                                            </tr>
                                            <tr style="background: #fff;">
                                                <template v-for="col in form.BottomColumns" :key="col.id">
                                                    <td v-for="(subCol, idx) in (col.subColumns?.length ? col.subColumns : [{ label: '', enLabel: '' }])" :key="idx" style="border: 1px solid #ccc;">
                                                        {{ col.requirement || '/' }}
                                                    </td>
                                                </template>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </template>

                        <!-- 尾部字段（FooterColumns）：特殊处理“技术要求”行，自动匹配扩展列子列数量 -->
                        <template v-if="form.FooterColumns.length > 0">
                            <template v-for="footer in form.FooterColumns" :key="footer.id">
                                <!-- 如果尾部字段的标签包含“技术要求”，则按照报告实际逻辑渲染 -->
                                <tr v-if="footer.label.includes('技术要求')">
                                    <!-- 左标签：占基础列数 -->
                                    <td :colspan="form.BaseColumns.length" style="background: #d9d9d9; font-weight: 600; padding: 12px; text-align: left;">
                                        <div>{{ footer.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ footer.enLabel }}</div>
                                    </td>
                                    <!-- 右侧：遍历扩展列的每个子列，生成对应数量的输入框 -->
                                    <template v-for="col in form.ExtendColumns" :key="col.id">
                                        <template v-if="col.subColumns?.length > 0">
                                            <td v-for="subCol in col.subColumns" :key="subCol.id" style="background: #fff; padding: 12px; text-align: left;">
                                                {{ footer.value || '/' }}
                                            </td>
                                        </template>
                                        <td v-else style="background: #fff; padding: 12px; text-align: left;">
                                            {{ footer.value || '/' }}
                                        </td>
                                    </template>
                                </tr>
                                <!-- 其他尾部字段（如结论、备注）按原合并逻辑 -->
                                <tr v-else>
                                    <td :colspan="form.BaseColumns.length" style="background: #d9d9d9; font-weight: 600; padding: 12px; text-align: left;">
                                        <div>{{ footer.label }}</div>
                                        <div style="font-size: 12px; color: #666;">{{ footer.enLabel }}</div>
                                    </td>
                                    <td :colspan="extendTotalCols" style="background: #fff; padding: 12px; text-align: left;">
                                        {{ footer.value || '/' }}
                                    </td>
                                </tr>
                            </template>
                        </template>
                    </tbody>
                </table>

                <!-- 照片+审批模块 -->
                <div v-if="form.PhotoConfig.enabled" style="margin-top:20px;">
                    <div style="font-weight:600;margin-bottom:10px;">{{ form.PhotoConfig.title }}</div>
                    <div style="border:1px solid #e6e6e6;padding:20px;text-align:center;color:#999;">照片区域</div>
                </div>

                <!-- 审批模块：纯预览展示，默认显示/，无输入框，和表格样式统一 -->
                <div v-if="form.ApprovalItems.length>0" style="margin-top:20px;">
                    <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
                        <tbody>
                            <tr>
                                <template v-for="item in form.ApprovalItems" :key="item.id">
                                    <!-- 审批名称列 -->
                                    <td style="text-align:center; font-weight:500;">
                                        {{ item.label }}
                                        <div style="font-size:12px;color:#666;">{{ item.enLabel }}</div>
                                    </td>
                                    <!-- 审批值列：默认显示/，纯展示，无输入框 -->
                                    <td style="text-align:center; width: 150px;">
                                        {{ item.value || '/' }}
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <template #footer>
                <el-button @click="previewDialogVisible=false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, computed , onMounted, nextTick } from 'vue'
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
    const selectedProjectName = ref('')
    const projects = ref([])
    const schemes = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const techList = ref([])
    const techLoading = ref(false)
    const yunbiaoFields = ref([])

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
    const approvalRef = ref(null)
    const paramRef = ref(null)
    const bottomColumnRef = ref(null)

    let sortableBase, sortableExtend, sortableBottom, sortableFooter, sortableApproval, sortableParam

    // 模拟试样（仅配置页预览使用，不入库、不影响报告）
    const mockSamples = ref(['1#试样', '2#试样', '3#试样'])
    const mockSampleEn = ref(['S1', 'S2', 'S3'])

    // ========== 表单 ==========
    const form = reactive({
        SchemeId: 0, SchemeName: '', techSpec_code: null,
        ProjectTitle: '', ProjectEnTitle: '', TestReference: '', TestReferenceEn: '',
        GroupHeaders: [], BaseColumns: [], ExtendColumns: [],
        BottomColumns: [], // 新增：底部列组（列模式，渲染在数据行下方）
        FooterColumns: [],
        PhotoConfig: { enabled: false, title: '照片' }, ApprovalItems: [],
        ConfigVersion: 1, IsActive: false, ParamItems: []
    })

    // ========== 计算属性 ==========
    // eslint-disable-next-line no-unused-vars
    const getFooterLabel = (label) => {
        const col = form.FooterColumns.find(c => c.label === label)
        return col ? (col.enLabel ? `${col.label}/${col.enLabel}` : col.label) : '';
    };

    // 扩展列总列数（包含子列）
    const extendTotalCols = computed(() => {
        return form.ExtendColumns.reduce((sum, col) => sum + (col.subColumns?.length || 1), 0)
    })
    // 表格总列数 = 基础列 + 扩展列总列数（底部列占满整行的关键）
    const totalTableCols = computed(() => {
        return form.BaseColumns.length + extendTotalCols.value
    })

    // 主表固定关键字段
    const mainTableRequiredFields = ["报检单号", "委托单号", "检测产品", "报检人", "报检日期"]

    // 自动匹配云表字段
    const loadYunbiaoFields = async (currentProjectName) => {
        yunbiaoFields.value = []
        if (!currentProjectName) {
            ElMessage.warning('请选择检测项目')
            return
        }
        try {
            const res = await axios.get('/api/yunbiao/yunbiao-fields')
            if (res.data?.Success) {
                const allFields = res.data.Data
                const allTableNames = [...new Set(allFields.map(item => item.TableName))]
                const targetTableName = autoMatchTableName(currentProjectName, allTableNames)

                if (!targetTableName) {
                    ElMessage.error(`未找到【${currentProjectName}】对应的字段配置`)
                    return
                }
                const filteredFields = allFields.filter(item => {
                    const mainField = item.TableName === "实验室报检" && mainTableRequiredFields.includes(item.FieldAlias)
                    const detailField = item.TableName === targetTableName
                    return mainField || detailField
                })
                yunbiaoFields.value = filteredFields
                filteredFields.length === 0 && ElMessage.warning('当前项目无可用字段')
            }
        } catch (err) {
            console.error("接口报错：", err)
            ElMessage.error('加载云表字段失败')
        }
    }

    // 自动匹配表名
    const autoMatchTableName = (projectName, tableList) => {
        const exactMatch = tableList.find(table => table === projectName)
        if (exactMatch) return exactMatch
        const keyMap = {
            "拉伸": "拉伸报检明细", "弯曲": "弯曲报检明细", "布氏": "布氏报检明细",
            "洛氏": "洛氏硬度报检明细", "维氏": "维氏硬度报检明细", "冲击": "冲击试样报检明细",
            "化学成分": "化学成分报检明细", "宏观": "宏观报检明细", "金相": "金相报检明细",
            "有害相": "有害相报检明细", "晶间腐蚀": "晶间腐蚀报检明细", "点腐蚀": "点腐蚀报检明细",
            "铁素体": "铁素体报检明细", "晶粒度": "晶粒度明细", "报检项目": "报检项目明细",
            "夹杂物":"非金属夹杂物明细"
        }
        for (const [key, tableName] of Object.entries(keyMap)) {
            if (projectName.includes(key) && tableList.includes(tableName)) {
                return tableName
            }
        }
        return null
    }

    // 试样参数
    const addParamItem = () => {
        form.ParamItems.push({ id: Date.now(), label: '参数名称', enLabel: '', yunbiaoField: '' });
        nextTick(initAllSortable);
    };
    const deleteParamItem = (idx) => { form.ParamItems.splice(idx, 1); };

    // ========== 接口 ==========
    const loadProjects = async () => {
        try {
            const res = await axios.post('/api/yunbiao/project-env-list')
            projects.value = res.data.map(item => ({ EnvCode: item.编码, ProjectName: item.项目简称 }))
        } catch (err) { ElMessage.error('加载项目失败') }
    }

    const loadSchemes = async () => {
        if (!selectedProjectCode.value) return
        const currentProject = projects.value.find(item => item.EnvCode === selectedProjectCode.value)
        selectedProjectName.value = currentProject?.ProjectName || ''
        await loadYunbiaoFields(selectedProjectName.value)
        try {
            const res = await axios.get(`/api/DetectionConfig/schemes-by-code/${selectedProjectCode.value}`)
            if (res.data.Success) schemes.value = res.data.Data
            else ElMessage.error('加载方案失败')
        } catch { ElMessage.error('加载配置方案失败') }
    }

    const getTechList = async () => {
        techLoading.value = true
        try {
            const res = await axios.get('/api/DetectionConfig/enable-tech-requirements')
            if (res.data.Success) techList.value = res.data.Data
        } catch { ElMessage.error('获取技术要求失败') }
        finally { techLoading.value = false }
    }

    // ========== 拖拽 ==========
    const initAllSortable = () => {
        const opt = { handle: '.el-icon-menu', animation: 150, ghostClass: 'sortable-ghost' }
        nextTick(() => {
            if (baseColumnRef.value) { if (sortableBase) sortableBase.destroy(); sortableBase = Sortable.create(baseColumnRef.value, opt) }
            if (extendColumnRef.value) { if (sortableExtend) sortableExtend.destroy(); sortableExtend = Sortable.create(extendColumnRef.value, opt) }
            // 新增bottom列组拖拽
            if (bottomColumnRef.value) { if (sortableBottom) sortableBottom.destroy(); sortableBottom = Sortable.create(bottomColumnRef.value, opt) }
            if (footerColumnRef.value) { if (sortableFooter) sortableFooter.destroy(); sortableFooter = Sortable.create(footerColumnRef.value, opt) }
            if (approvalRef.value) { if (sortableApproval) sortableApproval.destroy(); sortableApproval = Sortable.create(approvalRef.value, opt) }
            if (paramRef.value) { if (sortableParam) sortableParam.destroy(); sortableParam = Sortable.create(paramRef.value, opt) }
        })
    }

    // ========== 动态列开关核心方法 ==========
    const handleDynamicChange = (col) => {
        if (col.isDynamic) {
            // 开启动态列：自动生成试样子列
            col.subColumns = mockSamples.value.map((sample, index) => ({
                id: Date.now() + index,
                label: sample,
                enLabel: mockSampleEn.value[index] || sample,
                type: 'text',
                yunbiaoField: ''
            }))
        } else {
            // 关闭动态列：清空子列
            col.subColumns = []
        }
        nextTick(initAllSortable)
    }

    // ========== 列操作 ==========
    const addColumn = (type) => {
        let list;
        if (type === 'base') list = form.BaseColumns;
        else if (type === 'extend') list = form.ExtendColumns;
        else if (type === 'bottom') list = form.BottomColumns; // 新增bottom类型
        else list = form.FooterColumns;

        list.push({
            id: Date.now(),
            label: `${type}列${list.length + 1}`,
            enLabel: '',
            type: 'text',
            requirement: '',
            subColumns: [],
            yunbiaoField: '',
            isDynamic: false,
            dynamicType: (type === 'extend' || type === 'bottom') ? 'sample' : '' // bottom支持动态列
        })
        nextTick(initAllSortable)
    }

    const deleteColumn = (idx, type) => {
        let list;
        if (type === 'base') list = form.BaseColumns;
        else if (type === 'extend') list = form.ExtendColumns;
        else if (type === 'bottom') list = form.BottomColumns; // 新增
        else list = form.FooterColumns;
        list.splice(idx, 1)
    }

    const resetColumns = type => {
        if (type === 'base') form.BaseColumns = []
        else if (type === 'extend') form.ExtendColumns = []
        else if (type === 'bottom') form.BottomColumns = [] // 新增
        else form.FooterColumns = []
    }

    // ========== 子列 ==========
    const toggleSubColumns = col => {
        currentCol.value = col;
        currentSubColumns.value = JSON.parse(JSON.stringify(col.subColumns || []));
        currentSubColumns.value.forEach(item => { if (!item.yunbiaoField) item.yunbiaoField = '' })
        subColumnDialogVisible.value = true
    }
    const addSubColumn = () =>
        currentSubColumns.value.push({ id: Date.now(), label: '子列', enLabel: '', type: 'text', yunbiaoField: '' })
    const saveSubColumns = () => {
        if (currentCol.value) currentCol.value.subColumns = currentSubColumns.value;
        subColumnDialogVisible.value = false
    }
    const deleteSubColumn = idx => currentSubColumns.value.splice(idx, 1)

    // ========== 审批 ==========
    const addApprovalItem = () => { form.ApprovalItems.push({ id: Date.now(), label: '审批', enLabel: '' }); nextTick(initAllSortable) }
    const deleteApprovalItem = idx => form.ApprovalItems.splice(idx, 1)
    const clearApprovalItems = () => { form.ApprovalItems = [] }

    // ========== 弹窗 ==========
    const showAddDialog = () => {
        isEdit.value = false
        Object.assign(form, {
            SchemeId: 0, SchemeName: '', techSpec_code: null, ProjectTitle: '', ProjectEnTitle: '', TestReference: '', TestReferenceEn: '',
            GroupHeaders: [], BaseColumns: [], ExtendColumns: [], FooterColumns: [], PhotoConfig: { enabled: false, title: '照片' },
            ApprovalItems: [], ConfigVersion: 1, IsActive: false, ParamItems: []
        })
        if (selectedProjectCode.value) loadYunbiaoFields(selectedProjectName.value)
        dialogVisible.value = true
        nextTick(initAllSortable)
    }

    const editScheme = row => {
        isEdit.value = true
        const cfg = JSON.parse(row.ConfigContent || '{}')
        Object.assign(form, {
            SchemeId: row.SchemeId, SchemeName: row.SchemeName, techSpec_code: row.TechSpecCode || null,
            ProjectTitle: cfg.ProjectTitle || '', ProjectEnTitle: cfg.ProjectEnTitle || '', TestReference: cfg.TestReference || '',
            TestReferenceEn: cfg.TestReferenceEn || '', GroupHeaders: cfg.GroupHeaders || [], BaseColumns: cfg.BaseColumns || [],
            ExtendColumns: cfg.ExtendColumns || [],
            BottomColumns: cfg.BottomColumns || [], // 新增
            FooterColumns: cfg.FooterColumns || [], PhotoConfig: cfg.PhotoConfig || { enabled: false, title: '照片' },
            ApprovalItems: cfg.ApprovalItems || [], ConfigVersion: row.ConfigVersion || 1, IsActive: row.IsActive || false, ParamItems: cfg.ParamItems || []
        })

        // 动态列回显（新增bottom列组）
        form.ExtendColumns.forEach(col => { if (col.isDynamic) handleDynamicChange(col) })
        form.BottomColumns.forEach(col => { if (col.isDynamic) handleDynamicChange(col) })

        if (selectedProjectCode.value) loadYunbiaoFields(selectedProjectName.value)
        dialogVisible.value = true
        nextTick(initAllSortable)
    }

    const showPreviewDialog = () => previewDialogVisible.value = true

    // ========== 保存/删除 ==========
    const saveScheme = async () => {
        if (!selectedProjectCode.value) return ElMessage.warning('请选择检测项目')
        if (!form.techSpec_code) return ElMessage.warning('请选择技术要求')
        const tech = techList.value.find(t => t.Id === form.techSpec_code)
        if (tech) form.SchemeName = tech.Name
        const userName = localStorage.getItem('username') || '管理员'
        const now = new Date().toISOString()
        const data = {
            SchemeId: form.SchemeId, ProjectCode: selectedProjectCode.value, SchemeName: form.SchemeName, TechSpecCode: form.techSpec_code,
            ConfigContent: JSON.stringify(form), ConfigVersion: isEdit.value ? form.ConfigVersion : 1, IsActive: isEdit.value ? form.IsActive : false,
            createName: userName, updateName: userName, CreateTime: isEdit.value ? form.CreateTime : now, UpdateTime: now
        }
        try {
            isEdit.value ? await axios.put(`/api/DetectionConfig/scheme/${form.SchemeId}`, data) : await axios.post('/api/DetectionConfig/scheme', data)
            ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
            dialogVisible.value = false
            loadSchemes()
        } catch (e) { ElMessage.error('保存失败') }
    }

    const deleteScheme = async (id) => {
        await ElMessageBox.confirm('确定删除该配置？', '警告', { type: 'warning' })
        await axios.delete(`/api/DetectionConfig/scheme/${id}`)
        ElMessage.success('删除成功')
        loadSchemes()
    }

    onMounted(() => { loadProjects(); getTechList() })
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