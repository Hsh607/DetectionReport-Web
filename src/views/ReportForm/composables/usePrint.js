import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { generatePrintHTML } from '../utils/printHelper'

// 图片链接转DataURL（保持不变）
async function urlToDataURL(url) {
    if (!url) return ''
    if (url.startsWith('blob:')) {
        try {
            const blob = await fetch(url).then(r => r.blob())
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.readAsDataURL(blob)
            })
        } catch (err) {
            console.warn('转换 blob 失败', url, err)
            return ''
        }
    }
    return url
}

export function usePrint() {
    const printLoading = ref(false)
    let previewModal = null
    let previewIframe = null

    // 【核心】清理预览DOM + 重置变量
    const cleanupPreview = () => {
        try {
            if (previewIframe?.parentNode) previewIframe.parentNode.removeChild(previewIframe)
            if (previewModal?.parentNode) previewModal.parentNode.removeChild(previewModal)
        } catch (e) {
            console.debug('清理预览异常', e)
        } finally {
            previewIframe = null
            previewModal = null
            window.focus()
        }
    }

    // 【核心】监听预览页发送的关闭消息（修复关闭不生效）
    const handlePrintMessage = (event) => {
        if (event.data === 'closePrintPreview') cleanupPreview()
    }

    // 挂载监听
    window.addEventListener('message', handlePrintMessage)
    // 卸载时移除监听，防止内存泄漏
    onUnmounted(() => {
        window.removeEventListener('message', handlePrintMessage)
    })

    // 打印预览主函数
    async function printPreview(homeForm, fixedForm, testProjects) {
        printLoading.value = true
        cleanupPreview() // 先清理旧预览

        try {
            // 深拷贝处理图片
            const projectsCopy = JSON.parse(JSON.stringify(testProjects))
            const photoPromises = []

            for (const project of projectsCopy) {
                const rows = project.reportData?.photoRows
                if (rows) {
                    rows.forEach(row => {
                        row.LeftUrl && photoPromises.push(urlToDataURL(row.LeftUrl).then(data => row.LeftDataURL = data))
                        row.RightUrl && photoPromises.push(urlToDataURL(row.RightUrl).then(data => row.RightDataURL = data))
                    })
                }
            }
            await Promise.all(photoPromises)

            // 生成预览HTML
            const html = generatePrintHTML(homeForm, fixedForm, projectsCopy)

            // 1. 创建全屏遮罩
            previewModal = document.createElement('div')
            previewModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); z-index: 9999;
                display: flex; justify-content: center; padding: 20px;
                cursor: pointer;
            `

            // 2. 创建A4尺寸预览iframe（添加唯一class，方便识别）
            previewIframe = document.createElement('iframe')
            previewIframe.className = 'print-preview-iframe' // 唯一标识
            previewIframe.style.cssText = `
                width: 794px; height: 100%; background: #fff; border: none;
                box-shadow: 0 0 15px rgba(0,0,0,0.3); overflow-y: auto;
                cursor: default;
            `

            // 组装DOM
            previewModal.appendChild(previewIframe)
            document.body.appendChild(previewModal)

            // 写入预览内容
            const iDoc = previewIframe.contentWindow.document
            iDoc.open()
            iDoc.write(html)
            iDoc.close()

            // 点击遮罩空白处 → 关闭预览
            previewModal.onclick = (e) => e.target === previewModal && cleanupPreview()

        } catch (err) {
            console.error('打印预览失败', err)
            ElMessage.error('打印预览失败：' + (err.message || '未知错误'))
        } finally {
            printLoading.value = false
        }
    }

    return {
        printLoading,
        printPreview
    }
}