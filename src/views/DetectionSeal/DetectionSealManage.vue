<template>
  <div class="seal-page">
    <!-- 筛选栏 -->
    <el-card shadow="never" style="margin-bottom: 12px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <span>厂区：</span>
        <el-select v-model="query.factoryCode" placeholder="全部" clearable style="width: 140px;">
          <el-option label="通用 (*)" value="*" />
          <el-option label="SZNM" value="SZNM" />
          <el-option label="JANM" value="JANM" />
          <el-option label="XCNM" value="XCNM" />
        </el-select>

        <span>类型：</span>
        <el-select v-model="query.sealType" placeholder="全部" clearable style="width: 140px;">
          <el-option label="CNAS" value="CNAS" />
          <el-option label="普通" value="Normal" />
        </el-select>

        <span>状态：</span>
        <el-select v-model="query.isEnabled" placeholder="全部" clearable style="width: 120px;">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>

        <el-input v-model="query.keyword" placeholder="按名称搜索" clearable style="width: 200px;" />

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div style="flex: 1;"></div>
        <el-button type="primary" @click="handleCreate">+ 新增检测章</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="Name" label="名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="厂区" width="100" align="center">
            <template #default="{ row }">
                {{ row.FactoryCode === '*' ? '通用' : row.FactoryCode }}
            </template>
        </el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
              <el-tag :type="row.SealType === 'CNAS' ? 'success' : 'info'">
                  {{ row.SealType === 'CNAS' ? 'CNAS' : '普通' }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <el-image v-if="row.ImageUrl" :src="convertImageUrl(row.ImageUrl)"
                      style="width: 80px; height: 60px;"
                      fit="contain" :preview-src-list="[convertImageUrl(row.ImageUrl)]" />
            <span v-else style="color: #999;">未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
              <el-tag :type="row.IsEnabled ? 'success' : 'danger'">
                  {{ row.IsEnabled ? '启用' : '禁用' }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="UpdateName" label="最后修改人" width="110" align="center" />
        <el-table-column label="最后修改时间" width="170" align="center">
            <template #default="{ row }">
                {{ formatTime(row.UpdateTime || row.CreateTime) }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" link v-if="!row.IsEnabled"
                       @click="handleToggle(row)">启用</el-button>
            <el-button size="small" type="warning" link v-else
                       @click="handleToggle(row)">禁用</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; text-align: right;"
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        v-model:current-page="query.pageIndex"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="loadList"
        @size-change="loadList"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑检测章' : '新增检测章'" width="520px" @close="resetForm">
      <el-form :model="form" label-width="90px" ref="formRef">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="如：诺码CNAS检测专用章" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="厂区" required>
          <el-select v-model="form.factoryCode" placeholder="请选择" style="width: 100%;">
            <el-option label="通用 (*)" value="*" />
            <el-option label="SZNM" value="SZNM" />
            <el-option label="JANM" value="JANM" />
            <el-option label="XCNM" value="XCNM" />
          </el-select>
        </el-form-item>

        <el-form-item label="类型" required>
          <el-radio-group v-model="form.sealType">
            <el-radio label="CNAS">CNAS</el-radio>
            <el-radio label="Normal">普通</el-radio>
          </el-radio-group>
        </el-form-item>

<el-form-item label="图片" required>
  <div>
    <!-- 新增模式：显示上传入口 -->
    <template v-if="!form.id">
      <input ref="fileInputRef" type="file" accept="image/*" style="display: none"
             @change="handleFileChange" />
      <el-button type="primary" plain size="small" @click="triggerUpload">
        {{ form.imageUrl ? '重新上传' : '上传图片' }}
      </el-button>
    </template>

    <!-- 编辑模式：提示不可改 -->
    <div v-else style="font-size: 12px; color: #999; margin-bottom: 8px;">
      图片不可修改，如需更换请新增一条检测章
    </div>

    <!-- 图片预览 -->
    <div v-if="form.imageUrl" style="margin-top: 8px;">
      <el-image :src="convertImageUrl(form.imageUrl)"
                style="width: 140px; height: 100px; border: 1px solid #eee;"
                fit="contain" />
    </div>
    <div style="font-size: 12px; color: #999; margin-top: 4px;">
      建议 PNG 透明底，尺寸 300x300 以内
    </div>
  </div>
</el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  factoryCode: '',
  sealType: '',
  isEnabled: null,
  keyword: '',
  pageIndex: 1,
  pageSize: 20
})

const dialogVisible = ref(false)
const formRef = ref(null)
const fileInputRef = ref(null)

const form = reactive({
  id: 0,
  name: '',
  factoryCode: '*',
  sealType: 'CNAS',
  imageUrl: '',
  remark: ''
})

// 图片URL转换（兼容旧格式）
function convertImageUrl(url) {
  if (!url) return ''
  if (url.includes('/api/upload/image/')) {
    return url.replace('/api/upload/image/', '/uploads/')
  }
  return url
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadList() {
  loading.value = true
  try {
    const res = await axios.get('/api/DetectionSeal/list', {
      params: {
        factoryCode: query.factoryCode || undefined,
        sealType: query.sealType || undefined,
        isEnabled: query.isEnabled,
        keyword: query.keyword || undefined,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize
      }
    })
    if (res.data.Success) {
      list.value = res.data.Data || []
      total.value = res.data.Total || 0
    }
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageIndex = 1
  loadList()
}

function handleReset() {
  query.factoryCode = ''
  query.sealType = ''
  query.isEnabled = null
  query.keyword = ''
  query.pageIndex = 1
  loadList()
}

function handleCreate() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
    form.id = row.Id
    form.name = row.Name
    form.factoryCode = row.FactoryCode
    form.sealType = row.SealType
    form.imageUrl = row.ImageUrl
    form.remark = row.Remark
  dialogVisible.value = true
}

function resetForm() {
  form.id = 0
  form.name = ''
  form.factoryCode = '*'
  form.sealType = 'CNAS'
  form.imageUrl = ''
  form.remark = ''
}

function triggerUpload() {
  if (form.id) {
    ElMessage.warning('编辑模式下不能修改图片，请新增一条检测章')
    return
  }
  fileInputRef.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('仅支持图片')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片最大 5MB')
    return
  }

  const fd = new FormData()
  fd.append('file', file)

  try {
    // ⭐ 改成专用接口
    const res = await axios.post('/api/DetectionSeal/upload', fd)
    
    if (res.data.Success) {
      form.imageUrl = res.data.Url        // ⭐ 字段是 Url（大写）
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.data.Message || '上传失败')
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.Message || '上传失败')
  } finally {
    e.target.value = ''
  }
}

async function handleSave() {
  if (!form.name?.trim()) return ElMessage.warning('请输入名称')
  if (!form.factoryCode) return ElMessage.warning('请选择厂区')
  if (!form.sealType) return ElMessage.warning('请选择类型')
  if (!form.imageUrl) return ElMessage.warning('请上传图片')

  saving.value = true
  try {
      const payload = {
          Id: form.id,
          Name: form.name,
          FactoryCode: form.factoryCode,
          SealType: form.sealType,
          ImageUrl: form.imageUrl,
          Remark: form.remark
      }

      let res
      if (form.id) {
          res = await axios.put(`/api/DetectionSeal/update/${form.id}`, payload)
      } else {
          res = await axios.post('/api/DetectionSeal/create', payload)
      }
    if (res.data.Success) {
      ElMessage.success(res.data.Message || '保存成功')
      dialogVisible.value = false
      loadList()
    } else {
      ElMessage.error(res.data.Message || '保存失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.Message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleToggle(row) {
    const action = row.IsEnabled ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该检测章吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }

  try {
    const res = await axios.post(`/api/DetectionSeal/toggle/${row.Id}`)
    if (res.data.Success) {
      ElMessage.success(res.data.Message || '操作成功')
      loadList()
    } else {
      ElMessage.error(res.data.Message || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.Message || '操作失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除【${row.Name}】吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }

  try {
      const res = await axios.delete(`/api/DetectionSeal/delete/${row.Id}`)
    if (res.data.Success) {
      ElMessage.success('删除成功')
      loadList()
    } else {
      ElMessage.error(res.data.Message || '删除失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.Message || '删除失败')
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.seal-page {
  padding: 16px;
}
</style>