// 用于存放所有生产环境下的 Babel 插件
const productionPlugins = []

// 判断如果是生产环境，则将清除 console 的插件添加进数组
if (process.env.NODE_ENV === 'production') {
    productionPlugins.push([
        'transform-remove-console',
        {
            // 通过 exclude 选项，保留 error 和 warn，只移除其他 console 方法
            exclude: ['error', 'warn']
        }
    ])
}

module.exports = {
    presets: [
        // 这个是 Vue CLI 项目默认的预设，请保留它
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        // 这里是你的 Babel 插件列表，展开我们的 productionPlugins 数组
        ...productionPlugins
    ]
}