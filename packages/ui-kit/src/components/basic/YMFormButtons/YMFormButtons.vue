<script setup lang="ts">
interface Props {
	idPrefix?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	applyLabel?: string;
	showApply?: boolean;
	confirmDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	idPrefix: '',
	confirmLabel: 'Confirm',
	cancelLabel: 'Cancel',
	applyLabel: 'Apply',
	showApply: false,
	confirmDisabled: false
});

const emit = defineEmits<{
	confirm: [];
	apply: [];
	cancel: [];
}>();

/**
 * 三个按钮同时走**两条**通道：原生 `dispatchEvent`（冒泡）与 Vue emit。
 * 两条通道必须由不同消费者认领，否则会双触发。
 */
const dispatch = (type: 'confirm' | 'apply' | 'cancel', event: MouseEvent): void => {
	(event.currentTarget as HTMLElement).dispatchEvent(new Event(type, { bubbles: true }));
	switch (type) {
		case 'confirm':
			emit('confirm');
			break;
		case 'apply':
			emit('apply');
			break;
		case 'cancel':
			emit('cancel');
			break;
	}
};
</script>

<template>
	<button
		:id="idPrefix + '-confirm'"
		name="confirm"
		hotkey="Ctrl+Enter"
		:disabled="confirmDisabled"
		@click="dispatch('confirm', $event)"
	>
		{{ confirmLabel }}
	</button>
	<button
		v-if="showApply"
		:id="idPrefix + '-apply'"
		name="apply"
		@click="dispatch('apply', $event)"
	>
		{{ applyLabel }}
	</button>
	<button
		:id="idPrefix + '-cancel'"
		name="cancel"
		hotkey="Escape"
		@click="dispatch('cancel', $event)"
	>
		{{ cancelLabel }}
	</button>
</template>

<style module>
:global(:where(button[name='confirm'])) {
	right: 108px;
	bottom: 10px;
}

:global(:where(button[name='cancel'])) {
	right: 10px;
	bottom: 10px;
}

:global(:where(.window-frame:has(button[name='apply']) button[name='confirm'])) {
	right: 206px;
}

:global(:where(.window-frame:has(button[name='apply']) button[name='cancel'])) {
	right: 108px;
}

:global(:where(button[name='apply'])) {
	right: 10px;
	bottom: 10px;
}
</style>
