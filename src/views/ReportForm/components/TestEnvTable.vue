<template>
    <div>
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">3、检测环境/Test Environment</h3>
        <el-button type="primary" size="small" style="margin-bottom: 10px;" @click="emit('addRow')" :disabled="isDetail">+ 新增行</el-button>
        <el-table :data="testEnv" border stripe style="width: 100%;">
            <el-table-column label="检测项目编码" prop="projectCode" min-width="130">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-select v-model="scope.row.projectCode"
                               placeholder="选择项目"
                               size="small"
                               clearable
                               :disabled="isDetail"
                               @change="(val) => emit('projectCodeChange', { index: scope.$index, code: val })">
                        <el-option v-for="env in envList" :key="env.EnvCode" :label="env.EnvCode" :value="env.EnvCode">
                            <span>{{ env.EnvCode }} - {{ env.ProjectName || '' }}</span>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="项目/Item" prop="item" min-width="120">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.item" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                </template>
            </el-table-column>
            <el-table-column label="温度要求（℃）" prop="reqTemp" min-width="150">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.reqTemp" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                </template>
            </el-table-column>
            <el-table-column label="检测室温度（℃）" prop="testTemp" min-width="180">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.testTemp" placeholder="实际温度" size="small" clearable :disabled="isDetail" />
                </template>
            </el-table-column>
            <el-table-column label="湿度要求（%RH）" prop="reqHumidity" min-width="150">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.reqHumidity" placeholder="自动回填" readonly size="small" :disabled="isDetail" />
                </template>
            </el-table-column>
            <el-table-column label="检测室湿度（%RH）" prop="testHumidity" min-width="180">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-input v-model="scope.row.testHumidity" placeholder="实际湿度" size="small" clearable :disabled="isDetail" />
                </template>
            </el-table-column>
            <el-table-column label="技术要求" prop="techSpecCode" min-width="200">
                <template #default="scope">
                    <!-- eslint-disable-next-line vue/no-mutating-props -->
                    <el-select v-model="scope.row.techSpecCode"
                               placeholder="选择技术要求"
                               size="small"
                               clearable
                               :disabled="isDetail"
                               @change="(val) => emit('techSpecChange', { index: scope.$index, specId: val })">
                        <el-option v-for="t in techSpecList" :key="t.Id" :label="t.Name" :value="Number(t.Id)" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                    <el-button type="link" color="danger" size="small" @click="emit('deleteRow', scope.$index)" :disabled="testEnv.length <= 1 || isDetail">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
    /* globals defineProps, defineEmits */
    defineProps({
        testEnv: Array,
        envList: Array,
        techSpecList: Array,
        isDetail: Boolean
    })

    const emit = defineEmits(['addRow', 'deleteRow', 'projectCodeChange', 'techSpecChange'])
</script>