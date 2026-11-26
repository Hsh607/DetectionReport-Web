import { useUserStore } from '@/stores/user'

export default {
    mounted(el, binding) {
        const userStore = useUserStore()
        if (binding.value && !userStore.hasPermission(binding.value)) {
            el.parentNode?.removeChild(el)
        }
    }
}