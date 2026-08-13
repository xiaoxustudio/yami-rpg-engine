<script setup lang="ts">
interface Props {
	idPrefix?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	applyLabel?: string;
	showApply?: boolean;
}

withDefaults(defineProps<Props>(), {
	idPrefix: '',
	confirmLabel: 'Confirm',
	cancelLabel: 'Cancel',
	applyLabel: 'Apply',
	showApply: false
});

const dispatch = (type: string, event: MouseEvent): void => {
	(event.currentTarget as HTMLElement).dispatchEvent(new Event(type, { bubbles: true }));
};
</script>

<template>
	<button
		:id="idPrefix + '-confirm'"
		name="confirm"
		@click="dispatch('confirm', $event)"
		>{{ confirmLabel }}</button
	>
	<button
		v-if="showApply"
		:id="idPrefix + '-apply'"
		name="apply"
		@click="dispatch('apply', $event)"
		>{{ applyLabel }}</button
	>
	<button
		:id="idPrefix + '-cancel'"
		name="cancel"
		@click="dispatch('cancel', $event)"
		>{{ cancelLabel }}</button
	>
</template>
