<!-- eslint-disable vue/multi-word-component-names -->
<!-- src/views/Forbidden.vue -->
<template>
  <div class="forbidden-container">
    <el-result
      icon="warning"
      title="403"
      sub-title="您没有权限访问该页面"
    >
      <template #extra>
        <el-button
          type="primary"
          @click="goBack"
        >
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
    import { useRouter } from 'vue-router'
    const router = useRouter()
    function goBack() {
        router.push('/')
    }
</script>

<style scoped>
    .forbidden-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #f5f7fa;
    }
</style>