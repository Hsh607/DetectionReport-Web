module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
        'vue/setup-compiler-macros': true
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended'
    ],
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
    },
    rules: {
        'no-redeclare': 'off',
        'no-unused-vars': 'warn',     // 保留未使用变量警告，但只警告不阻止编译
        'vue/multi-word-component-names': 'off',  // 已关闭
        'vue/no-unused-components': 'off',        // 关闭组件未使用警告
        'vue/no-unused-vars': 'off',              // 关闭 Vue 模板中未使用变量警告
        'vue/valid-template-root': 'off',         // 关闭模板根元素检查
        'no-console': 'off',                      // 允许 console.log
        'no-debugger': 'off'
    }
}