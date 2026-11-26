import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 通用列表筛选条件 store
 * 每个列表页按 route.name 各存一份，互不干扰
 * 用 sessionStorage 做持久化：关闭浏览器标签页即清空
 */
export const useListFilterStore = defineStore('listFilter', () => {
    // 内存缓存：{ [pageKey]: { ...filters } }
    const cache = ref({})

    const STORAGE_PREFIX = 'list_filters_'

    // 读取某页的筛选条件（优先内存，其次 sessionStorage）
    function getFilters(pageKey) {
        if (cache.value[pageKey]) return cache.value[pageKey]
        try {
            const raw = sessionStorage.getItem(STORAGE_PREFIX + pageKey)
            const parsed = raw ? JSON.parse(raw) : {}
            cache.value[pageKey] = parsed
            return parsed
        } catch (e) {
            console.warn('[listFilter] 读取失败', e)
            return {}
        }
    }

    // 写入某页的筛选条件
    function setFilters(pageKey, filters) {
        cache.value[pageKey] = { ...filters }
        try {
            sessionStorage.setItem(
                STORAGE_PREFIX + pageKey,
                JSON.stringify(filters)
            )
        } catch (e) {
            console.warn('[listFilter] 写入失败', e)
        }
    }

    // 清空某页
    function clearFilters(pageKey) {
        delete cache.value[pageKey]
        try {
            sessionStorage.removeItem(STORAGE_PREFIX + pageKey)
        } catch (e) {
            console.warn('[listFilter] 清除失败', e)
        }
    }

    return { getFilters, setFilters, clearFilters }
})