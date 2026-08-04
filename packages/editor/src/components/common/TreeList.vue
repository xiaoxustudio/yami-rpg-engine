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

const ym = ref<{ root: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

defineExpose({ root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.getMenuState = () => Menu.state;
});
</script>
