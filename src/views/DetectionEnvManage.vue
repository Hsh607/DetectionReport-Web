<template>
    <div class="detection-env-manage" style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 30px;">检测项目环境查询</h2>

        <!-- 查询区域 -->
        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="编码">
                    <el-input v-model="searchForm.envCode" placeholder="请输入编码" clearable style="width: 200px;"></el-input>
                </el-form-item>
                <el-form-item label="项目">
                    <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable style="width: 300px;"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getList">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格列表：prop完全匹配后端大驼峰字段 -->
        <el-table :data="tableData" border stripe style="width: 100%;" :loading="loading">
            <el-table-column prop="EnvCode" label="编码" width="120" align="center"></el-table-column>
            <el-table-column prop="ProjectName" label="项目" min-width="200"></el-table-column>
            <el-table-column prop="ProjectShortName" label="项目简称" min-width="150"></el-table-column>
            <el-table-column prop="RequiredTemperature" label="温度要求" min-width="120" align="center"></el-table-column>
            <el-table-column prop="RequiredHumidity" label="湿度要求" min-width="120" align="center"></el-table-column>
            <el-table-column prop="CreateTime" label="创建时间" min-width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.CreateTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="UpdateTime" label="修改时间" min-width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.UpdateTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="CreateBy" label="创建人" width="100" align="center"></el-table-column>
            <el-table-column prop="UpdateBy" label="修改人" width="100" align="center"></el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="margin-top: 20px; text-align: right;">
            <el-pagination @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page="pageIndex"
                           :page-sizes="[10, 20, 50, 100]"
                           :page-size="pageSize"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'DetectionEnvManage',
        data() {
            return {
                loading: false,
                tableData: [],
                total: 0,
                pageIndex: 1,
                pageSize: 10,
                searchForm: {
                    envCode: '',
                    projectName: ''
                }
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            async getList() {
                this.loading = true
                try {
                    const res = await axios.get('/api/TestProjectEnv/list', {
                        params: {
                            envCode: this.searchForm.envCode,
                            projectName: this.searchForm.projectName,
                            pageIndex: this.pageIndex,
                            pageSize: this.pageSize
                        }
                    })

                    if (res.data.Code === 200) {
                        // 调试日志（验证数据，没问题可删除）
                        console.log('后端返回List:', res.data.Data.List)
                        this.tableData = res.data.Data.List
                        this.total = res.data.Data.Total
                        // 调试日志（验证赋值，没问题可删除）
                        console.log('tableData赋值后:', this.tableData)
                    } else {
                        this.$message.error('加载检测项目环境失败：' + res.data.Msg)
                    }
                } catch (err) {
                    this.$message.error('加载检测项目环境失败：' + (err.response?.data?.Msg || err.message))
                    this.tableData = []
                    this.total = 0
                } finally {
                    this.loading = false
                }
            },
            resetSearch() {
                this.searchForm.envCode = ''
                this.searchForm.projectName = ''
                this.pageIndex = 1
                this.getList()
            },
            handleSizeChange(val) {
                this.pageSize = val
                this.getList()
            },
            handleCurrentChange(val) {
                this.pageIndex = val
                this.getList()
            },
            formatDate(dateStr) {
                if (!dateStr) return ''
                const date = new Date(dateStr)
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
            }
        }
    }
</script>

<style scoped>
    .detection-env-manage .el-form-item {
        margin-bottom: 15px;
    }
</style>