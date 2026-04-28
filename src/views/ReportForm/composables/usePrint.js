import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { generatePrintHTML } from '../utils/printHelper'

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
        } catch (err) { return '' }
    }
    return url
}

export function usePrint() {
    const printLoading = ref(false)

    async function printPreview(homeForm, fixedForm, testProjects, isCNAS = false, watermarkText = '检测报告') {
        if (printLoading.value) return
        printLoading.value = true

        try {
            const projectsCopy = JSON.parse(JSON.stringify(testProjects))
            const photoPromises = []
            for (const project of projectsCopy) {
                const rows = project.reportData?.photoRows
                if (rows) {
                    rows.forEach(row => {
                        row.LeftUrl && photoPromises.push(urlToDataURL(row.LeftUrl))
                        row.RightUrl && photoPromises.push(urlToDataURL(row.RightUrl))
                    })
                }
            }
            await Promise.all(photoPromises)

            const html = generatePrintHTML(homeForm, fixedForm, projectsCopy, watermarkText, isCNAS)

            // ✅ 直接访问后端预览接口，云表自动显示
            const url = `/api/DetectionReport/PreviewPdfInline`
            const form = document.createElement('form')
            form.method = 'POST'
            form.target = '_blank'
            form.action = url
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'HtmlContent'
            input.value = html
            form.appendChild(input)
            document.body.appendChild(form)
            form.submit()
            document.body.removeChild(form)

        } catch (err) {
            ElMessage.error('预览失败')
        } finally {
            printLoading.value = false
        }
    }

    return {
        printLoading,
        printPreview
    }
}