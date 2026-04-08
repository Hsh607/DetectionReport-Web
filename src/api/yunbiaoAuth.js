import axios from 'axios'
import { ElMessage } from 'element-plus'

// 只调用自己的后端，完全不碰云表密钥！
export async function getInspectionList() {
    try {
        // 🔥 不传任何参数！！！
        const res = await axios.post('/api/yunbiao/inspection-list')

        return {
            total: res.data?.Total || 0,
            list: res.data?.List || []
        }
    } catch (err) {
        console.error('查询报检单失败：', err)
        ElMessage.error('获取报检数据失败')
        return { total: 0, list: [] }
    }
}
