<template>
	<empty-state ref="root" :id="props.id" :message="props.message" :icon="props.icon" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface EmptyStateElement extends HTMLElement {
	setMessage(msg: string): void;
}

interface Props {
	id?: string;
	message?: string;
	icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
	message: '',
	icon: ''
});

const root = ref<EmptyStateElement | null>(null);

const setMessage = (msg: string): void => {
	root.value?.setMessage(msg);
};

defineExpose({ setMessage, root });
</script>
