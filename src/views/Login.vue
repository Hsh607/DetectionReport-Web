<template>
  <div
    class="login-container"
    :style="{ backgroundImage: `url('/lab-background.jpg')` }"
  >
    <div class="login-box">
      <div class="login-header">
        <img
          src="/logo.png"
          alt="诺码实验室"
          class="login-logo"
        >
        <h1>诺码科技 · 解决方案</h1>
        <p class="subtitle">
          NORMAL TECHNOLOGY  · Solution
        </p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="form.userName"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="rememberMe">
              记住密码
            </el-checkbox>
            <el-link
              type="primary"
              :underline="false"
              @click="handleForgotPassword"
            >
              忘记密码？
            </el-link>
          </div>
        </el-form-item>
        <el-form-item class="login-btn-item">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <p class="intranet-tip">
        🔒 内网专用 · 请勿在非信任网络下访问
      </p>
    </div>
  </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import { useUserStore } from '@/stores/user'
    import { ElMessageBox } from 'element-plus'   


    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const loading = ref(false)
    const formRef = ref()
    const rememberMe = ref(false)

    const form = reactive({
        userName: '',
        password: ''
    })

    const rules = {
        userName: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 4, max: 20, message: '密码长度 4-20 个字符', trigger: 'blur' }
        ]
    }

    function handleForgotPassword() {
        ElMessageBox.alert(
            '请联系系统管理员重置密码。\n\n' +
            '管理员重置后会给你一个临时密码，\n' +
            '登录后请立即修改为自己的密码。',
            '忘记密码',
            {
                confirmButtonText: '我知道了',
                type: 'info',
                customClass: 'forgot-pwd-dialog'
            }
        )
    }

    // 加载记住的密码
    onMounted(() => {
        const saved = localStorage.getItem('rememberedUser')
        if (saved) {
            try {
                const data = JSON.parse(saved)
                form.userName = data.userName || ''
                form.password = data.password || ''
                rememberMe.value = true
            } catch {
                // ignore
            }
        }
    })

    async function handleLogin() {
        try {
            await formRef.value?.validate()
        } catch {
            return
        }

        loading.value = true
        try {
            await userStore.login(form)

            // 记住密码
            if (rememberMe.value) {
                localStorage.setItem('rememberedUser', JSON.stringify({
                    userName: form.userName,
                    password: form.password
                }))
            } else {
                localStorage.removeItem('rememberedUser')
            }

            ElMessage.success('登录成功')
            const redirect = route.query.redirect || '/'
            router.push(redirect)
        } catch (error) {
            ElMessage.error(error.message || '登录失败，请检查用户名和密码')
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    .login-container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        /* ✅ 使用 lab-background.jpg 作为背景图 */
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
    }

        /* ✅ 深色半透明遮罩，提高登录框可读性 */
        .login-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.35);
            z-index: 0;
        }

    .login-box {
        width: 420px;
        padding: 44px 36px 36px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        position: relative;
        z-index: 1;
        backdrop-filter: blur(4px);
    }

    .login-header {
        text-align: center;
        margin-bottom: 32px;
    }

    .login-logo {
        height: 52px;
        margin-bottom: 12px;
    }

    .login-header h1 {
        font-size: 22px;
        color: #1a1a2e;
        margin: 0 0 4px 0;
        font-weight: 600;
        letter-spacing: 1px;
    }

    .login-header .subtitle {
        color: #999;
        font-size: 13px;
        margin: 0;
        letter-spacing: 0.5px;
    }

    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 14px;
    }

    /* 登录按钮容器居中 */
    .login-btn-item {
        margin-top: 4px;
    }

        .login-btn-item :deep(.el-form-item__content) {
            justify-content: center;
        }

    .login-btn {
        width: 80%;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 4px;
        display: block;
        margin: 0 auto;
    }

    .login-box :deep(.el-input__wrapper) {
        height: 44px;
    }

    .login-box :deep(.el-button--primary) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
    }

    .login-box :deep(.el-button--primary:hover) {
        opacity: 0.9;
    }

    .login-box :deep(.el-button--primary:active) {
        opacity: 0.8;
    }
</style>