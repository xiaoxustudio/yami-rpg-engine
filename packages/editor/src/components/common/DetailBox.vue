<template>
	<div class="detail-box" ref="root" :id="props.id" :open="state.open ? '' : undefined">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

interface Props {
	id?: string;
	open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	open: false
});

const emit = defineEmits<{
	toggle: [value: string];
}>();

const state = reactive({
	open: false,
	toggleEventEnabled: false
});

const root = ref<HTMLElement | null>(null);

const isSummary = (node: Element): boolean =>
	node.classList.contains('detail-summary') ||
	node.tagName.toLowerCase() === 'detail-summary';

const apply = (open: boolean): void => {
	const el = root.value;
	if (!el) return;
	for (const node of el.children) {
		if (!isSummary(node)) {
			if (open) {
				node.classList.remove('hidden');
			} else {
				node.classList.add('hidden');
			}
		}
	}
};

const dispatchToggle = (value: string): void => {
	emit('toggle', value);
	const el = root.value;
	if (state.toggleEventEnabled) {
		const toggle = new Event('toggle');
		toggle.value = value;
		el?.dispatchEvent(toggle);
	}
};

const open = (): void => {
	if (state.open) return;
	state.open = true;
	apply(true);
	dispatchToggle('open');
};

const close = (): void => {
	if (!state.open) return;
	state.open = false;
	apply(false);
	dispatchToggle('closed');
};

const toggle = (): void => (state.open ? close() : open());

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	if (type === 'toggle') {
		state.toggleEventEnabled = true;
	}
};

defineExpose({ toggle, open, close, on, root });

watch(() => props.open, (val) => (val ? open() : close()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.toggle = toggle;
	el.open = open;
	el.close = close;
	el.on = on;
	if (props.open) {
		open();
	}
});
</script>
