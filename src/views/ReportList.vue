<template>
  <div style="padding: 20px; max-width: 1600px; margin: 0 auto;">
    <h2 style="text-align: center; margin-bottom: 20px;">
      检测报告管理
    </h2>

    <!-- 查询条件 -->
    <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">
        <el-form :inline="true"
                 :model="queryForm"
                 class="compact-form">
            <el-form-item label="所属厂区" style="margin-right: 0;">
                <el-select v-model="queryForm.factoryCode" placeholder="全部" clearable style="width: 100px;">
                    <el-option label="全部" value="" />
                    <el-option label="苏州诺码" value="SZNM" />
                    <el-option label="吉安诺码" value="JANM" />
                    <el-option label="其他诺码" value="XCNM" />
                </el-select>
            </el-form-item>

            <el-form-item label="报检单号" style="margin-right: 0;">
                <el-input v-model="queryForm.inspectionOrderNo" placeholder="请输入" clearable style="width: 110px;" @keyup.enter.prevent="handleSearch" />
            </el-form-item>

            <el-form-item label="报告编号" style="margin-right: 0;">
                <el-input v-model="queryForm.reportNo" placeholder="请输入" clearable style="width: 120px;" @keyup.enter.prevent="handleSearch" />
            </el-form-item>

            <el-form-item label="委托单号" style="margin-right: 0;">
                <el-input v-model="queryForm.orderNo" placeholder="请输入" clearable style="width: 120px;" @keyup.enter.prevent="handleSearch" />
            </el-form-item>

            <el-form-item label="创建时间" style="margin-right: 0;">
                <el-date-picker v-model="queryForm.dateRange"
                                type="daterange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                value-format="YYYY-MM-DD"
                                :shortcuts="dateShortcuts"
                                style="width: 240px;" />
            </el-form-item>

            <el-form-item label="状态" style="margin-right: 0;">
                <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 110px;">
                    <el-option label="编制中" value="draft" />
                    <el-option label="审核中" value="pending_review" />
                    <el-option label="批准中" value="pending_approval" />
                    <el-option label="已批准" value="approved" />
                    <el-option label="已驳回" value="rejected" />
                </el-select>
            </el-form-item>

            <el-form-item style="margin-right: 0;">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>
    </div>

    <!-- 操作栏 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
      <el-button
        v-permission="'report:add'"
        type="primary"
        @click="toAdd"
      >
        + 新增检测报告
      </el-button>
      <span>共 {{ total }} 条数据</span>
    </div>

    <!-- 表格：补充创建人/创建时间/修改人/修改时间 -->
    <el-table
      :data="tableData"
      border
      stripe
      :loading="loading"
      style="width: 100%;"
    >
      <el-table-column
        v-if="false"
        label="ID"
        prop="ID"
        width="80"
        align="center"
      />
      <el-table-column
        label="报告编号"
        prop="reportNo"
        min-width="160"
      />
      <el-table-column
        label="报检单号"
        prop="inspectionOrderNo"
        min-width="200"
      />
      <el-table-column
        label="样品名称"
        prop="sampleName"
        min-width="150"
      />
      <el-table-column
        label="委托单号"
        prop="orderNo"
        min-width="160"
      />
      <el-table-column
        label="所属厂区"
        prop="factoryName"
        min-width="120"
        align="center"
      />
      <el-table-column
        label="状态"
        prop="status"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="statusMap[row.status]?.type || 'info'"
            size="small"
          >
            {{ statusMap[row.status]?.label || row.status || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createName"
        min-width="120"
        align="center"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        min-width="180"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="修改人"
        prop="updateName"
        min-width="120"
        align="center"
      />
      <el-table-column
        label="修改时间"
        prop="updateTime"
        min-width="180"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDate(row.updateTime) }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="260"
        align="center"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-permission="'report:edit'"
            type="primary"
            size="small"
            @click="toEdit(scope.row.ID)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'report:view'"
            type="success"
            size="small"
            @click="toDetail(scope.row.ID)"
          >
            查看
          </el-button>
          <el-button
            v-if="scope.row?.status === 'draft' || scope.row?.status === 'rejected'"
            v-permission="'report:delete'"
            type="danger"
            size="small"
            @click="deleteReport(scope.row.ID)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="margin-top: 20px; text-align: right;">
      <el-pagination
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import axios from 'axios'
    import { useRouter, useRoute } from 'vue-router'  
    import { useListFilterStore } from '@/stores/listFilter'




    const router = useRouter()
    const route = useRoute() 

    const filterStore = useListFilterStore()
    const PAGE_KEY = 'ReportList'   // 用路由 name，保证唯一

    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)


    const dateShortcuts = [
        {
            text: '今天',
            value: () => {
                const today = new Date()
                return [today, today]
            }
        },
        {
            text: '近 7 天',
            value: () => {
                const end = new Date()
                const start = new Date()
                start.setDate(start.getDate() - 6)
                return [start, end]
            }
        },
        {
            text: '近 30 天',
            value: () => {
                const end = new Date()
                const start = new Date()
                start.setDate(start.getDate() - 29)
                return [start, end]
            }
        },
        {
            text: '本月',
            value: () => {
                const end = new Date()
                const start = new Date(end.getFullYear(), end.getMonth(), 1)
                return [start, end]
            }
        },
        {
            text: '上月',
            value: () => {
                const end = new Date()
                end.setDate(0)
                const start = new Date(end.getFullYear(), end.getMonth(), 1)
                return [start, end]
            }
        }
    ]



    // 从 URL 初始化
    const pageIndex = ref(Number(route.query.pageIndex) || 1)
    const pageSize = ref(Number(route.query.pageSize) || 10)
    const queryForm = ref({
        inspectionOrderNo: route.query.inspectionOrderNo || '',
        orderNo: route.query.orderNo || '',    
        reportNo: route.query.reportNo || '',
        factoryCode: route.query.factoryCode || '',
        status: route.query.status || '',
        dateRange: route.query.dateFrom && route.query.dateTo
            ? [route.query.dateFrom, route.query.dateTo]    
            : null
    })

    const statusMap = {
        draft: { label: '编制中', type: 'info' },
        pending_review: { label: '审核中', type: 'warning' },
        pending_approval: { label: '批准中', type: 'warning' },
        approved: { label: '已批准', type: 'success' },
        rejected: { label: '已驳回', type: 'danger' },
    }

    //  URL 同步
    // 同步到 URL（增加重复判断，防止触发 watch 循环）
    const syncQueryToUrl = () => {
        const newQuery = {
            inspectionOrderNo: queryForm.value.inspectionOrderNo || undefined,
            reportNo: queryForm.value.reportNo || undefined,
            orderNo: queryForm.value.orderNo || undefined,
            factoryCode: queryForm.value.factoryCode || undefined,
            status: queryForm.value.status || undefined,
            dateFrom: queryForm.value.dateRange?.[0] || undefined,
            dateTo: queryForm.value.dateRange?.[1] || undefined,
            pageIndex: pageIndex.value,
            pageSize: pageSize.value
        }
        // 简单比较，避免无意义 replace 触发 watch
        const current = route.query
        const isSame = Object.keys(newQuery).every(k => String(newQuery[k] ?? '') === String(current[k] ?? ''))
        if (!isSame) {
            router.replace({ path: route.path, query: newQuery }).catch(() => { })
        }
    }

    // 新增：把当前条件同步到 store
    const syncQueryToStore = () => {
        filterStore.setFilters(PAGE_KEY, {
            inspectionOrderNo: queryForm.value.inspectionOrderNo,
            orderNo: queryForm.value.orderNo, 
            reportNo: queryForm.value.reportNo,
            factoryCode: queryForm.value.factoryCode,
            status: queryForm.value.status,
            dateFrom: queryForm.value.dateRange?.[0] || '',                
            dateTo: queryForm.value.dateRange?.[1] || '',      
            pageIndex: pageIndex.value,
            pageSize: pageSize.value
        })
    }

    const buildListQuery = () => ({
        inspectionOrderNo: queryForm.value.inspectionOrderNo || undefined,
        orderNo: queryForm.value.orderNo || undefined, 
        reportNo: queryForm.value.reportNo || undefined,
        factoryCode: queryForm.value.factoryCode || undefined,
        status: queryForm.value.status || undefined,
        dateFrom: queryForm.value.dateRange?.[0] || undefined,
        dateTo: queryForm.value.dateRange?.[1] || undefined,
        pageIndex: pageIndex.value,
        pageSize: pageSize.value
    })

    // 时间格式化方法：兼容创建时间/修改时间
    const formatDate = (time) => {
        if (!time) return "-";
        return new Date(time).toLocaleString("zh-CN");
    };

    // 获取报告列表
    // 获取报告列表
    const getList = async () => {
        if (loading.value) return   // 防止并发
        loading.value = true
        try {
            const res = await axios.get('/api/DetectionReport/list', {
                params: buildListQuery()
            })
            if (res.data.Success) {
                tableData.value = res.data.Data.List
                total.value = res.data.Data.Total
                syncQueryToStore()   // 先存 store
                syncQueryToUrl()     // 再改 URL
            } else {
                ElMessage.error(res.data.Message)
            }
        } catch (err) {
            ElMessage.error('加载失败：' + (err.response?.data?.Message || err.message))
        } finally {
            loading.value = false
        }
    }

    const handleSearch = () => {
        pageIndex.value = 1
        getList()
    }

    //  新增
    const toAdd = () => {
        router.push({ name: 'ReportForm' })
    }

    const toEdit = (id) => {
        router.push({
            name: 'ReportEdit',
            params: { id },
            query: buildListQuery()                         // ← 加
        })
    }

    const toDetail = (id) => {
        router.push({
            name: 'ReportEdit',
            params: { id },
            query: { detail: '1', ...buildListQuery() }     // ← 加
        })
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
        if (loading.value) return // 正在请求，忽略
        pageSize.value = val
        pageIndex.value = 1 // 改变每页条数时，通常重置回第一页
        getList()
    }

    const handleCurrentChange = (val) => {
        if (loading.value) return // 正在请求，忽略
        pageIndex.value = val
        getList()
    }

    // 重置查询
    const resetQuery = () => {
        queryForm.value = { inspectionOrderNo: '', reportNo: '', orderNo: '', factoryCode: '', status: '', dateRange: null }
        pageIndex.value = 1
        pageSize.value = 10                    // ← 顺手也重置页大小，视产品习惯
        filterStore.clearFilters(PAGE_KEY)     // ← 关键：清掉 store
        syncQueryToUrl()
        getList()
    }

    // 🔥 核心：用 watch 统一处理初始化 + 请求，删掉 onMounted 里的 getList()
    watch(
        () => route.query,
        async (newQuery) => {
            // 新增：如果 URL 参数和当前表单完全一致，说明是自己 syncQueryToUrl 出去的，跳过
            const isSameAsForm =
                (newQuery.inspectionOrderNo || '') === (queryForm.value.inspectionOrderNo || '') &&
                (newQuery.reportNo || '') === (queryForm.value.reportNo || '') &&
                (newQuery.orderNo || '') === (queryForm.value.orderNo || '') &&
                (newQuery.factoryCode || '') === (queryForm.value.factoryCode || '') &&
                (newQuery.status || '') === (queryForm.value.status || '') &&
                (newQuery.dateFrom || '') === (queryForm.value.dateRange?.[0] || '') &&
                (newQuery.dateTo || '') === (queryForm.value.dateRange?.[1] || '') &&
                Number(newQuery.pageIndex || 1) === pageIndex.value &&
                Number(newQuery.pageSize || 10) === pageSize.value

            if (Object.keys(newQuery).length > 0 && isSameAsForm) {
                return   // 自己同步出去的，不再触发请求
            }
            // 1. 优先用 URL 参数初始化表单
            queryForm.value.inspectionOrderNo = newQuery.inspectionOrderNo || ''
            queryForm.value.reportNo = newQuery.reportNo || ''
            queryForm.value.orderNo = newQuery.orderNo || ''
            queryForm.value.factoryCode = newQuery.factoryCode || ''
            queryForm.value.status = newQuery.status || ''
            queryForm.value.dateRange = newQuery.dateFrom && newQuery.dateTo
                ? [newQuery.dateFrom, newQuery.dateTo]
                : null
            pageIndex.value = Number(newQuery.pageIndex) || 1
            pageSize.value = Number(newQuery.pageSize) || 10

            // 2. 如果 URL 没有任何筛选条件，尝试从 store 恢复
            const FILTER_KEYS = ['inspectionOrderNo', 'orderNo', 'reportNo', 'factoryCode', 'status']
            const hasFilterInUrl = FILTER_KEYS.some(k => newQuery[k])

            if (!hasFilterInUrl) {
                const saved = filterStore.getFilters(PAGE_KEY)
                if (saved && Object.keys(saved).length > 0) {
                    queryForm.value.inspectionOrderNo = saved.inspectionOrderNo || ''
                    queryForm.value.orderNo = saved.orderNo || ''
                    queryForm.value.reportNo = saved.reportNo || ''
                    queryForm.value.factoryCode = saved.factoryCode || ''
                    queryForm.value.status = saved.status || ''
                    queryForm.value.dateRange = saved.dateFrom && saved.dateTo
                        ? [saved.dateFrom, saved.dateTo]
                        : null
                    pageIndex.value = Number(saved.pageIndex) || 1
                    pageSize.value = Number(saved.pageSize) || 10
                    // 把恢复的条件写回 URL，保持一致性（会再次触发 watch，但此时已有筛选条件，不会走 store 分支）
                    getList() 
                    return   // 等 URL 更新后的 watch 再发请求
                }
            }

            // 3. 条件就绪，发请求
            getList()
        }
    )

    onMounted(() => {
        const FILTER_KEYS = ['inspectionOrderNo', 'orderNo', 'reportNo', 'factoryCode', 'status']
        const hasFilterInUrl = FILTER_KEYS.some(k => route.query[k])

        if (hasFilterInUrl) {
            // URL 优先，顺手写回 store
            filterStore.setFilters(PAGE_KEY, {
                inspectionOrderNo: queryForm.value.inspectionOrderNo,
                orderNo: queryForm.value.orderNo,
                reportNo: queryForm.value.reportNo,
                factoryCode: queryForm.value.factoryCode,
                status: queryForm.value.status,
                dateFrom: queryForm.value.dateRange?.[0] || '',
                dateTo: queryForm.value.dateRange?.[1] || '',
                pageIndex: pageIndex.value,
                pageSize: pageSize.value
            })
        } else {
            // 从 store 恢复
            const saved = filterStore.getFilters(PAGE_KEY)
            if (saved && Object.keys(saved).length > 0) {
                queryForm.value.inspectionOrderNo = saved.inspectionOrderNo || ''
                queryForm.value.orderNo = saved.orderNo || ''
                queryForm.value.reportNo = saved.reportNo || ''
                queryForm.value.factoryCode = saved.factoryCode || ''
                queryForm.value.status = saved.status || ''
                queryForm.value.dateRange = saved.dateFrom && saved.dateTo
                    ? [saved.dateFrom, saved.dateTo]
                    : null
                pageIndex.value = Number(saved.pageIndex) || 1
                pageSize.value = Number(saved.pageSize) || 10
            }
        }

        getList()   // ← 关键：首次请求放这里
    })
</script>

<style scoped>
    .compact-form :deep(.el-form-item) {
        margin-right: 8px !important; /* 32 → 8 */
        margin-bottom: 0 !important; /* 18 → 0 */
    }
</style>