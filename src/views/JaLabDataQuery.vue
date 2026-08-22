<template>
    <div class="lab-full-report">
        <!-- 查询区域 -->
        <div class="query-bar">
            <el-input v-model="queryForm.taskNo" placeholder="委托单号 Task Number" clearable style="width:200px" />
            <el-input v-model="queryForm.orderNo" placeholder="订单号 Order No" clearable style="width:180px" />
            <el-input v-model="queryForm.material" placeholder="牌号 Material trademark" clearable style="width:180px" />
            <el-input v-model="queryForm.heatNumber" placeholder="炉号 Heat number" clearable style="width:220px" />
            <el-input v-model="queryForm.batchNumber" placeholder="批号 Batch number" clearable style="width:220px" />

            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleExport">导出Excel</el-button>
        </div>

        <div class="table-container">
            <!-- ========== 关键改动：删除 header-cell-style 和 cell-style ========== -->
            <el-table ref="tableRef"
                      :data="tableData"
                      border
                      stripe
                      v-loading="loading"
                      max-height="600">
                <!-- ========== 左侧固定基础信息 ========== -->
                <el-table-column prop="testNo" width="130">
                    <template #header>
                        报检单号
                        <br>Test Number
                    </template>
                </el-table-column>
                <el-table-column prop="taskNo" width="130">
                    <template #header>
                        委托单号
                        <br>Task Number
                    </template>
                </el-table-column>
                <el-table-column prop="orderNo" width="120">
                    <template #header>
                        订单号
                        <br>Order No
                    </template>
                </el-table-column>
                <el-table-column prop="material" width="140">
                    <template #header>
                        牌号
                        <br>Material trademark
                    </template>
                </el-table-column>
                <el-table-column prop="heatBatchNo" width="160">
                    <template #header>
                        炉号/批号
                        <br>Heat/Batch number
                    </template>
                </el-table-column>
                <el-table-column prop="heatNumber" width="160">
                    <template #header>
                        炉号
                        <br>Heat number
                    </template>
                </el-table-column>
                <el-table-column prop="batchNumber" width="160">
                    <template #header>
                        批号
                        <br>batch number
                    </template>
                </el-table-column>
                <el-table-column prop="sampleSize" width="130">
                    <template #header>
                        规格
                        <br>Sample size
                    </template>
                </el-table-column>

                <!-- ========== 拉伸试验 ========== -->
                <el-table-column>
                    <template #header>
                        拉伸试验
                        <br>Tensile test
                    </template>
                    <el-table-column prop="tensileSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="tensileTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="sampleType" width="130">
                        <template #header>
                            试样类型
                            <br>Sample Type
                        </template>
                    </el-table-column>
                    <el-table-column prop="tensileStrength" width="130">
                        <template #header>
                            抗拉强度
                            <br>Tensile
                        </template>
                    </el-table-column>
                    <el-table-column prop="yieldStrength" width="130">
                        <template #header>
                            屈服强度
                            <br>Yield stren
                        </template>
                    </el-table-column>
                    <el-table-column prop="elongation" width="110">
                        <template #header>
                            延伸率
                            <br>Elongation
                        </template>
                    </el-table-column>
                    <el-table-column prop="reduction" width="110">
                        <template #header>
                            收缩率
                            <br>Reduction
                        </template>
                    </el-table-column>
                    <el-table-column prop="tensileConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 硬度 ========== -->
                <el-table-column>
                    <template #header>
                        硬度
                        <br>Hardness
                    </template>
                    <el-table-column prop="hardnessSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="hardnessPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="hardnessResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test Results
                        </template>
                    </el-table-column>
                    <el-table-column prop="hardnessConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 冲击实验 ========== -->
                <el-table-column>
                    <template #header>
                        冲击实验
                        <br>Impulse test
                    </template>
                    <el-table-column prop="impactSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="impactTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="impactTestTemp" width="130">
                        <template #header>
                            试验温度℃
                            <br>Test ℃
                        </template>
                    </el-table-column>
                    <el-table-column prop="impactNotchType" width="130">
                        <template #header>
                            缺口形式
                            <br>Notch form
                        </template>
                    </el-table-column>
                    <el-table-column label="冲击功">
                        <el-table-column prop="impactEnergy1" label="1" width="90" />
                        <el-table-column prop="impactEnergy2" label="2" width="90" />
                        <el-table-column prop="impactEnergy3" label="3" width="90" />
                    </el-table-column>
                    <el-table-column label="侧向膨胀量">
                        <el-table-column prop="lateralExp1" label="1" width="90" />
                        <el-table-column prop="lateralExp2" label="2" width="90" />
                        <el-table-column prop="lateralExp3" label="3" width="90" />
                    </el-table-column>
                    <el-table-column label="剪切面积">
                        <el-table-column prop="shearArea1" label="1" width="90" />
                        <el-table-column prop="shearArea2" label="2" width="90" />
                        <el-table-column prop="shearArea3" label="3" width="90" />
                    </el-table-column>
                    <el-table-column prop="impactConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 化学成分 ========== -->
                <el-table-column>
                    <template #header>
                        化学成分
                        <br>Composition
                    </template>
                    <el-table-column prop="chemSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="chemResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test result
                        </template>
                    </el-table-column>
                    <el-table-column prop="chemConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 宏观检验 ========== -->
                <el-table-column>
                    <template #header>
                        宏观检验
                        <br>Macroscopic Examination
                    </template>
                    <el-table-column prop="macroSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="macroTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="macroResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test result
                        </template>
                    </el-table-column>
                    <el-table-column prop="macroConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 金相检验 ========== -->
                <el-table-column>
                    <template #header>
                        金相检验
                        <br>Metallographic Test
                    </template>
                    <el-table-column prop="metalloSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="metalloTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="metalloResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test result
                        </template>
                    </el-table-column>
                    <el-table-column prop="metalloConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 有害相 ========== -->
                <el-table-column>
                    <template #header>
                        有害相
                        <br>Harmful element
                    </template>
                    <el-table-column prop="harmSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="harmTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="harmResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test result
                        </template>
                    </el-table-column>
                    <el-table-column prop="harmConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 平均晶粒度 ========== -->
                <el-table-column>
                    <template #header>
                        平均晶粒度
                        <br>Grade of the average grain size
                    </template>
                    <el-table-column prop="grainSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="grainTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="grainResult" width="160">
                        <template #header>
                            检测结果
                            <br>Test result
                        </template>
                    </el-table-column>
                    <el-table-column prop="grainConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 非金属夹杂 ========== -->
                <el-table-column>
                    <template #header>
                        非金属夹杂物
                        <br>Nonmetallic Inclusions
                    </template>
                    <el-table-column prop="inclusionSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="inclusionTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>

                    <!-- Type A：硫化物类 -->
                    <el-table-column label="Type A(硫化物类)" align="center">
                        <el-table-column prop="sulfideFine" label="细系 Thin" width="90" />
                        <el-table-column prop="sulfideCoarse" label="粗系 Heavy" width="90" />
                    </el-table-column>

                    <!-- Type B：氧化铝类 -->
                    <el-table-column label="Type B(氧化铝类)" align="center">
                        <el-table-column prop="aluminaFine" label="细系 Thin" width="90" />
                        <el-table-column prop="aluminaCoarse" label="粗系 Heavy" width="90" />
                    </el-table-column>

                    <!-- Type C：硅酸盐类 -->
                    <el-table-column label="Type C(硅酸盐类)" align="center">
                        <el-table-column prop="silicateFine" label="细系 Thin" width="90" />
                        <el-table-column prop="silicateCoarse" label="粗系 Heavy" width="90" />
                    </el-table-column>

                    <!-- Type D：球状氧化物类 -->
                    <el-table-column label="Type D(环状氧化物类)" align="center">
                        <el-table-column prop="globularOxideFine" label="细系 Thin" width="90" />
                        <el-table-column prop="globularOxideCoarse" label="粗系 Heavy" width="90" />
                    </el-table-column>

                    <!-- 结论 -->
                    <el-table-column prop="inclusionConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 晶间腐蚀 ========== -->
                <el-table-column>
                    <template #header>
                        晶间腐蚀
                        <br>Intergranular Corrosion
                    </template>
                    <el-table-column prop="igcSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="icPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcSensitization" width="140">
                        <template #header>
                            敏化参数
                            <br>Sensitization
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcSize" width="160">
                        <template #header>
                            尺寸mm
                            <br>长×宽×厚
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcTime" width="110">
                        <template #header>
                            时间
                            <br>Time
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcBendDiameter" width="150">
                        <template #header>
                            弯曲直径mm
                            <br>Mandrel Diameter
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcBendAngle" width="120">
                        <template #header>
                            弯曲角度
                            <br>Bend Angle
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcMassInit" width="140">
                        <template #header>
                            试验前重量
                            <br>Initial Mass(g)
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcMassFinal" width="140">
                        <template #header>
                            试验后重量
                            <br>Final Mass(g)
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcCorrRate1" width="130">
                        <template #header>
                            腐蚀速率
                            <br>mm/y
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcCorrRate2" width="130">
                        <template #header>
                            腐蚀速率
                            <br>mm/月
                        </template>
                    </el-table-column>
                    <el-table-column prop="igcObservation" width="120" label="X观察" />
                    <el-table-column prop="igcConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- ========== 点腐蚀 ========== -->
                <el-table-column>
                    <template #header>
                        点腐蚀
                        <br>Pitting Corrosion
                    </template>
                    <el-table-column prop="pittingSampleNo" width="140">
                        <template #header>
                            试样编号
                            <br>Sample No
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingTestPos" width="140">
                        <template #header>
                            检测位置
                            <br>Test Position
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingSize" width="160">
                        <template #header>
                            尺寸mm
                            <br>长×宽×厚
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingTime" width="130">
                        <template #header>
                            试验时间
                            <br>Time
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingMassInit" width="140">
                        <template #header>
                            试验前重量
                            <br>Initial Mass(g)
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingMassFinal" width="140">
                        <template #header>
                            试验后重量
                            <br>Final Mass(g)
                        </template>
                    </el-table-column>
                    <el-table-column prop="pittingCorrRate" width="130" label="腐蚀速率质量损耗 " />
                    <el-table-column prop="pittingObservation" width="120" label="X观察" />
                    <el-table-column prop="pitConclusion" width="130">
                        <template #header>
                            结论
                            <br>Test Conclusion
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>

            <!-- ========== 分页：在 table-container 内部 ========== -->
            <div class="pagination-wrap">
                <el-pagination v-model:current-page="page.current"
                               v-model:page-size="page.size"
                               :page-sizes="[10,20,50,100]"
                               :total="total"
                               layout="total, sizes, prev, pager, next, jumper"
                               @current-change="fetchData"
                               @size-change="fetchData" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, nextTick } from 'vue'
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    import * as XLSX from 'xlsx'

    const tableRef = ref(null)
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const page = ref({ current: 1, size: 10 })

    const queryForm = ref({
        taskNo: '',
        orderNo: '',
        material: '',
        heatNumber: '',
        batchNumber: ''
    })

    async function fetchData() {
        loading.value = true
        try {
            const res = await axios.get('/api/ja-lab/lab-comprehensive', {
                params: {
                    pageIndex: page.value.current,
                    pageSize: page.value.size,
                    ...queryForm.value
                }
            })
            if (res.data.Success) {
                tableData.value = res.data.Data.List
                total.value = res.data.Data.Total
            } else {
                ElMessage.error(res.data.Message || '查询失败')
            }
        } catch (e) {
            ElMessage.error('网络请求异常:' + e.message)
        } finally {
            loading.value = false
            nextTick(() => {
                if (tableRef.value) {
                    tableRef.value.doLayout()
                }
            })
        }
    }

    const handleSearch = () => {
        page.value.current = 1
        fetchData()
    }

    const handleReset = () => {
    queryForm.value = { 
        taskNo: '', 
        orderNo: '', 
        material: '', 
        heatNumber: '',   
        batchNumber: ''   
    }
    page.value.current = 1
    fetchData()
}

    const handleExport = () => {
        if (!tableData.value.length) {
            return ElMessage.warning('没有可导出的数据')
        }
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tableData.value), '吉安试验数据_$')
        XLSX.writeFile(wb, `吉安试验数据_${Date.now()}.xlsx`)
    }

    onMounted(() => fetchData())
</script>

<style scoped>
    .lab-full-report {
        padding: 16px;
        font-size: 13px;
    }

    .query-bar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 14px;
        background: #fff;
        border-radius: 6px;
        margin-bottom: 12px;
    }

    .table-container {
        background: #fff;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
    }

    .pagination-wrap {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }

    /* ========== 统一表格样式 ========== */
    :deep(.el-table) {
        font-size: 12px;
    }

    /* 表头样式：居中 + 背景色 + 加粗 600 */
    :deep(.el-table th.el-table__cell) {
        background-color: #f5f7fa;
        color: #2c3e50;
        font-weight: 600;
        text-align: center; /* 列名居中 */
    }

    /* 单元格内容：居中 + 字体大小 */
    :deep(.el-table .cell) {
        font-size: 12px;
        text-align: center; /* 内容居中 */
    }

    /* 表头文字自动换行 */
    :deep(.el-table th > .cell) {
        white-space: normal;
        line-height: 1.4;
        font-size: 12px;
    }

    /* 分页字体统一 */
    :deep(.el-pagination) {
        font-size: 12px;
    }

    :deep(.el-pagination .el-pagination__total),
    :deep(.el-pagination .el-pagination__sizes),
    :deep(.el-pagination .el-pagination__jump) {
        font-size: 12px;
    }
</style>