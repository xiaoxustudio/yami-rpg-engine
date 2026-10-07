<template>
	<YMTreeList
		ref="ym"
		:id="props.id"
		:padded="props.padded"
		:render-node-extras="renderNodeExtras"
		:render-node-icon="props.nodeIconRenderer ? renderNodeIcon : undefined"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Fragment, h, render, type VNode } from 'vue';
import { YMTreeList } from '@ui-kit';
import { useMenuService } from '@app/composables/useMenuService';
import { attachElementApi } from '@app/utils/attach-element-api';
import { on } from '@app/utils/element-utils';

interface Props {
	id?: string;
	padded?: boolean;
	nodeExtras?: (item: unknown, container: HTMLElement) => VNode | VNode[] | null;
	nodeIconRenderer?: (item: unknown, container: HTMLElement) => VNode | VNode[] | null;
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

const renderNodeExtras = (item: unknown, container: HTMLElement): void => {
	try {
		const vnodes = props.nodeExtras?.(item, container);
		render(vnodes ? h(Fragment as never, vnodes) : null, container);
	} catch (error) {
		console.error('[tree-extras] renderNodeExtras failed:', error);
	}
};

const renderNodeIcon = (item: unknown, container: HTMLElement): void => {
	try {
		const vnodes = props.nodeIconRenderer?.(item, container);
		render(vnodes ? h(Fragment as never, vnodes) : null, container);
	} catch (error) {
		console.error('[tree-icon] renderNodeIcon failed:', error);
	}
};

const ym = ref<{ $el: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.$el ?? null);

defineExpose({ root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	attachElementApi(el, { getMenuState: () => menuService.getState() });
	on(el, 'select', (event: Event & { value?: unknown }) => emit('select', event));
	on(el, 'record', (event: Event & { value?: unknown }) => emit('record', event));
	on(el, 'popup', (event: Event & { value?: unknown }) => emit('popup', event));
	on(el, 'open', (event: Event & { value?: unknown }) => emit('open', event));
	on(el, 'change', (event: Event & { value?: unknown }) => emit('change', event));
});
</script>
