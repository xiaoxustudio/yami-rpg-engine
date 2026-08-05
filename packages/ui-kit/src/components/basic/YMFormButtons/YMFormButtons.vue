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
</script>

<template>
	<button :id="idPrefix + '-confirm'" name="confirm">{{ confirmLabel }}</button>
	<button v-if="showApply" :id="idPrefix + '-apply'" name="apply">{{ applyLabel }}</button>
	<button :id="idPrefix + '-cancel'" name="cancel">{{ cancelLabel }}</button>
</template>
