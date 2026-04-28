<template>
    <div style="padding: 20px; max-width: 1600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 20px;">检测报告管理</h2>

        <!-- 查询条件 -->
        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <el-form :inline="true" :model="queryForm">
                <el-form-item label="报检单号">
                    <el-input v-model="queryForm.inspectionOrderNo" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="样品名称">
                    <el-input v-model="queryForm.sampleName" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getList">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 操作栏 -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
            <el-button type="primary" icon="Plus" @click="toAdd">+ 新增检测报告</el-button>
            <span>共 {{ total }} 条数据</span>
        </div>

        <!-- 表格：补充创建人/创建时间/修改人/修改时间 -->
        <el-table :data="tableData" border stripe :loading="loading" style="width: 100%;">
            <el-table-column label="ID" prop="ID" width="80" align="center" />
            <el-table-column label="报告编号" prop="reportNo" min-width="160" />
            <el-table-column label="报检单号" prop="inspectionOrderNo" min-width="160" />
            <el-table-column label="样品名称" prop="sampleName" min-width="150" />
            <el-table-column label="委托单号" prop="orderNo" min-width="160" />

            <!-- 补充：创建人 -->
            <el-table-column label="创建人" prop="createName" min-width="120" align="center" />
            <!-- 创建时间列 -->
            <el-table-column label="创建时间" prop="createTime" min-width="180" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                </template>
            </el-table-column>
            <!-- 补充：修改人 -->
            <el-table-column label="修改人" prop="updateName" min-width="120" align="center" />
            <!-- 修改时间列 -->
            <el-table-column label="修改时间" prop="updateTime" min-width="180" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.updateTime) }}
                </template>
            </el-table-column>

            <el-table-column label="操作" width="260" align="center" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="toEdit(scope.row.ID)">编辑</el-button>
                    <el-button type="success" size="small" @click="toDetail(scope.row.ID)">查看</el-button>
                    <el-button type="danger" size="small" @click="deleteReport(scope.row.ID)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="margin-top: 20px; text-align: right;">
            <el-pagination @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           v-model:current-page="pageIndex"
                           :page-sizes="[10,20,50]"
                           v-model:page-size="pageSize"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="total" />
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { useRouter } from 'vue-router'
    import axios from 'axios'

    const router = useRouter()
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const pageIndex = ref(1)
    const pageSize = ref(10)
    const queryForm = ref({
        inspectionOrderNo: '',
        sampleName: ''
    })

    // 时间格式化方法：兼容创建时间/修改时间
    const formatDate = (time) => {
        if (!time) return "-";
        return new Date(time).toLocaleString("zh-CN");
    };

    // 获取报告列表
    const getList = async () => {
        loading.value = true
        try {
            const res = await axios.get('/api/DetectionReport/list', {
                params: {
                    ...queryForm.value,
                    pageIndex: pageIndex.value,
                    pageSize: pageSize.value
                }
            })
            if (res.data.Success) {
                tableData.value = res.data.Data.List
                total.value = res.data.Data.Total
            } else {
                ElMessage.error(res.data.Message)
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
        } finally {
            loading.value = false
        }
    }

    // 新增
    const toAdd = () => {
        router.push('/report/form')
    }

    // 编辑
    const toEdit = (id) => {
        router.push(`/report/form?id=${id}`)
    }

    // 查看
    const toDetail = (id) => {
        router.push(`/report/form?id=${id}&detail=1`)
    }

    // 删除
    const deleteReport = async (id) => {
        try {
            await ElMessageBox.confirm('确认删除该报告？', '提示', { type: 'warning' })
            const res = await axios.delete(`/api/DetectionReport/${id}`)
            if (res.data.Success) {
                ElMessage.success('删除成功')
                getList()
            } else {
                ElMessage.error(res.data.Message)
            }
        } catch (err) {
            ElMessage.error('删除失败或已取消')
        }
    }

    // 分页
    const handleSizeChange = (val) => {
        pageSize.value = val
        getList()
    }
    const handleCurrentChange = (val) => {
        pageIndex.value = val
        getList()
    }

    // 重置查询
    const resetQuery = () => {
        queryForm.value = { inspectionOrderNo: '', sampleName: '' }
        pageIndex.value = 1
        getList()
    }

    onMounted(() => getList())
</script>