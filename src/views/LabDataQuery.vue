<template>
    <div class="lab-data-query">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
            <!-- 页签1: 原材料化学成分（后端接口） -->
            <el-tab-pane label="原材料化学成分" name="rawChem">
                <div class="query-bar">
                    <el-input v-model="rawChemQuery.supplier" placeholder="供应商" clearable style="width:180px" />
                    <el-input v-model="rawChemQuery.materialType" placeholder="原材料类型" clearable style="width:180px" />
                    <el-input v-model="rawChemQuery.materialGrade" placeholder="材质" clearable style="width:150px" />
                    <el-input v-model="rawChemQuery.heatNo" placeholder="炉号" clearable style="width:180px" />
                    <el-button type="primary" @click="searchRawChem">查询</el-button>
                    <el-button @click="resetRawChem">重置</el-button>
                    <el-button type="success" @click="exportRawChem" style="margin-left: auto;">导出</el-button>
                </div>
                <div class="table-wrapper">
                    <el-table :data="rawChemList" border stripe v-loading="loadingRawChem" max-height="600">
                        <el-table-column v-for="col in rawChemCols"
                                         :key="col.prop"
                                         :prop="col.prop"
                                         :label="col.label"
                                         :width="col.width"
                                         show-overflow-tooltip
                                         :fixed="col.fixed ? 'left' : false" />
                    </el-table>
                    <el-pagination v-model:current-page="rawChemPage.current"
                                   v-model:page-size="rawChemPage.size"
                                   :page-sizes="[10, 20, 50, 100]"
                                   :total="rawChemTotal"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   @size-change="handleRawChemSizeChange"
                                   @current-change="handleRawChemCurrentChange"
                                   class="pagination" />
                </div>
            </el-tab-pane>

            <!-- 页签2: 实验室-化学成分（后端接口） -->
            <el-tab-pane label="实验室-化学成分" name="labChem">
                <div class="query-bar">
                    <el-input v-model="labChemQuery.orderNo" placeholder="订单号" clearable style="width:180px" />
                    <el-input v-model="labChemQuery.material" placeholder="材质" clearable style="width:150px" />
                    <el-input v-model="labChemQuery.heatNo" placeholder="炉号" clearable style="width:180px" />
                    <el-button type="primary" @click="searchLabChem">查询</el-button>
                    <el-button @click="resetLabChem">重置</el-button>
                    <el-button type="success" @click="exportLabChem" style="margin-left: auto;">导出</el-button>
                </div>
                <div class="table-wrapper">
                    <el-table :data="labChemList" border stripe v-loading="loading" max-height="600" @row-click="handleLabChemRowClick">
                        <el-table-column v-for="col in labChemCols"
                                         :key="col.prop"
                                         :prop="col.prop"
                                         :label="col.label"
                                         :width="col.width"
                                         show-overflow-tooltip />
                    </el-table>
                    <el-pagination v-model:current-page="labChemPage.current"
                                   v-model:page-size="labChemPage.size"
                                   :page-sizes="[10, 20, 50, 100]"
                                   :total="labChemTotal"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   @size-change="handleLabChemSizeChange"
                                   @current-change="handleLabChemCurrentChange"
                                   class="pagination" />

                    <!-- 可折叠的子表格区域 -->
                    <el-collapse v-model="activeCollapse" style="margin-top: 20px;">
                        <el-collapse-item name="materialChem" title="原材料化学成分（点击行自动展开）">
                            <!-- 没有选中行时显示提示 -->
                            <div v-if="!selectedLabChemRow" style="text-align: center; color: #909399; padding: 20px;">
                                请点击上方表格中的某一行，查看该材质对应的原材料化学成分
                            </div>
                            <!-- 有选中行时显示表格 -->
                            <div v-else>
                                <div style="margin-bottom: 10px;">
                                    <span style="font-weight: bold;">材质：{{ selectedLabChemRow.material }}</span>
                                    <el-button size="small" @click="refreshMaterialChem" style="margin-left: 10px;">刷新</el-button>
                                </div>
                                <!-- 数据为空时显示提示 -->
                                <div v-if="materialChemList.length === 0 && !materialChemLoading" style="text-align: center; color: #909399; padding: 20px;">
                                    没有匹配材质的原材料化学成分记录
                                </div>
                                <el-table v-else :data="materialChemList" border stripe v-loading="materialChemLoading" max-height="300">
                                    <el-table-column v-for="col in rawChemCols"
                                                     :key="col.prop"
                                                     :prop="col.prop"
                                                     :label="col.label"
                                                     :width="col.width"
                                                     show-overflow-tooltip
                                                     :fixed="col.fixed ? 'left' : false" />
                                </el-table>
                                <el-pagination v-if="materialChemTotal > 0"
                                               v-model:current-page="materialChemPage.current"
                                               v-model:page-size="materialChemPage.size"
                                               :page-sizes="[10, 20, 50]"
                                               :total="materialChemTotal"
                                               layout="total, sizes, prev, pager, next, jumper"
                                               @size-change="handleMaterialChemSizeChange"
                                               @current-change="handleMaterialChemCurrentChange"
                                               class="pagination" />
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-tab-pane>

            <!-- 页签3: 机械性能（后端接口） -->
            <el-tab-pane label="机械性能" name="mechProp">
                <div class="query-bar">
                    <el-input v-model="mechQuery.orderNo" placeholder="订单号" clearable style="width:180px" />
                    <el-input v-model="mechQuery.material" placeholder="材质" clearable style="width:150px" />
                    <el-input v-model="mechQuery.heatNo" placeholder="炉号" clearable style="width:180px" />
                    <el-button type="primary" @click="searchMech">查询</el-button>
                    <el-button @click="resetMech">重置</el-button>
                    <el-button type="success" @click="exportMech" style="margin-left: auto;">导出</el-button>
                </div>
                <div class="table-wrapper">
                    <el-table :data="mechList" border stripe v-loading="loading" max-height="600">
                        <!-- 基础信息列 -->
                        <el-table-column prop="registrar" label="登记人员" width="100" fixed="left" />
                        <el-table-column prop="orderNo" label="订单号" width="140" />
                        <el-table-column prop="sheetNo" label="委托单号" width="140" />
                        <el-table-column prop="inspectionNo" label="报检单号" width="140" />
                        <el-table-column prop="material" label="材质" width="100" />
                        <el-table-column prop="heatNo" label="原材料炉号" width="150" />
                        <el-table-column prop="heatTreatmentNo" label="热处理炉号" width="150" />
                        <el-table-column prop="spec" label="试样尺寸/产品尺寸" width="130" />
                        <el-table-column prop="heatTreatmentParam" label="热处理工艺与参数" width="160" />

                        <!-- 拉伸试验 -->
                        <el-table-column label="拉伸试验" align="center">
                            <el-table-column prop="tensileDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="tensileDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="tensilePosition" label="试样取样位置" width="120" />
                            <el-table-column prop="tensileStandard" label="试验标准" width="120" />
                            <el-table-column prop="tensileTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="tensileSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column prop="tensileStrength" label="抗拉强度(MPa)" width="130" />
                            <el-table-column prop="yieldStrength" label="屈服强度(MPa)" width="130" />
                            <el-table-column prop="elongation" label="延伸率(%)" width="100" />
                            <el-table-column prop="reductionArea" label="截面收缩率(%)" width="120" />
                            <el-table-column prop="yieldRatio" label="屈强比" width="90" />
                            <el-table-column prop="tensileRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 冲击实验 -->
                        <el-table-column label="冲击实验" align="center">
                            <el-table-column label="取样图号" prop="impactDrawingNo" width="120" />
                            <el-table-column label="试样取样方向" prop="impactDirection" width="120" />
                            <el-table-column label="试样取样位置" prop="impactPosition" width="120" />
                            <el-table-column label="试验标准" prop="impactStandard" width="120" />
                            <el-table-column label="试样尺寸(mm)" prop="impactSize" width="110" />
                            <el-table-column label="试验温度(℃)" prop="impactTemp" width="110" />
                            <el-table-column label="缺口形式" prop="impactNotch" width="100" />
                            <el-table-column label="测试值 J" align="center">
                                <el-table-column prop="impactKV1" label="1#" width="60" />
                                <el-table-column prop="impactKV2" label="2#" width="60" />
                                <el-table-column prop="impactKV3" label="3#" width="60" />
                            </el-table-column>
                            <el-table-column label="侧向膨胀量 mm" align="center">
                                <el-table-column prop="lateralExpansion1" label="1#" width="80" />
                                <el-table-column prop="lateralExpansion2" label="2#" width="80" />
                                <el-table-column prop="lateralExpansion3" label="3#" width="80" />
                            </el-table-column>
                            <el-table-column label="剪切面积 %" align="center">
                                <el-table-column prop="shearArea1" label="1#" width="70" />
                                <el-table-column prop="shearArea2" label="2#" width="70" />
                                <el-table-column prop="shearArea3" label="3#" width="70" />
                            </el-table-column>
                            <el-table-column prop="impactRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 硬度 -->
                        <el-table-column label="硬度" align="center">
                            <el-table-column prop="hardnessDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="hardnessDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="hardnessPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="hardnessStandard" label="试验标准" width="120" />
                            <el-table-column prop="hbw" label="HBW" width="80" />
                            <el-table-column prop="hrc" label="HRC" width="80" />
                            <el-table-column prop="hv" label="HV" width="80" />
                            <el-table-column prop="hardnessRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 晶粒度 -->
                        <el-table-column label="晶粒度" align="center">
                            <el-table-column prop="grainDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="grainDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="grainPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="grainStandard" label="试验标准" width="120" />
                            <el-table-column prop="grainSize" label="测试结果" width="100" />
                            <el-table-column prop="grainRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 剪切试验 -->
                        <el-table-column label="剪切试验" align="center">
                            <el-table-column prop="shearDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="shearDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="shearPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="shearStandard" label="试验标准" width="120" />
                            <el-table-column prop="shearSize" label="试样尺寸" width="100" />
                            <el-table-column prop="shearStrength" label="结合力(MPa)" width="110" />
                            <el-table-column prop="shearRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 非金属夹杂物 -->
                        <el-table-column label="非金属夹杂物" align="center">
                            <el-table-column prop="inclusionDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="inclusionDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="inclusionPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="inclusionStandard" label="试验标准" width="120" />
                            <el-table-column label="A类" align="center">
                                <el-table-column prop="inclusionA_coarse" label="粗系" width="70" />
                                <el-table-column prop="inclusionA_fine" label="细系" width="70" />
                            </el-table-column>
                            <el-table-column label="B类" align="center">
                                <el-table-column prop="inclusionB_coarse" label="粗系" width="70" />
                                <el-table-column prop="inclusionB_fine" label="细系" width="70" />
                            </el-table-column>
                            <el-table-column label="C类" align="center">
                                <el-table-column prop="inclusionC_coarse" label="粗系" width="70" />
                                <el-table-column prop="inclusionC_fine" label="细系" width="70" />
                            </el-table-column>
                            <el-table-column label="D类" align="center">
                                <el-table-column prop="inclusionD_coarse" label="粗系" width="70" />
                                <el-table-column prop="inclusionD_fine" label="细系" width="70" />
                            </el-table-column>
                            <el-table-column prop="inclusionRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 铁素体含量 -->
                        <el-table-column label="铁素体含量" align="center">
                            <el-table-column prop="ferriteDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="ferriteDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="ferritePosition" label="试样取样位置" width="120" />
                            <el-table-column prop="ferriteStandard" label="试验标准" width="120" />
                            <el-table-column prop="ferriteContent" label="铁素体含量%" width="120" />
                            <el-table-column prop="ferriteRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 带状组织评定 -->
                        <el-table-column label="带状组织评定" align="center">
                            <el-table-column prop="bandDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="bandDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="bandPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="bandStandard" label="试验标准" width="120" />
                            <el-table-column prop="bandRating" label="带状组织评级" width="120" />
                            <el-table-column prop="bandRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 有害相检测 -->
                        <el-table-column label="有害相检测" align="center">
                            <el-table-column prop="harmfulDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="harmfulDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="harmfulPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="harmfulStandard" label="试验标准" width="120" />
                            <el-table-column prop="harmfulConclusion" label="试验结论" width="120" />
                            <el-table-column prop="harmfulRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 金相组织 -->
                        <el-table-column label="金相组织" align="center">
                            <el-table-column prop="microDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="microDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="microPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="microStandard" label="试验标准" width="120" />
                            <el-table-column prop="microstructure" label="试验结论" width="120" />
                            <el-table-column prop="microRemark" label="备注" width="120" />
                        </el-table-column>
                    </el-table>
                    <el-pagination v-model:current-page="mechPage.current"
                                   v-model:page-size="mechPage.size"
                                   :page-sizes="[10, 20, 50, 100]"
                                   :total="mechTotal"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   @size-change="handleMechSizeChange"
                                   @current-change="handleMechCurrentChange"
                                   class="pagination" />
                </div>
            </el-tab-pane>

            <!-- 页签4: CTOD & 腐蚀试验（后端接口） -->
            <el-tab-pane label="CTOD & 腐蚀试验" name="corrosion">
                <div class="query-bar">
                    <el-input v-model="corrQuery.orderNo" placeholder="订单号" clearable style="width:180px" />
                    <el-input v-model="corrQuery.material" placeholder="材质" clearable style="width:150px" />
                    <el-input v-model="corrQuery.heatNo" placeholder="炉号" clearable style="width:180px" />
                    <el-button type="primary" @click="searchCorr">查询</el-button>
                    <el-button @click="resetCorr">重置</el-button>
                    <el-button type="success" @click="exportCorr" style="margin-left: auto;">导出</el-button>
                </div>
                <div class="table-wrapper">
                    <el-table :data="corrList" border stripe v-loading="loading" max-height="600">
                        <!-- 基础信息 -->
                        <el-table-column prop="registrar" label="登记人员" width="100" fixed="left" />
                        <el-table-column prop="orderNo" label="订单号" width="140" />
                        <el-table-column prop="sheetNo" label="委托单号" width="140" />
                        <el-table-column prop="inspectionNo" label="报检单号" width="140" />
                        <el-table-column prop="material" label="材质" width="100" />
                        <el-table-column prop="heatNo" label="原材料炉号" width="150" />
                        <el-table-column prop="heatTreatmentNo" label="热处理炉号" width="150" />
                        <el-table-column prop="spec" label="试块尺寸/产品尺寸" width="140" />
                        <el-table-column prop="heatTreatmentParam" label="热处理工艺与参数" width="160" />

                        <!-- CTOD 试验 -->
                        <el-table-column label="CTOD 试验" align="center">
                            <el-table-column prop="ctodDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="ctodDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="ctodPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="ctodStandard" label="试验标准" width="120" />
                            <el-table-column prop="ctodEnvironment" label="试验环境" width="120" />
                            <el-table-column prop="ctodTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="ctodSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column label="测试值 mm" align="center">
                                <el-table-column prop="ctodValue1" label="1#" width="70" />
                                <el-table-column prop="ctodValue2" label="2#" width="70" />
                                <el-table-column prop="ctodValue3" label="3#" width="70" />
                            </el-table-column>
                            <el-table-column prop="ctodRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- HIC 试验 -->
                        <el-table-column label="HIC 试验" align="center">
                            <el-table-column prop="hicDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="hicDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="hicPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="hicStandard" label="试验标准" width="120" />
                            <el-table-column prop="hicSolution" label="试验溶液" width="120" />
                            <el-table-column prop="hicTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="hicTime" label="试验时间(H)" width="110" />
                            <el-table-column prop="hicSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column label="CLR%" align="center">
                                <el-table-column prop="hicClr1" label="1#" width="60" />
                                <el-table-column prop="hicClr2" label="2#" width="60" />
                                <el-table-column prop="hicClr3" label="3#" width="60" />
                            </el-table-column>
                            <el-table-column label="CTR%" align="center">
                                <el-table-column prop="hicCtr1" label="1#" width="60" />
                                <el-table-column prop="hicCtr2" label="2#" width="60" />
                                <el-table-column prop="hicCtr3" label="3#" width="60" />
                            </el-table-column>
                            <el-table-column label="CSR%" align="center">
                                <el-table-column prop="hicCsr1" label="1#" width="60" />
                                <el-table-column prop="hicCsr2" label="2#" width="60" />
                                <el-table-column prop="hicCsr3" label="3#" width="60" />
                            </el-table-column>
                            <el-table-column label="CAR%" align="center">
                                <el-table-column prop="hicCar1" label="1#" width="60" />
                                <el-table-column prop="hicCar2" label="2#" width="60" />
                                <el-table-column prop="hicCar3" label="3#" width="60" />
                            </el-table-column>
                            <el-table-column prop="hicRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- SSC 试验 -->
                        <el-table-column label="SSC 试验" align="center">
                            <el-table-column prop="sscDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="sscDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="sscPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="sscStandard" label="试验标准" width="120" />
                            <el-table-column prop="sscSolution" label="试验溶液" width="120" />
                            <el-table-column prop="sscTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="sscTime" label="试验时间(H)" width="110" />
                            <el-table-column prop="sscSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column label="测试值" align="center">
                                <el-table-column prop="sscValue1" label="1#" width="90" />
                                <el-table-column prop="sscValue2" label="2#" width="90" />
                                <el-table-column prop="sscValue3" label="3#" width="90" />
                            </el-table-column>
                            <el-table-column prop="sscRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 晶间腐蚀 -->
                        <el-table-column label="晶间腐蚀" align="center">
                            <el-table-column prop="igcDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="igcDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="igcPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="igcStandard" label="试验标准" width="120" />
                            <el-table-column prop="igcSolution" label="试验溶液" width="120" />
                            <el-table-column prop="igcTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="igcTime" label="试验时间(H)" width="110" />
                            <el-table-column prop="igcSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column prop="igcRate" label="腐蚀速率(mm/y)" width="130" />
                            <el-table-column prop="igcRemark" label="备注" width="120" />
                        </el-table-column>

                        <!-- 点腐蚀 -->
                        <el-table-column label="点腐蚀" align="center">
                            <el-table-column prop="pittingDrawingNo" label="取样图号" width="120" />
                            <el-table-column prop="pittingDirection" label="试样取样方向" width="120" />
                            <el-table-column prop="pittingPosition" label="试样取样位置" width="120" />
                            <el-table-column prop="pittingStandard" label="试验标准" width="120" />
                            <el-table-column prop="pittingSolution" label="试验溶液" width="120" />
                            <el-table-column prop="pittingTemp" label="试验温度(℃)" width="110" />
                            <el-table-column prop="pittingTime" label="试验时间(小时)" width="120" />
                            <el-table-column prop="pittingSize" label="试样尺寸(mm)" width="110" />
                            <el-table-column prop="pittingLoss" label="重量损失(g/m²)" width="130" />
                            <el-table-column prop="pittingDesc" label="点蚀情况(20倍)" width="140" />
                            <el-table-column prop="pittingRemark" label="备注" width="120" />
                        </el-table-column>
                    </el-table>
                    <el-pagination v-model:current-page="corrPage.current"
                                   v-model:page-size="corrPage.size"
                                   :page-sizes="[10, 20, 50, 100]"
                                   :total="corrTotal"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   @size-change="handleCorrSizeChange"
                                   @current-change="handleCorrCurrentChange"
                                   class="pagination" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    import * as XLSX from 'xlsx'

    // ==================== 页签切换与通用加载状态 ====================
    const activeTab = ref('rawChem')
    const loading = ref(false)
    const loadingRawChem = ref(false)

    // ==================== 通用导出函数 ====================
    const exportToExcel = (data, columns, filename) => {
        if (!data || data.length === 0) {
            ElMessage.warning('暂无数据可导出')
            return
        }
        const header = columns.map(col => col.label)
        const prop = columns.map(col => col.prop)
        const rows = data.map(row => prop.map(p => row[p] ?? ''))
        const worksheetData = [header, ...rows]
        const ws = XLSX.utils.aoa_to_sheet(worksheetData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        XLSX.writeFile(wb, `${filename}.xlsx`)
    }

    // ==================== 1. 原材料化学成分 ====================
    const rawChemCols = [
        { prop: '登记人员', label: '登记人员', width: 100, fixed: true },
        { prop: '供应商', label: '供应商', width: 120, fixed: true },
        { prop: '原材料类型', label: '原材料类型', width: 120 },
        { prop: '原材料规格', label: '原材料规格', width: 100 },
        { prop: '材质', label: '材质', width: 100 },
        { prop: '材料类型', label: '材料类型', width: 100 },
        { prop: '原材料炉号', label: '原材料炉号', width: 150 },
        { prop: '熔炼分析', label: '熔炼分析', width: 90 },
        { prop: '碳C', label: '碳 C %', width: 80 },
        { prop: '硅Si', label: '硅 Si %', width: 80 },
        { prop: '锰Mn', label: '锰 Mn %', width: 80 },
        { prop: '磷P', label: '磷 P %', width: 80 },
        { prop: '硫S', label: '硫 S %', width: 80 },
        { prop: '铬Cr', label: '铬 Cr %', width: 80 },
        { prop: '镍Ni', label: '镍 Ni %', width: 80 },
        { prop: '钼Mo', label: '钼 Mo %', width: 80 },
        { prop: '氮Nppm', label: '氮 N ppm', width: 90 },
        { prop: '铝Al', label: '铝 Al %', width: 80 },
        { prop: '硼B', label: '硼 B %', width: 80 },
        { prop: '钴Co', label: '钴 Co %', width: 80 },
        { prop: '铜Cu', label: '铜 Cu %', width: 80 },
        { prop: '铌Nb', label: '铌 Nb %', width: 80 },
        { prop: '钒V', label: '钒 V %', width: 80 },
        { prop: '钛Ti', label: '钛 Ti %', width: 80 },
        { prop: '铁Fe', label: '铁 Fe %', width: 80 },
        { prop: '钨W', label: '钨 W %', width: 80 },
        { prop: '锌Zn', label: '锌 Zn %', width: 80 },
        { prop: '钙Ca', label: '钙 Ca %', width: 80 },
        { prop: '钽Ta', label: '钽 Ta %', width: 80 },
        { prop: '砷As', label: '砷 As %', width: 80 },
        { prop: '锡Sn', label: '锡 Sn %', width: 80 },
        { prop: '锑Sb', label: '锑 Sb %', width: 80 },
        { prop: '铅Pb', label: '铅 Pb %', width: 80 },
        { prop: '铋Bi', label: '铋 Bi %', width: 80 },
        { prop: '氧Oppm', label: '氧 O ppm', width: 90 },
        { prop: '氢Hppm', label: '氢 H ppm', width: 90 },
        { prop: 'Ni2Mo', label: 'Ni+2Mo', width: 90 },
        { prop: 'CrMo', label: 'Cr+Mo', width: 90 },
        { prop: 'CrMoCu', label: 'Cr+Mo+Cu', width: 110 },
        { prop: 'CrNiMoCuV', label: 'Cr+Ni+Mo+Cu+V', width: 140 },
        { prop: 'CrNiMoCu', label: 'Cr+Ni+Mo+Cu', width: 130 },
        { prop: 'VNbTi', label: 'V+Nb+Ti', width: 100 },
        { prop: 'CaS', label: 'Ca:S', width: 80 },
        { prop: 'AlN', label: 'Al:N', width: 80 },
        { prop: 'NbTa', label: 'Nb+Ta', width: 90 },
        { prop: 'PRENCr33Mo16N', label: 'PREN (Cr+3.3Mo+16N)', width: 170 },
        { prop: 'PRENCr33Mo05W16N', label: 'PREN (Cr+3.3(Mo+0.5W)+16N)', width: 210 },
        { prop: 'PcmCSi30MnCuCr20Ni60Mo15V105B', label: 'Pcm', width: 100 },
        { prop: 'CMn6', label: 'C+Mn/6', width: 100 },
        { prop: 'CECMn6CrMoV5NiCu15', label: 'CE', width: 100 },
        { prop: 'MnC', label: 'Mn/C', width: 80 },
        { prop: '其他', label: '其他', width: 100 },
        { prop: 'AC1', label: 'AC1 (℃)', width: 100 },
        { prop: 'AC3', label: 'AC3 (℃)', width: 100 },
        { prop: '铬当量Creq', label: '铬当量 Creq%', width: 130 },
        { prop: '捏当量Nieq', label: '镍当量 Nieq%', width: 130 },
        { prop: '理论计算奥氏体含量', label: '理论计算奥氏体含量%', width: 160 }
    ]

    const rawChemList = ref([])
    const rawChemTotal = ref(0)
    const rawChemPage = ref({ current: 1, size: 10 })
    const rawChemQuery = ref({ supplier: '', materialType: '', materialGrade: '', heatNo: '' })

    const fetchRawChem = async () => {
        loadingRawChem.value = true
        try {
            const res = await axios.get('/api/lab-query/rawchem-list', {
                params: {
                    pageIndex: rawChemPage.value.current,
                    pageSize: rawChemPage.value.size,
                    supplier: rawChemQuery.value.supplier || undefined,
                    materialType: rawChemQuery.value.materialType || undefined,
                    materialGrade: rawChemQuery.value.materialGrade || undefined,
                    heatNo: rawChemQuery.value.heatNo || undefined
                }
            })
            if (res.data.Success) {
                rawChemList.value = res.data.Data.List || []
                rawChemTotal.value = res.data.Data.Total || 0
            } else {
                ElMessage.error(res.data.Message || '获取数据失败')
                rawChemList.value = []
                rawChemTotal.value = 0
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
            rawChemList.value = []
            rawChemTotal.value = 0
        } finally {
            loadingRawChem.value = false
        }
    }

    const searchRawChem = () => {
        rawChemPage.value.current = 1
        fetchRawChem()
    }

    const resetRawChem = () => {
        rawChemQuery.value = { supplier: '', materialType: '', materialGrade: '', heatNo: '' }
        searchRawChem()
    }

    const handleRawChemSizeChange = () => {
        rawChemPage.value.current = 1
        fetchRawChem()
    }

    const handleRawChemCurrentChange = () => {
        fetchRawChem()
    }

    const exportRawChem = () => {
        exportToExcel(rawChemList.value, rawChemCols, '原材料化学成分')
    }

    // ==================== 2. 实验室-化学成分 ====================
    const labChemCols = [
        { prop: 'registrar', label: '登记人员', width: 100 },
        { prop: 'orderNo', label: '订单号', width: 140 },
        { prop: 'sheetNo', label: '委托单号', width: 150 },
        { prop: 'inspectionNo', label: '报检单号', width: 180 },
        { prop: 'material', label: '材质', width: 100 },
        { prop: 'materialType', label: '材料类型', width: 100 },
        { prop: 'heatNo', label: '原材料炉号', width: 150 },
        { prop: 'productAnalysis', label: '产品分析', width: 90 },
        { prop: 'c', label: '碳 C %', width: 80 }, { prop: 'si', label: '硅 Si %', width: 80 },
        { prop: 'mn', label: '锰 Mn %', width: 80 }, { prop: 'p', label: '磷 P %', width: 80 },
        { prop: 's', label: '硫 S %', width: 80 }, { prop: 'cr', label: '铬 Cr %', width: 80 },
        { prop: 'ni', label: '镍 Ni %', width: 80 }, { prop: 'mo', label: '钼 Mo %', width: 80 },
        { prop: 'n', label: '氮 N ppm', width: 90 }, { prop: 'al', label: '铝 Al %', width: 80 },
        { prop: 'b', label: '硼 B %', width: 80 }, { prop: 'co', label: '钴 Co %', width: 80 },
        { prop: 'cu', label: '铜 Cu %', width: 80 }, { prop: 'nb', label: '铌 Nb %', width: 80 },
        { prop: 'v', label: '钒 V %', width: 80 }, { prop: 'ti', label: '钛 Ti %', width: 80 },
        { prop: 'fe', label: '铁 Fe %', width: 80 }, { prop: 'w', label: '钨 W %', width: 80 },
        { prop: 'zn', label: '锌 Zn %', width: 80 }, { prop: 'ca', label: '钙 Ca %', width: 80 },
        { prop: 'ta', label: '钽 Ta %', width: 80 }, { prop: 'as', label: '砷 As %', width: 80 },
        { prop: 'sn', label: '锡 Sn %', width: 80 }, { prop: 'sb', label: '锑 Sb %', width: 80 },
        { prop: 'pb', label: '铅 Pb %', width: 80 }, { prop: 'bi', label: '铋 Bi %', width: 80 },
        { prop: 'o', label: '氧 O ppm', width: 90 }, { prop: 'h', label: '氢 H ppm', width: 90 },
        { prop: 'niPlus2Mo', label: 'Ni+2Mo', width: 90 }, { prop: 'crPlusMo', label: 'Cr+Mo', width: 90 },
        { prop: 'crPlusMoPlusCu', label: 'Cr+Mo+Cu', width: 110 }, { prop: 'crNiMoCuV', label: 'Cr+Ni+Mo+Cu+V', width: 140 },
        { prop: 'crNiMoCu', label: 'Cr+Ni+Mo+Cu', width: 130 }, { prop: 'vNbTi', label: 'V+Nb+Ti', width: 100 },
        { prop: 'caS', label: 'Ca:S', width: 80 }, { prop: 'alN', label: 'Al:N', width: 80 },
        { prop: 'nbTa', label: 'Nb+Ta', width: 90 }, { prop: 'pren1', label: 'PREN (Cr+3.3Mo+16N)', width: 170 },
        { prop: 'pren2', label: 'PREN (Cr+3.3(Mo+0.5W)+16N)', width: 210 }, { prop: 'pcm', label: 'Pcm', width: 100 },
        { prop: 'cMn6', label: 'C+Mn/6', width: 100 }, { prop: 'ce', label: 'CE', width: 100 },
        { prop: 'mnOverC', label: 'Mn/C', width: 80 }, { prop: 'other', label: '其他', width: 100 },
        { prop: 'ac1', label: 'AC1/℃', width: 100 }, { prop: 'ac3', label: 'AC3/℃', width: 100 },
        { prop: 'creq', label: '铬当量 Creq%', width: 130 }, { prop: 'nieq', label: '镍当量 Nieq', width: 130 },
        { prop: 'austenitePercent', label: '理论计算奥氏体含量%', width: 160 }
    ]

    const labChemList = ref([])
    const labChemTotal = ref(0)
    const labChemPage = ref({ current: 1, size: 10 })
    const labChemQuery = ref({ orderNo: '', material: '', heatNo: '' })

    const fetchLabChem = async () => {
        loading.value = true
        try {
            const res = await axios.post('/api/lab-query/lab-chem-list', {
                orderNo: labChemQuery.value.orderNo || undefined,
                material: labChemQuery.value.material || undefined,
                heatNo: labChemQuery.value.heatNo || undefined,
                pageIndex: labChemPage.value.current,
                pageSize: labChemPage.value.size
            })
            if (res.data.Success) {
                labChemList.value = res.data.Data.List || []
                labChemTotal.value = res.data.Data.Total || 0
            } else {
                ElMessage.error(res.data.Message || '获取数据失败')
                labChemList.value = []
                labChemTotal.value = 0
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
            labChemList.value = []
            labChemTotal.value = 0
        } finally {
            loading.value = false
        }
    }

    const searchLabChem = () => {
        labChemPage.value.current = 1
        fetchLabChem()
    }

    const resetLabChem = () => {
        labChemQuery.value = { orderNo: '', material: '', heatNo: '' }
        searchLabChem()
    }

    const handleLabChemSizeChange = () => {
        labChemPage.value.current = 1
        fetchLabChem()
    }

    const handleLabChemCurrentChange = () => {
        fetchLabChem()
    }

    const exportLabChem = () => {
        exportToExcel(labChemList.value, labChemCols, '实验室化学成分')
    }

    // ==================== 实验室化学成分行点击 -> 子表格（原材料化学成分） ====================
    const activeCollapse = ref(['materialChem'])  // 默认展开
    const selectedLabChemRow = ref(null)
    const materialChemList = ref([])
    const materialChemTotal = ref(0)
    const materialChemPage = ref({ current: 1, size: 10 })
    const materialChemLoading = ref(false)

    const handleLabChemRowClick = (row) => {
        selectedLabChemRow.value = row
        if (!activeCollapse.value.includes('materialChem')) {
            activeCollapse.value.push('materialChem')
        }
        if (row.material) {
            materialChemPage.value.current = 1
            fetchMaterialChem(row.material)
        } else {
            materialChemList.value = []
            materialChemTotal.value = 0
        }
    }

    const fetchMaterialChem = async (material) => {
        if (!material) return
        materialChemLoading.value = true
        try {
            const res = await axios.get('/api/lab-query/rawchem-list', {
                params: {
                    pageIndex: materialChemPage.value.current,
                    pageSize: materialChemPage.value.size,
                    materialGrade: material
                }
            })
            if (res.data.Success) {
                materialChemList.value = res.data.Data.List || []
                materialChemTotal.value = res.data.Data.Total || 0
            } else {
                ElMessage.error(res.data.Message || '获取原材料化学成分失败')
                materialChemList.value = []
                materialChemTotal.value = 0
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
            materialChemList.value = []
            materialChemTotal.value = 0
        } finally {
            materialChemLoading.value = false
        }
    }

    const refreshMaterialChem = () => {
        if (selectedLabChemRow.value && selectedLabChemRow.value.material) {
            materialChemPage.value.current = 1
            fetchMaterialChem(selectedLabChemRow.value.material)
        }
    }

    const handleMaterialChemSizeChange = () => {
        materialChemPage.value.current = 1
        if (selectedLabChemRow.value) {
            fetchMaterialChem(selectedLabChemRow.value.material)
        }
    }

    const handleMaterialChemCurrentChange = () => {
        if (selectedLabChemRow.value) {
            fetchMaterialChem(selectedLabChemRow.value.material)
        }
    }

    // ==================== 3. 机械性能（后端接口） ====================
    const mechList = ref([])
    const mechTotal = ref(0)
    const mechPage = ref({ current: 1, size: 10 })
    const mechQuery = ref({ orderNo: '', material: '', heatNo: '' })

    const fetchMech = async () => {
        loading.value = true
        try {
            const res = await axios.get('/api/lab-query/mech-prop-list', {
                params: {
                    orderNo: mechQuery.value.orderNo || undefined,
                    material: mechQuery.value.material || undefined,
                    heatNo: mechQuery.value.heatNo || undefined,
                    pageIndex: mechPage.value.current,
                    pageSize: mechPage.value.size
                }
            })
            if (res.data.Success) {
                mechList.value = res.data.Data.List || []
                mechTotal.value = res.data.Data.Total || 0
            } else {
                ElMessage.error(res.data.Message || '获取机械性能数据失败')
                mechList.value = []
                mechTotal.value = 0
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
            mechList.value = []
            mechTotal.value = 0
        } finally {
            loading.value = false
        }
    }

    const searchMech = () => {
        mechPage.value.current = 1
        fetchMech()
    }

    const resetMech = () => {
        mechQuery.value = { orderNo: '', material: '', heatNo: '' }
        searchMech()
    }

    const handleMechSizeChange = () => {
        mechPage.value.current = 1
        fetchMech()
    }

    const handleMechCurrentChange = () => {
        fetchMech()
    }

    // 机械性能列定义（用于导出，需与模板中所有叶子列对应）
    const mechCols = [
        { prop: 'registrar', label: '登记人员' },
        { prop: 'orderNo', label: '订单号' },
        { prop: 'sheetNo', label: '委托单号' },
        { prop: 'inspectionNo', label: '报检单号' },
        { prop: 'material', label: '材质' },
        { prop: 'heatNo', label: '原材料炉号' },
        { prop: 'heatTreatmentNo', label: '热处理炉号' },
        { prop: 'specimenSize', label: '试样尺寸/产品尺寸' },
        { prop: 'heatTreatmentParam', label: '热处理工艺与参数' },
        // 拉伸
        { prop: 'tensileDrawingNo', label: '拉伸取样图号' },
        { prop: 'tensileDirection', label: '拉伸试样取样方向' },
        { prop: 'tensilePosition', label: '拉伸试样取样位置' },
        { prop: 'tensileStandard', label: '拉伸试验标准' },
        { prop: 'tensileTemp', label: '拉伸试验温度(℃)' },
        { prop: 'tensileSize', label: '拉伸试样尺寸(mm)' },
        { prop: 'tensileStrength', label: '拉伸抗拉强度(MPa)' },
        { prop: 'yieldStrength', label: '拉伸屈服强度(MPa)' },
        { prop: 'elongation', label: '拉伸延伸率(%)' },
        { prop: 'reductionArea', label: '拉伸截面收缩率(%)' },
        { prop: 'yieldRatio', label: '拉伸屈强比' },
        { prop: 'tensileRemark', label: '拉伸备注' },
        // 冲击
        { prop: 'impactDrawingNo', label: '冲击取样图号' },
        { prop: 'impactDirection', label: '冲击试样取样方向' },
        { prop: 'impactPosition', label: '冲击试样取样位置' },
        { prop: 'impactStandard', label: '冲击试验标准' },
        { prop: 'impactSize', label: '冲击试样尺寸(mm)' },
        { prop: 'impactTemp', label: '冲击试验温度(℃)' },
        { prop: 'impactNotch', label: '冲击缺口形式' },
        { prop: 'impactKV1', label: '冲击功1(J)' },
        { prop: 'impactKV2', label: '冲击功2(J)' },
        { prop: 'impactKV3', label: '冲击功3(J)' },
        { prop: 'lateralExpansion1', label: '侧向膨胀量1(mm)' },
        { prop: 'lateralExpansion2', label: '侧向膨胀量2(mm)' },
        { prop: 'lateralExpansion3', label: '侧向膨胀量3(mm)' },
        { prop: 'shearArea1', label: '剪切面积1(%)' },
        { prop: 'shearArea2', label: '剪切面积2(%)' },
        { prop: 'shearArea3', label: '剪切面积3(%)' },
        { prop: 'impactRemark', label: '冲击备注' },
        // 硬度
        { prop: 'hardnessDrawingNo', label: '硬度取样图号' },
        { prop: 'hardnessDirection', label: '硬度试样取样方向' },
        { prop: 'hardnessPosition', label: '硬度试样取样位置' },
        { prop: 'hardnessStandard', label: '硬度试验标准' },
        { prop: 'hbw', label: 'HBW' },
        { prop: 'hrc', label: 'HRC' },
        { prop: 'hv', label: 'HV' },
        { prop: 'hardnessRemark', label: '硬度备注' },
        // 晶粒度
        { prop: 'grainDrawingNo', label: '晶粒度取样图号' },
        { prop: 'grainDirection', label: '晶粒度试样取样方向' },
        { prop: 'grainPosition', label: '晶粒度试样取样位置' },
        { prop: 'grainStandard', label: '晶粒度试验标准' },
        { prop: 'grainSize', label: '晶粒度测试结果' },
        { prop: 'grainRemark', label: '晶粒度备注' },
        // 剪切试验
        { prop: 'shearDrawingNo', label: '剪切取样图号' },
        { prop: 'shearDirection', label: '剪切试样取样方向' },
        { prop: 'shearPosition', label: '剪切试样取样位置' },
        { prop: 'shearStandard', label: '剪切试验标准' },
        { prop: 'shearSize', label: '剪切试样尺寸' },
        { prop: 'shearStrength', label: '剪切结合力(MPa)' },
        { prop: 'shearRemark', label: '剪切备注' },
        // 非金属夹杂物
        { prop: 'inclusionDrawingNo', label: '夹杂物取样图号' },
        { prop: 'inclusionDirection', label: '夹杂物试样取样方向' },
        { prop: 'inclusionPosition', label: '夹杂物试样取样位置' },
        { prop: 'inclusionStandard', label: '夹杂物试验标准' },
        { prop: 'inclusionA_coarse', label: 'A类粗系' },
        { prop: 'inclusionA_fine', label: 'A类细系' },
        { prop: 'inclusionB_coarse', label: 'B类粗系' },
        { prop: 'inclusionB_fine', label: 'B类细系' },
        { prop: 'inclusionC_coarse', label: 'C类粗系' },
        { prop: 'inclusionC_fine', label: 'C类细系' },
        { prop: 'inclusionD_coarse', label: 'D类粗系' },
        { prop: 'inclusionD_fine', label: 'D类细系' },
        { prop: 'inclusionRemark', label: '夹杂物备注' },
        // 铁素体含量
        { prop: 'ferriteDrawingNo', label: '铁素体取样图号' },
        { prop: 'ferriteDirection', label: '铁素体试样取样方向' },
        { prop: 'ferritePosition', label: '铁素体试样取样位置' },
        { prop: 'ferriteStandard', label: '铁素体试验标准' },
        { prop: 'ferriteContent', label: '铁素体含量%' },
        { prop: 'ferriteRemark', label: '铁素体备注' },
        // 带状组织评定
        { prop: 'bandDrawingNo', label: '带状取样图号' },
        { prop: 'bandDirection', label: '带状试样取样方向' },
        { prop: 'bandPosition', label: '带状试样取样位置' },
        { prop: 'bandStandard', label: '带状试验标准' },
        { prop: 'bandRating', label: '带状组织评级' },
        { prop: 'bandRemark', label: '带状备注' },
        // 有害相检测
        { prop: 'harmfulDrawingNo', label: '有害相取样图号' },
        { prop: 'harmfulDirection', label: '有害相试样取样方向' },
        { prop: 'harmfulPosition', label: '有害相试样取样位置' },
        { prop: 'harmfulStandard', label: '有害相试验标准' },
        { prop: 'harmfulConclusion', label: '有害相试验结论' },
        { prop: 'harmfulRemark', label: '有害相备注' },
        // 金相组织
        { prop: 'microDrawingNo', label: '金相取样图号' },
        { prop: 'microDirection', label: '金相试样取样方向' },
        { prop: 'microPosition', label: '金相试样取样位置' },
        { prop: 'microStandard', label: '金相试验标准' },
        { prop: 'microstructure', label: '金相组织结论' },
        { prop: 'microRemark', label: '金相备注' }
    ]

    const exportMech = () => {
        exportToExcel(mechList.value, mechCols, '机械性能')
    }

    // ==================== 4. CTOD & 腐蚀试验（后端接口） ====================
    const corrList = ref([])
    const corrTotal = ref(0)
    const corrPage = ref({ current: 1, size: 10 })
    const corrQuery = ref({ orderNo: '', material: '', heatNo: '' })

    const fetchCorr = async () => {
        loading.value = true
        try {
            const res = await axios.get('/api/lab-query/corr-list', {
                params: {
                    orderNo: corrQuery.value.orderNo || undefined,
                    material: corrQuery.value.material || undefined,
                    heatNo: corrQuery.value.heatNo || undefined,
                    pageIndex: corrPage.value.current,
                    pageSize: corrPage.value.size
                }
            })
            if (res.data.Success) {
                corrList.value = res.data.Data.List || []
                corrTotal.value = res.data.Data.Total || 0
            } else {
                ElMessage.error(res.data.Message || '获取腐蚀试验数据失败')
                corrList.value = []
                corrTotal.value = 0
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
            corrList.value = []
            corrTotal.value = 0
        } finally {
            loading.value = false
        }
    }

    const searchCorr = () => {
        corrPage.value.current = 1
        fetchCorr()
    }

    const resetCorr = () => {
        corrQuery.value = { orderNo: '', material: '', heatNo: '' }
        searchCorr()
    }

    const handleCorrSizeChange = () => {
        corrPage.value.current = 1
        fetchCorr()
    }

    const handleCorrCurrentChange = () => {
        fetchCorr()
    }

    // 腐蚀试验列定义（用于导出）
    const corrCols = [
        { prop: 'registrar', label: '登记人员' },
        { prop: 'orderNo', label: '订单号' },
        { prop: 'sheetNo', label: '委托单号' },
        { prop: 'inspectionNo', label: '报检单号' },
        { prop: 'material', label: '材质' },
        { prop: 'heatNo', label: '原材料炉号' },
        { prop: 'heatTreatmentNo', label: '热处理炉号' },
        { prop: 'blockSize', label: '试块尺寸/产品尺寸' },
        { prop: 'heatTreatmentParam', label: '热处理工艺与参数' },
        // CTOD
        { prop: 'ctodDrawingNo', label: 'CTOD取样图号' },
        { prop: 'ctodDirection', label: 'CTOD试样取样方向' },
        { prop: 'ctodPosition', label: 'CTOD试样取样位置' },
        { prop: 'ctodStandard', label: 'CTOD试验标准' },
        { prop: 'ctodEnvironment', label: 'CTOD试验环境' },
        { prop: 'ctodTemp', label: 'CTOD试验温度(℃)' },
        { prop: 'ctodSize', label: 'CTOD试样尺寸(mm)' },
        { prop: 'ctodValue1', label: 'CTOD测试值1#(mm)' },
        { prop: 'ctodValue2', label: 'CTOD测试值2#(mm)' },
        { prop: 'ctodValue3', label: 'CTOD测试值3#(mm)' },
        { prop: 'ctodRemark', label: 'CTOD备注' },
        // HIC
        { prop: 'hicDrawingNo', label: 'HIC取样图号' },
        { prop: 'hicDirection', label: 'HIC试样取样方向' },
        { prop: 'hicPosition', label: 'HIC试样取样位置' },
        { prop: 'hicStandard', label: 'HIC试验标准' },
        { prop: 'hicSolution', label: 'HIC试验溶液' },
        { prop: 'hicTemp', label: 'HIC试验温度(℃)' },
        { prop: 'hicTime', label: 'HIC试验时间(H)' },
        { prop: 'hicSize', label: 'HIC试样尺寸(mm)' },
        { prop: 'hicClr1', label: 'HIC CLR1#(%)' },
        { prop: 'hicClr2', label: 'HIC CLR2#(%)' },
        { prop: 'hicClr3', label: 'HIC CLR3#(%)' },
        { prop: 'hicCtr1', label: 'HIC CTR1#(%)' },
        { prop: 'hicCtr2', label: 'HIC CTR2#(%)' },
        { prop: 'hicCtr3', label: 'HIC CTR3#(%)' },
        { prop: 'hicCsr1', label: 'HIC CSR1#(%)' },
        { prop: 'hicCsr2', label: 'HIC CSR2#(%)' },
        { prop: 'hicCsr3', label: 'HIC CSR3#(%)' },
        { prop: 'hicCar1', label: 'HIC CAR1#(%)' },
        { prop: 'hicCar2', label: 'HIC CAR2#(%)' },
        { prop: 'hicCar3', label: 'HIC CAR3#(%)' },
        { prop: 'hicRemark', label: 'HIC备注' },
        // SSC
        { prop: 'sscDrawingNo', label: 'SSC取样图号' },
        { prop: 'sscDirection', label: 'SSC试样取样方向' },
        { prop: 'sscPosition', label: 'SSC试样取样位置' },
        { prop: 'sscStandard', label: 'SSC试验标准' },
        { prop: 'sscSolution', label: 'SSC试验溶液' },
        { prop: 'sscTemp', label: 'SSC试验温度(℃)' },
        { prop: 'sscTime', label: 'SSC试验时间(H)' },
        { prop: 'sscSize', label: 'SSC试样尺寸(mm)' },
        { prop: 'sscValue1', label: 'SSC测试值1#' },
        { prop: 'sscValue2', label: 'SSC测试值2#' },
        { prop: 'sscValue3', label: 'SSC测试值3#' },
        { prop: 'sscRemark', label: 'SSC备注' },
        // 晶间腐蚀
        { prop: 'igcDrawingNo', label: '晶间腐蚀取样图号' },
        { prop: 'igcDirection', label: '晶间腐蚀试样取样方向' },
        { prop: 'igcPosition', label: '晶间腐蚀试样取样位置' },
        { prop: 'igcStandard', label: '晶间腐蚀试验标准' },
        { prop: 'igcSolution', label: '晶间腐蚀试验溶液' },
        { prop: 'igcTemp', label: '晶间腐蚀试验温度(℃)' },
        { prop: 'igcTime', label: '晶间腐蚀试验时间(H)' },
        { prop: 'igcSize', label: '晶间腐蚀试样尺寸(mm)' },
        { prop: 'igcRate', label: '晶间腐蚀腐蚀速率(mm/y)' },
        { prop: 'igcRemark', label: '晶间腐蚀备注' },
        // 点腐蚀
        { prop: 'pittingDrawingNo', label: '点腐蚀取样图号' },
        { prop: 'pittingDirection', label: '点腐蚀试样取样方向' },
        { prop: 'pittingPosition', label: '点腐蚀试样取样位置' },
        { prop: 'pittingStandard', label: '点腐蚀试验标准' },
        { prop: 'pittingSolution', label: '点腐蚀试验溶液' },
        { prop: 'pittingTemp', label: '点腐蚀试验温度(℃)' },
        { prop: 'pittingTime', label: '点腐蚀试验时间(小时)' },
        { prop: 'pittingSize', label: '点腐蚀试样尺寸(mm)' },
        { prop: 'pittingLoss', label: '点腐蚀重量损失(g/m²)' },
        { prop: 'pittingDesc', label: '点蚀情况(20倍)' },
        { prop: 'pittingRemark', label: '点腐蚀备注' }
    ]

    const exportCorr = () => {
        exportToExcel(corrList.value, corrCols, '腐蚀试验')
    }

    // ==================== 页签切换懒加载 ====================
    const handleTabClick = (tab) => {
        if (tab.paneName === 'rawChem' && rawChemList.value.length === 0) {
            fetchRawChem()
        }
        if (tab.paneName === 'labChem' && labChemList.value.length === 0) {
            fetchLabChem()
        }
        if (tab.paneName === 'mechProp' && mechList.value.length === 0) {
            fetchMech()
        }
        if (tab.paneName === 'corrosion' && corrList.value.length === 0) {
            fetchCorr()
        }
    }

    // 初始化加载
    onMounted(() => {
        if (activeTab.value === 'rawChem') {
            fetchRawChem()
        } else if (activeTab.value === 'labChem') {
            fetchLabChem()
        } else if (activeTab.value === 'mechProp') {
            fetchMech()
        } else if (activeTab.value === 'corrosion') {
            fetchCorr()
        }
    })
</script>

<style scoped>
    .lab-data-query {
        background: #f0f2f5;
        padding: 20px;
        min-height: 100vh;
    }

    .query-bar {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 20px;
        background: #fff;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .table-wrapper {
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        overflow-x: auto;
    }

    .pagination {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }

    :deep(.el-table) {
        font-size: 12px;
    }

    :deep(.el-table th.el-table__cell) {
        background-color: #f5f7fa;
        color: #2c3e50;
        font-weight: 600;
    }
</style>