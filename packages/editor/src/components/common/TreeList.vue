<template>
	<YMTreeList ref="ym" :id="props.id" :padded="props.padded" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTreeList } from '@ui-kit';
import { Menu } from '@/components/menu-list';

interface Props {
	id?: string;
	padded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	padded: false
});

const emit = defineEmits<{
	select: [event: any];
	record: [event: any];
	popup: [event: any];
	open: [event: any];
}>();

const ym = ref<{ $el: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.$el ?? null);

defineExpose({ root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.getMenuState = () => Menu.state;
	// 经 el.on 注册（YMTreeList 的 on() 启用 select/record/popup/open 派发开关）
	el.on('select', (event: any) => emit('select', event));
	el.on('record', (event: any) => emit('record', event));
	el.on('popup', (event: any) => emit('popup', event));
	el.on('open', (event: any) => emit('open', event));
});
</script>
