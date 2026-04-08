const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,

    devServer: {
        port: 8081,   // 强制端口 8081
        proxy: {
            '/api': {
                target: 'http://localhost:5241',
                changeOrigin: true,
                pathRewrite: { '^/api': '/api' }
            }
        }
    },

    // 中文编码不乱码
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions = {
                    ...options.compilerOptions,
                    charset: 'utf-8'
                }
                return options
            })
    }
})