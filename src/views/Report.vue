<template>
    <div style="padding: 20px; background: #fff; height: 100%;">
        <h2 style="text-align: center; margin-bottom: 20px;">检测报告页面（后续完善）</h2>
        <el-card>
            <el-alert title="提示"
                      type="info"
                      description="该页面将基于动态列配置的模板，加载检测数据并生成报告"
                      show-icon />
        </el-card>
    </div>
</template>

<!-- 普通 script：定义组件名（兼容所有 Vue 3 版本） -->
<script>
    export default {
        name: 'DetectionReport' // 改为多词格式，解决 ESLint 报错
    }
</script>

<!-- script setup：写你的业务逻辑（如果有的话） -->
<script setup>
    // 这里放后续的逻辑代码
</script>