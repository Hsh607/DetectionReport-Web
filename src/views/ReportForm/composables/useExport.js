import { ref } from 'vue'
import { Document, Packer, Paragraph, AlignmentType, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'

export function useExport() {
    const exportLoading = ref(false)

    async function exportToWord(testProjects) {
        exportLoading.value = true
        try {
            const children = []
            children.push(new Paragraph({
                text: '检测报告',
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                run: { bold: true, fontSize: 28 }
            }))

            for (const project of testProjects) {
                if (!project?.schemeConfig) continue
                children.push(new Paragraph({
                    text: project.schemeConfig.ProjectTitle || '检测项目',
                    spacing: { after: 200 },
                    run: { bold: true, fontSize: 24 }
                }))
                children.push(new Paragraph({
                    text: `检测依据：${project.reportData.testReference || ''}`,
                    spacing: { after: 200 }
                }))

                if (project.reportData.photoRows?.length) {
                    children.push(new Paragraph({
                        text: '试验照片',
                        spacing: { before: 200, after: 200 },
                        run: { bold: true }
                    }))
                    for (const r of project.reportData.photoRows) {
                        if (r.LeftUrl) {
                            const buf = await fetch(r.LeftUrl).then(x => x.arrayBuffer())
                            children.push(new Paragraph({
                                children: [new ImageRun({ data: buf, transformation: { width: 350 } })],
                                alignment: AlignmentType.CENTER
                            }))
                            children.push(new Paragraph({
                                text: r.LeftDesc || '无描述',
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 100 }
                            }))
                        }
                        if (r.RightUrl) {
                            const buf = await fetch(r.RightUrl).then(x => x.arrayBuffer())
                            children.push(new Paragraph({
                                children: [new ImageRun({ data: buf, transformation: { width: 350 } })],
                                alignment: AlignmentType.CENTER
                            }))
                            children.push(new Paragraph({
                                text: r.RightDesc || '无描述',
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 200 }
                            }))
                        }
                    }
                }
            }

            const doc = new Document({ sections: [{ properties: {}, children }] })
            const blob = await Packer.toBlob(doc)
            saveAs(blob, `检测报告_${new Date().toISOString().split('T')[0]}.docx`)
            ElMessage.success('导出成功')
        } catch (e) {
            console.error(e)
            ElMessage.error('导出失败')
        } finally {
            exportLoading.value = false
        }
    }

    return { exportLoading, exportToWord }
}