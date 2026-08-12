<template>
	<YMTreeList ref="ym" :id="props.id" :padded="props.padded" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTreeList } from '@ui-kit';
import { useMenuService } from '@app/composables/useMenuService';
import { attachElementApi } from '@/utils/attach-element-api';

interface Props {
	id?: string;
	padded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	padded: false
});

const emit = defineEmits<{
	select: [event: Event & { value?: unknown }];
	record: [event: Event & { value?: unknown }];
	popup: [event: Event & { value?: unknown }];
	open: [event: Event & { value?: unknown }];
	change: [event: Event & { value?: unknown }];
}>();

const menuService = useMenuService();

const ym = ref<{ $el: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.$el ?? null);

defineExpose({ root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	attachElementApi(el, { getMenuState: () => menuService.getState() });
	// 经 el.on 注册（YMTreeList 的 on() 启用 select/record/popup/open 派发开关）
	el.on('select', (event: Event & { value?: unknown }) => emit('select', event));
	el.on('record', (event: Event & { value?: unknown }) => emit('record', event));
	el.on('popup', (event: Event & { value?: unknown }) => emit('popup', event));
	el.on('open', (event: Event & { value?: unknown }) => emit('open', event));
	el.on('change', (event: Event & { value?: unknown }) => emit('change', event));
});
</script>
