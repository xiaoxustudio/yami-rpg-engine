<template>
	<div class="empty-state" ref="root" :id="props.id">
		<div class="empty-icon" v-html="iconHtml"></div>
		<div class="empty-text">{{ message }}</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
	id?: string;
	message?: string;
	icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
	message: '',
	icon: ''
});

const root = ref<HTMLElement | null>(null);

const message = ref(props.message);

const defaultIcon =
	'<svg viewBox="0 0 24 24" width="48" height="48" ' +
	'fill="none" stroke="currentColor" stroke-width="1.5">' +
	'<rect x="3" y="4" width="18" height="16" rx="2"/>' +
	'<path d="M3 9h18"/></svg>';

const iconHtml = computed(() => {
	if (!props.icon) return defaultIcon;
	const d = document.createElement('div');
	d.textContent = props.icon;
	return d.innerHTML;
});

const setMessage = (msg: string): void => {
	message.value = msg;
};

defineExpose({ setMessage, root });
</script>

<style scoped>
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 32px;
	color: rgba(128, 128, 128, 0.9);
	text-align: center;
	user-select: none;
}

.empty-state .empty-icon {
	color: rgba(128, 128, 128, 0.7);
}

.empty-state .empty-text {
	font-size: 13px;
	line-height: 1.5;
	max-width: 280px;
}
</style>
