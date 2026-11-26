<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
    // App.vue 只作为路由出口
</script>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html,
    body {
        height: 100%;
    }

    #app {
        height: 100%;
    }
</style>