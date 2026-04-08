import axios from 'axios'

// 基础路径（后端接口地址）
const baseUrl = 'http://localhost:5241/api/ColumnConfig'

// 动态列配置CRUD接口
export const columnConfigApi = {
    // 获取所有列配置
    getAll: () => axios.get(baseUrl),
    // 新增列配置
    add: (data) => axios.post(baseUrl, data),
    // 修改列配置
    update: (id, data) => axios.put(`${baseUrl}/${id}`, data),
    // 删除列配置
    delete: (id) => axios.delete(`${baseUrl}/${id}`),
    // 按ID查询
    getById: (id) => axios.get(`${baseUrl}/${id}`)
}