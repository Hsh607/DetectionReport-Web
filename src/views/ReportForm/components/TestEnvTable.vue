<template>
  <div>
    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
      3、检测环境/Test Environment
    </h3>
    <el-button
      type="primary"
      size="small"
      style="margin-bottom: 10px;"
      :disabled="!canModifyStructure"
      @click="emit('addRow')"
    >
      + 新增行
    </el-button>
    <el-table
      :data="testEnv"
      border
      stripe
      style="width: 100%;"
    >
      <!-- 序号 -->
      <el-table-column
        width="80"
        align="center"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            序号<br>
            <span style="font-size: 12px; color: #666;">No.</span>
          </div>
        </template>
        <template #default="scope">
          <span style="color: #606266; font-weight: 500;">
            {{ scope.$index + 1 }}
          </span>
        </template>
      </el-table-column>

      <!-- 检测项目编码 -->
      <el-table-column
        prop="projectCode"
        min-width="130"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            检测项目编码<br>
            <span style="font-size: 12px; color: #666;">Test Item Code</span>
          </div>
        </template>
        <template #default="scope">
          <el-select
            v-model="scope.row.projectCode"
            placeholder="选择项目"
            size="small"
            clearable
            :disabled="isDetail"
            @change="(val) => handleProjectChange(scope.$index, val)"
          >
            <el-option
              v-for="env in envList"
              :key="env.EnvCode"
              :label="env.EnvCode"
              :value="env.EnvCode"
            >
              <span>{{ env.EnvCode }} - {{ env.ProjectName || '' }}</span>
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <!-- 项目 -->
      <el-table-column
        prop="item"
        min-width="120"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            项目<br>
            <span style="font-size: 12px; color: #666;">Item</span>
          </div>
        </template>
        <template #default="scope">
          <div style="line-height: 1.4; padding: 5px 0;">
            <div>{{ splitItemName(scope.row.item).zh }}</div>
            <div style="font-size: 12px; color: #666;">
              {{ splitItemName(scope.row.item).en }}
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 环境温度要求 -->
      <el-table-column
        prop="reqTemp"
        min-width="150"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            环境温度要求（℃）<br>
            <span style="font-size: 12px; color: #666;">Required Ambient Temperature</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-model="scope.row.reqTemp"
            placeholder="请选择项目自动填充，或手动输入"
            size="small"
            clearable
            :disabled="isDetail"
          />
        </template>
      </el-table-column>

      <!-- 检测室环境温度 -->
      <el-table-column
        prop="testTemp"
        min-width="180"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            检测室环境温度（℃）<br>
            <span style="font-size: 12px; color: #666;">Test Room Ambient Temperature</span>
          </div>
        </template>
        <template #default="scope">
          <el-input
            v-model="scope.row.testTemp"
            placeholder="实际温度"
            size="small"
            clearable
            :disabled="isDetail"
          />
        </template>
      </el-table-column>

      <!-- 技术要求（动态加载） -->
      <el-table-column
        prop="techSpecCode"
        min-width="200"
      >
        <template #header>
          <div style="text-align: center; line-height: 1.4;">
            技术要求<br>
            <span style="font-size: 12px; color: #666;">Technical Requirements</span>
          </div>
        </template>
        <template #default="scope">
          <el-select
            v-model="scope.row.techSpecCode"
            placeholder="请先选择项目"
            size="small"
            clearable
            :disabled="isDetail || !scope.row.techOptions || scope.row.techOptions.length === 0"
            @change="(val) => emit('techSpecChange', { index: scope.$index, specId: val })"
          >
            <el-option
              v-for="t in scope.row.techOptions || []"
              :key="t.Id"
              :label="t.Name"
              :value="Number(t.Id)"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="80"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            type="link"
            color="danger"
            size="small"
            :disabled="testEnv.length <= 1 || !canModifyStructure"
            @click="emit('deleteRow', scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
    /* eslint-disable no-undef */
    import { ref, watch, onMounted, nextTick } from 'vue'
    import axios from 'axios'
    import { computed } from 'vue'

    // 只有草稿和已驳回才能增删行
    const canModifyStructure = computed(() => {
        if (props.isDetail) return false
        if (!props.reportStatus) return true
        return props.reportStatus === 'draft' || props.reportStatus === 'rejected'
    })


    const props = defineProps({
        testEnv: Array,
        envList: Array,
        techSpecList: Array,
        isDetail: Boolean,
        reportStatus: String
    })

    const emit = defineEmits(['addRow', 'deleteRow', 'projectCodeChange', 'techSpecChange'])

    // 缓存
    const techCache = ref({})

    // 拆分项目名称
    const splitItemName = (name) => {
        if (!name) return { zh: '', en: '' }
        const text = name.replace(/<br>/g, ' ').trim()
        const zhPattern = /^([\u4e00-\u9fa5\s]+)/
        const zhMatch = text.match(zhPattern)
        if (zhMatch) {
            const zhPart = zhMatch[1].trim()
            const enPart = text.slice(zhMatch[0].length).trim()
            return { zh: zhPart, en: enPart }
        }
        return { zh: text, en: '' }
    }

    const loadTechRequirements = async (row, force = false) => {
        const projectCode = row.projectCode?.trim()
        if (!projectCode) {
            row.techOptions = []
            row.techSpecCode = null
            return
        }
        if (!force && techCache.value[projectCode]) {
            row.techOptions = techCache.value[projectCode]
            if (row.techSpecCode && !row.techOptions.some(t => t.Id === row.techSpecCode)) {
                row.techSpecCode = null
            }
            return
        }
        try {
            const res = await axios.get(`/api/DetectionConfig/tech-requirements-by-project`, {
                params: { projectCode }
            })
            //  确保数据是数组，并拷贝新引用
            const data = Array.isArray(res.data) ? res.data.slice() : []
            techCache.value[projectCode] = data
            row.techOptions = data
            if (row.techSpecCode && !data.some(t => t.Id === Number(row.techSpecCode))) {
                row.techSpecCode = null
            }
        } catch (err) {
            console.error('加载技术要求失败：', err)
            row.techOptions = []
            row.techSpecCode = null
        }
    }

    const refreshAllTechRequirements = async () => {
        if (!props.testEnv) return
        console.log(' 开始刷新所有行的技术要求')
        for (const row of props.testEnv) {
            if (row.projectCode) {
                const projectCode = row.projectCode.trim()
                if (techCache.value[projectCode]) {
                    delete techCache.value[projectCode]
                }
                await loadTechRequirements(row, true)
                console.log(` 刷新后 ${projectCode} 的 techOptions:`, row.techOptions)
            }
        }
        await nextTick()
        console.log(' 所有行刷新完成')
    }

    // 处理项目编码变更
    const handleProjectChange = (index, code) => {
        const row = props.testEnv[index]
        if (!row) return
        emit('projectCodeChange', { index, code })
        loadTechRequirements(row)
    }

    // 监听 testEnv 变化
    watch(
        () => props.testEnv,
        (newVal) => {
            if (!newVal) return
            newVal.forEach(row => {
                if (!row.techOptions) {
                    row.techOptions = []
                }
                if (row.projectCode && row.techOptions.length === 0) {
                    loadTechRequirements(row)
                }
            })
        },
        { immediate: true, deep: true }
    )

    onMounted(() => {
        if (props.testEnv) {
            props.testEnv.forEach(row => {
                if (!row.techOptions) {
                    row.techOptions = []
                }
                if (row.projectCode && row.techOptions.length === 0) {
                    loadTechRequirements(row)
                }
            })
        }
    })

    // 暴露方法给父组件
    defineExpose({
        refreshAllTechRequirements
    })
</script>