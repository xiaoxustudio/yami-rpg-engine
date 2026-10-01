<script setup lang="ts">
import { onMounted, provide, reactive, ref, watch } from 'vue';
import { DetailBoxKey, type DetailBoxContext } from './context';

interface Props {
	id?: string;
	open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	open: false
});

const emit = defineEmits<{
	toggle: [value: 'open' | 'closed'];
}>();

const state = reactive({
	open: props.open
});

const root = ref<HTMLElement | null>(null);

const isSummary = (node: Element): boolean => node.classList.contains('detail-summary');

const apply = (open: boolean): void => {
	const el = root.value;
	if (!el) return;
	for (const node of el.children) {
		if (!isSummary(node)) {
			node.classList.toggle('hidden', !open);
		}
	}
};

const open = (): void => {
	if (state.open) return;
	state.open = true;
	apply(true);
	emit('toggle', 'open');
};

const close = (): void => {
	if (!state.open) return;
	state.open = false;
	apply(false);
	emit('toggle', 'closed');
};

const toggle = (): void => (state.open ? close() : open());

provide<DetailBoxContext>(DetailBoxKey, { toggle, isOpen: () => state.open });

defineExpose({ toggle, open, close, root });

watch(
	() => props.open,
	(val) => (val ? open() : close())
);

onMounted(() => {
	apply(state.open);
});
</script>

<template>
	<div
		ref="root"
		class="detail-box"
		:class="$style.box"
		:id="props.id"
		:open="state.open ? '' : undefined"
	>
		<slot />
	</div>
</template>

<style module>
.box {
	display: block;
}
</style>
