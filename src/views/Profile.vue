<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600;">个人中心</span>
        </div>
      </template>

      <!-- 用户信息 -->
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="用户名">
          {{ userName || '未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          {{ realName || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 签名管理 -->
      <div style="margin-top: 30px;">
        <h4 style="margin-bottom: 15px;">
          电子签名
        </h4>
        <div class="signature-area">
          <div class="signature-preview">
            <img
              v-if="signatureUrl"
              :src="convertImageUrl(signatureUrl)"
              alt="签名"
            >
            <div
              v-else
              class="placeholder"
            >
              <el-icon><Picture /></el-icon>
              <span>未上传签名</span>
            </div>
          </div>
          <div class="signature-actions">
            <el-button
              type="primary"
              @click="uploadSignature"
            >
              上传签名
            </el-button>
            <el-button
              v-if="signatureUrl"
              type="danger"
              @click="deleteSignature"
            >
              删除签名
            </el-button>
            <el-button
              v-if="signatureUrl"
              type="success"
              plain
              @click="previewSignature"
            >
              预览
            </el-button>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #999;">
          支持 PNG、JPG 格式，建议使用透明背景 PNG，大小不超过 2MB
        </div>
      </div>

      <!-- 账户安全 -->
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <h4 style="margin-bottom: 15px;">
          账户安全
        </h4>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <el-button
            type="primary"
            plain
            @click="showChangePassword = true"
          >
            修改密码
          </el-button>
          <el-button
            type="danger"
            plain
            @click="handleLogout"
          >
            退出登录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="签名预览"
      width="400px"
    >
      <div style="text-align: center; padding: 20px;">
        <img
          :src="convertImageUrl(signatureUrl)"
          style="max-width: 100%; max-height: 300px;"
        >
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showChangePassword"
      title="修改密码"
      width="450px"
    >
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="80px"
      >
        <el-form-item
          label="旧密码"
          prop="oldPassword"
        >
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item
          label="新密码"
          prop="newPassword"
        >
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码（至少6位）"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirmPassword"
        >
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="pwdSubmitting"
          @click="changePassword"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { Picture } from '@element-plus/icons-vue'
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/user'

    const router = useRouter()
    const userStore = useUserStore()

    // 从 store 获取用户信息（使用 getter）
    const userId = computed(() => userStore.userId)
    const userName = computed(() => userStore.userName)
    const realName = computed(() => userStore.realName)

    // 签名相关
    const signatureUrl = ref('')
    const previewVisible = ref(false)

    // 修改密码相关
    const showChangePassword = ref(false)
    const pwdSubmitting = ref(false)
    const pwdFormRef = ref()
    const pwdForm = ref({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const pwdRules = {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, message: '密码至少6位', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '请确认新密码', trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    if (value !== pwdForm.value.newPassword) {
                        callback(new Error('两次输入密码不一致'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur'
            }
        ]
    }

    // 加载签名（后端从 Token 自动获取 UserId）
async function loadSignature() {
    try {
        const res = await axios.get('/api/user/signature')  // ✅ 不再传 params
        if (res.data.success && res.data.data) {
            signatureUrl.value = res.data.data.signatureUrl
        }
    } catch (err) {
        console.error('加载签名失败', err)
    }
}

    // 上传签名（后端从 Token 自动获取 UserId）
function uploadSignature() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/gif,image/svg+xml'
    input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            ElMessage.error('图片大小不能超过 2MB')
            return
        }

        const formData = new FormData()
        // ✅ 不再 append userId
        formData.append('file', file)

        try {
            const res = await axios.post('/api/user/signature/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (res.data.success) {
                signatureUrl.value = res.data.data.signatureUrl
                ElMessage.success(res.data.message)
            } else {
                ElMessage.error(res.data.message)
            }
        } catch (err) {
            ElMessage.error('上传失败，请重试')
            console.error(err)
        }
    }
    input.click()
}

// 删除签名（后端从 Token 自动获取 UserId）
async function deleteSignature() {
    try {
        await ElMessageBox.confirm('确定要删除签名吗？', '确认删除', { type: 'warning' })
        const res = await axios.delete('/api/user/signature')  // ✅ 不再传 params
        if (res.data.success) {
            signatureUrl.value = ''
            ElMessage.success(res.data.message)
        } else {
            ElMessage.error(res.data.message)
        }
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

    // 预览签名
    function previewSignature() {
        if (signatureUrl.value) {
            previewVisible.value = true
        }
    }

    // 修改密码（使用 userId）
    async function changePassword() {
        await pwdFormRef.value?.validate()
        pwdSubmitting.value = true
        try {
            const res = await axios.put('/api/user/password', {
                oldPassword: pwdForm.value.oldPassword,
                newPassword: pwdForm.value.newPassword
            })
            if (res.data.success) {
                ElMessage.success('密码修改成功，请重新登录')
                showChangePassword.value = false
                userStore.logout()
                router.push('/login')
            } else {
                ElMessage.error(res.data.message || '修改失败')
            }
        } catch (err) {
            ElMessage.error('请求失败，请重试')
            console.error(err)
        } finally {
            pwdSubmitting.value = false
        }
    }

    // 退出登录
    function handleLogout() {
        ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
            .then(() => {
                userStore.logout()
                router.push('/login')
                ElMessage.success('已退出')
            })
            .catch(() => { })
    }

    // 转换图片 URL（根据后端实际路径调整）
    function convertImageUrl(url) {
        if (!url) return ''
        if (url.includes('/api/upload/image/')) {
            return url.replace('/api/upload/image/', '/uploads/')
        }
        if (url.startsWith('http')) return url
        return url
    }

    onMounted(() => {
        // 如果用户已登录，加载签名
        if (userId.value) {
            loadSignature()
        }
    })
</script>

<style scoped>
    .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .signature-area {
        display: flex;
        align-items: center;
        gap: 30px;
        flex-wrap: wrap;
    }

    .signature-preview {
        width: 200px;
        height: 100px;
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        overflow: hidden;
    }

        .signature-preview img {
            max-height: 80px;
            max-width: 100%;
            object-fit: contain;
        }

        .signature-preview .placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #bfbfbf;
            font-size: 13px;
        }

            .signature-preview .placeholder .el-icon {
                font-size: 32px;
                margin-bottom: 4px;
            }

    .signature-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
</style>