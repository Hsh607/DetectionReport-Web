<template>
  <div class="task-container">
    <h2>待办事项</h2>

    <el-tabs v-model="activeTab">
      <el-tab-pane
        label="待审核"
        name="review"
      >
        <el-table
          v-loading="reviewLoading"
          :data="reviewList"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="ReportNo"
            label="报告编号"
            min-width="180"
          />
          <el-table-column
            label="项目名称"
            min-width="150"
          >
            <template #default="{ row }">
              <span>{{ row.ProjectName || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="SubmittedAt"
            label="提交时间"
            min-width="180"
          >
            <template #default="{ row }">
              <span>{{ formatDate(row.SubmittedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="goToDetail(row.ReportId, 'review')"
              >
                去审核
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div style="padding: 40px 0; color: #999;">
              暂无待审核报告
            </div>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="待批准"
        name="approval"
      >
        <el-table
          v-loading="approvalLoading"
          :data="approvalList"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="ReportNo"
            label="报告编号"
            min-width="180"
          />
          <el-table-column
            label="项目名称"
            min-width="150"
          >
            <template #default="{ row }">
              <span>{{ row.ProjectName || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="SubmittedAt"
            label="提交时间"
            min-width="180"
          >
            <template #default="{ row }">
              <span>{{ formatDate(row.submittedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="success"
                size="small"
                @click="goToDetail(row.ReportId, 'approval')"
              >
                去批准
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div style="padding: 40px 0; color: #999;">
              暂无待批准报告
            </div>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="待修改"
        name="edit"
      >
        <el-table
          v-loading="editLoading"
          :data="editList"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="ReportNo"
            label="报告编号"
            min-width="180"
          />
          <el-table-column
            label="驳回原因"
            min-width="300"
          >
            <template #default="{ row }">
              <span style="color: #f56c6c;">{{ row.RejectedReason || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="SubmittedAt"
            label="驳回时间"
            min-width="180"
          >
            <template #default="{ row }">
              <span>{{ formatDate(row.SubmittedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="warning"
                size="small"
                @click="goToEdit(row.ReportId)"
              >
                去修改
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div style="padding: 40px 0; color: #999;">
              暂无被驳回的报告
            </div>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="我提交的"
        name="mine"
      >
        <el-table
          v-loading="mineLoading"
          :data="mineList"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="ReportNo"
            label="报告编号"
            min-width="180"
          />
          <el-table-column
            label="项目名称"
            min-width="200"
          >
            <template #default="{ row }">
              <span>{{ row.ProjectName || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="120"
          >
            <template #default="{ row }">
              <el-tag
                :type="statusTagType(row.Status)"
                size="small"
              >
                {{ statusLabel(row.Status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="SubmittedAt"
            label="更新时间"
            min-width="180"
          >
            <template #default="{ row }">
              <span>{{ formatDate(row.SubmittedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="160"
            fixed="right"
          >
            <template #default="{ row }">
              <!-- 被驳回：去修改 -->
              <el-button
                v-if="row.Status === 'rejected'"
                type="warning"
                size="small"
                @click="goToEdit(row.ReportId)"
              >
                去修改
              </el-button>
              <!-- 已批准：查看 -->
              <el-button
                v-else-if="row.Status === 'approved'"
                type="success"
                size="small"
                @click="goToView(row.ReportId)"
              >
                查看
              </el-button>
              <!-- 待审核/待批准：查看进度 -->
              <el-button
                v-else
                type="primary"
                size="small"
                @click="goToView(row.ReportId)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div style="padding: 40px 0; color: #999;">
              暂无提交的报告
            </div>
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import axios from 'axios'
    import dayjs from 'dayjs'
    import { useUserStore } from '@/stores/user'

    const router = useRouter()

    // 状态
    const activeTab = ref('review')
    const reviewList = ref([])
    const approvalList = ref([])
    const reviewLoading = ref(false)
    const approvalLoading = ref(false)

    const editList = ref([])
    const editLoading = ref(false)

    const mineList = ref([])
    const mineLoading = ref(false)

    const loadEditList = async () => {
        if (editLoading.value) return
        editLoading.value = true
        try {
            const res = await axios.get('/api/Approval/PendingEdit')
            if (res.data.Success) {
                editList.value = res.data.Data || []
            }
        } catch (err) {
            console.error('加载待修改列表失败', err)
        } finally {
            editLoading.value = false
        }
    }

    const goToEdit = (reportId) => {
        if (!reportId) return
        router.push(`/report/edit/${reportId}`)
    }

    const loadMineList = async () => {
        if (mineLoading.value) return
        mineLoading.value = true
        try {
            const res = await axios.get('/api/Approval/MySubmitted')
            if (res.data.Success) {
                mineList.value = res.data.Data || []
            }
        } catch (err) {
            console.error('加载我提交的列表失败', err)
        } finally {
            mineLoading.value = false
        }
    }

    // 状态标签文案
    const statusLabel = (s) => {
        const map = {
            'draft': '草稿',
            'pending_review': '待审核',
            'pending_approval': '待批准',
            'approved': '已批准',
            'rejected': '已驳回'
        }
        return map[s] || s || '--'
    }

    // 状态标签颜色
    const statusTagType = (s) => {
        const map = {
            'draft': 'info',
            'pending_review': 'warning',
            'pending_approval': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        }
        return map[s] || 'info'
    }

    // 查看（详情页）
    const goToView = (reportId) => {
        if (!reportId) return
        router.push({
            path: `/report/detail/${reportId}`,
            query: { detail: '1' }
        })
    }

    // 格式化时间
    const formatDate = (dateStr) => {
        if (!dateStr) return '--'
        return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
    }

    // 加载待审核列表
    const loadReviewList = async () => {
        if (reviewLoading.value) return
        reviewLoading.value = true
        try {
            const res = await axios.get('/api/Approval/PendingReview')
            if (res.data.Success) {
                reviewList.value = res.data.Data || []
            } else {
                ElMessage.error(res.data.Message || '加载待审核列表失败')
            }
        } catch (err) {
            console.error('加载待审核列表失败', err)
            ElMessage.error('加载待审核列表失败，请重试')
        } finally {
            reviewLoading.value = false
        }
    }

    // 加载待批准列表
    const loadApprovalList = async () => {
        if (approvalLoading.value) return
        approvalLoading.value = true
        try {
            const res = await axios.get('/api/Approval/PendingApproval')
            if (res.data.Success) {
                approvalList.value = res.data.Data || []
            } else {
                ElMessage.error(res.data.Message || '加载待批准列表失败')
            }
        } catch (err) {
            console.error('加载待批准列表失败', err)
            ElMessage.error('加载待批准列表失败，请重试')
        } finally {
            approvalLoading.value = false
        }
    }

    watch(activeTab, (newVal) => {
        console.log('activeTab 变化:', newVal)
        if (newVal === 'review') {
            loadReviewList()
        } else if (newVal === 'approval') {
            loadApprovalList()
        } else if (newVal === 'edit') {
            loadEditList()
        } else if (newVal === 'mine') {
            loadMineList()
        }
    })

    // 跳转到报告详情页
const goToDetail = (reportId, mode) => {
    console.log('报告ID:', reportId)
    if (!reportId) {
        ElMessage.error('报告ID不存在')
        return
    }
    router.push({
        path: `/report/detail/${reportId}`,
        query: { mode, task: 'true' }
    })
}

    // 初始化加载
    onMounted(() => {
        loadReviewList()
        const userStore = useUserStore()
        console.log('用户权限列表:', userStore.permissions)
    })
</script>

<style scoped>
    .task-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

        .task-container h2 {
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 600;
            color: #333;
        }

    .el-tabs {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    }
</style>