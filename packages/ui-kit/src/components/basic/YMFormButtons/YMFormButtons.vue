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
		hotkey="Ctrl+Enter"
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
		hotkey="Escape"
		@click="dispatch('cancel', $event)"
		>{{ cancelLabel }}</button
	>
</template>

<style module>
:global(:where(button[name="confirm"])) {
	right: 108px;
	bottom: 10px;
}

:global(:where(button[name="cancel"])) {
	right: 10px;
	bottom: 10px;
}

:global(:where(.window-frame:has(button[name="apply"]) button[name="confirm"])) {
	right: 206px;
}

:global(:where(.window-frame:has(button[name="apply"]) button[name="cancel"])) {
	right: 108px;
}

:global(:where(button[name="apply"])) {
	right: 10px;
	bottom: 10px;
}
</style>
