<template>
    <div class="home-tab" style="width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 15mm; background: #fff; border: 1px solid #ddd; box-sizing: border-box; position: relative;">
        <div style="text-align: center; margin-bottom: 20mm;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">检测报告</h1>
            <h2 style="font-size: 28px; font-weight: bold; margin: 0;">TEST REPORT</h2>
        </div>

        <el-descriptions :column="1" border label-position="left" size="small" style="width: 100%; margin-bottom: 25mm;">
            <el-descriptions-item>
                <template #label>
                    委托单位名称
                    <br />Client
                </template>
                <el-input v-model="localForm.ClientName"
                          type="textarea"
                          :disabled="isDetail"
                          :rows="3"
                          resize="none"
                          style="min-height:72px;" />
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    委托单位地址
                    <br />Client Address
                </template>
                <el-input v-model="localForm.ClientAddress"
                          type="textarea"
                          :disabled="isDetail"
                          :rows="4"
                          resize="none"
                          style="min-height:96px;" />
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    收样日期
                    <br />Date of Receipt
                </template>
                <el-date-picker v-model="localForm.ReceiptDate" type="date" :disabled="isDetail" style="width:100%" />
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    检测周期
                    <br />Test Cycle
                </template>
                <el-input v-model="localForm.TestCycle"
                          :disabled="isDetail"
                          style="width:100%"
                          placeholder="请输入检测周期" />
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    报告日期
                    <br />Report Date
                </template>
                <el-date-picker v-model="localForm.ReportDate" type="date" :disabled="isDetail" style="width:100%" />
            </el-descriptions-item>
        </el-descriptions>

        <div style="font-size: 12px; line-height: 1.7; color: #333; margin-bottom: 20mm;">
            <p>本报告未加盖本公司检测专用章无效；无编辑、审核、签发人签字无效；涂改无效。生产厂家、规格、炉批号、标准、牌号、样品标识等信息由委托人提供，其真实性由委托人负责。报告仅对来样负责。未经本公司书面同意，不得部分地复制本报告。对测试报告若有异议，请于收到报告之日起十五日内提出。如果报告中的中、英文内容上有矛盾，以中文内容为准。报告封面无CNAS标识时，此报告不做仲裁及相关证明用。</p>
            <p style="margin-top: 8px;">This report without the company's special seal for testing is invalid. This report is invalid without the signature of the editor, auditor or approver. This report shall be invalid if the content of the report is altered. Sample's information (Manufacturer, Size, Heat No., Lot No, Specification, Grade, Marking.etc.) is submitted by the applicant. Its authenticity is the responsibility of the applicant. This report is only responsible for the test sample. This report shall not be copied partially without the written permission of the company. If you have any objection to the test report, please submit it within 15 days from the date of receiving the report. In case of any discrepancy between the Chinese and English contents of this report, the Chinese contents shall prevail. The report without the mark of CNAS, shall not be used for arbitration or relevant certification.</p>
        </div>

        <div style="text-align: center; margin-top: 15mm; font-family: SimSun, serif; line-height: 1.8;">
            <div style="font-size: 16pt; font-weight: bold;">苏州诺码检测技术有限公司</div>
            <div style="font-size: 14pt; font-weight: bold;">Suzhou Normal Testing Technology Co., Ltd.</div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    /* globals defineProps */
    const props = defineProps({
        homeForm: {
            type: Object,
            required: true
        },
        isDetail: {
            type: Boolean,
            default: false
        }
    })

    const localForm = computed({
        get() {
            return props.homeForm
        },
        set() { }
    })
</script>